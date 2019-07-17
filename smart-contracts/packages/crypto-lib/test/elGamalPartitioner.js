const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const RSA = require('node-rsa');

chai.use(chaiAsPromised);

const { assert } = chai;

const ElGamal = require('../src/elGamal');
const ElGamalPartitioner = require('../src/elGamalPartitioner');
const { checkEveryFieldIsSame } = require('../src/utils');

describe('ElGamalPartitioner', () => {
  let elGamal;

  before(async () => {
    elGamal = await ElGamal.generateRandom();
  });

  describe('.partition', () => {
    describe('throws when', () => {
      it('invalid ElGamal passed', () => {
        const expectedError = /Only instances of ElGamal can be partitioned!/;

        assert.throws(() => ElGamalPartitioner.partition(null), expectedError);
        assert.throws(() => ElGamalPartitioner.partition(undefined), expectedError);
        assert.throws(() => ElGamalPartitioner.partition(1), expectedError);
        assert.throws(() => ElGamalPartitioner.partition('test'), expectedError);
        assert.throws(() => ElGamalPartitioner.partition({}), expectedError);
      });

      it('partsCount is less than 2', () => {
        const expectedError = /Parts Count can not be less than 2!/;

        assert.throws(() => ElGamalPartitioner.partition(elGamal, 1), expectedError);
        assert.throws(() => ElGamalPartitioner.partition(elGamal, 0), expectedError);
        assert.throws(() => ElGamalPartitioner.partition(elGamal, -1), expectedError);
      });

      it('partsCount is more than 255', () => {
        assert.throws(
          () => ElGamalPartitioner.partition(elGamal, 256),
          /Parts Count can not be more than 255!/,
        );
      });

      it('partsThreshold is bigger than partsCount', () => {
        assert.throws(
          () => ElGamalPartitioner.partition(elGamal, 2, 3),
          /Parts Threshold can not be more than Parts Count!/,
        );
      });

      it('partsThreshold is less than 1', () => {
        const expectedError = /Parts Threshold can not less than 1!/;

        assert.throws(() => ElGamalPartitioner.partition(elGamal, 2, 0), expectedError);
        assert.throws(() => ElGamalPartitioner.partition(elGamal, 2, -1), expectedError);
      });

      it('padLength is bigger than 1024', () => {
        assert.throws(
          () => ElGamalPartitioner.partition(elGamal, 2, 2, 2048),
          /Pad Length can not be more than 1024!/,
        );
      });
    });

    it('returns proper array of parts', () => {
      const parts = ElGamalPartitioner.partition(elGamal, 3, 2);
      assert.equal(parts.length, 3);

      assert(checkEveryFieldIsSame(parts, 'partsCount'));
      assert(checkEveryFieldIsSame(parts, 'partsThreshold'));
      assert(checkEveryFieldIsSame(parts, 'moduleP'));
      assert(checkEveryFieldIsSame(parts, 'generatorG'));
      assert(checkEveryFieldIsSame(parts, 'publicKey'));
      assert(checkEveryFieldIsSame(parts, 'privateKeyHash'));
      assert(checkEveryFieldIsSame(parts, 'signaturePublicKey'));

      parts.forEach((part) => {
        assert('privateKeyPart' in part);
        assert('privateKeyPartHash' in part);
      });
    });
  });

  describe('.combine', () => {
    describe('throws when', () => {
      let parts;

      beforeEach(() => {
        parts = ElGamalPartitioner.partition(elGamal, 4, 3);
      });

      describe('one part has invalid field', () => {
        const expectedErrorPattern = /Not all objects have the same/;

        it('partsCount', () => {
          parts[1].partsCount = 5;

          assert.throws(() => ElGamalPartitioner.combine(parts), expectedErrorPattern);
        });

        it('partsThreshold', () => {
          parts[1].partsThreshold = 5;

          assert.throws(() => ElGamalPartitioner.combine(parts), expectedErrorPattern);
        });

        it('moduleP', () => {
          parts[1].partsThreshold = 0;

          assert.throws(() => ElGamalPartitioner.combine(parts), expectedErrorPattern);
        });

        it('generatorG', () => {
          parts[1].generatorG = 0;

          assert.throws(() => ElGamalPartitioner.combine(parts), expectedErrorPattern);
        });

        it('publicKey', () => {
          parts[1].publicKey = 0;

          assert.throws(() => ElGamalPartitioner.combine(parts), expectedErrorPattern);
        });

        it('privateKeyHash', () => {
          parts[1].privateKeyHash = 0;

          assert.throws(() => ElGamalPartitioner.combine(parts), expectedErrorPattern);
        });
      });

      it('passed empty parts passed', () => {
        assert.throws(() => ElGamalPartitioner.combine([]), /Hashed Parts is Empty!/);
      });

      it('passed more parts then needed', () => {
        parts.push({});

        assert.throws(() => ElGamalPartitioner.combine(parts), /Too many Hashed Parts!/);
      });

      it('passed less parts then needed', () => {
        assert.throws(() => ElGamalPartitioner.combine(parts.slice(2)), /Not enough Hashed Parts!/);
      });

      it('one part privateKeyPartHash has been damaged', () => {
        const rsaKey = new RSA({ key: 4096 });
        parts[0].privateKeyPartHash = rsaKey.sign('1232');

        assert.throws(() => ElGamalPartitioner.combine(parts), /Hashed Part .+ hash is wrong!/);
      });

      it('one part privateKeyPart has been damaged', () => {
        parts[0].privateKeyPart = 13;

        assert.throws(() => ElGamalPartitioner.combine(parts), /Hashed Part .+ hash is wrong!/);
      });

      it.skip('one part has been faked which produce wrong rebuilt data', () => {
        const rsaKey = new RSA({ key: 4096 });
        const fakedPart = '80133a969c67296fc385c50ddb58937ffc92c8797ff14a1d24076ce52f057c0ba71c2d03534805ee410f0323934f9fb0234ef8192e8902ad0753de6f725ba7b854e5356cb51e36a09f2b1e475b0a493af9d9b1de8ece6e336a472135cc508aa2c43529095413924c3ba9905542838aa93a775d4e8da5292576487f7e14357681c02';

        parts[0].signaturePublicKey = rsaKey.exportKey('components-public-pem');
        parts[0].privateKeyPart = fakedPart;
        parts[0].privateKeyPartHash = rsaKey.sign(fakedPart);

        assert.throws(
          () => ElGamalPartitioner.combine(parts),
          /One of Hashed Parts has wrong Private Key hash!/,
        );
      });
    });

    it('returns proper ElGamal instance', () => {
      const parts = ElGamalPartitioner.partition(elGamal, 255, 254);
      const rebuiltElGamal = ElGamalPartitioner.combine(parts);

      assert.deepStrictEqual(rebuiltElGamal, elGamal);
    });
  });
});
