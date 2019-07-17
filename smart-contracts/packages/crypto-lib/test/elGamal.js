const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { assert } = chai;
const { BigInteger: BigInt } = require('jsbn');

const ElGamal = require('../src/elGamal');
const { SOLIDITY_MAX_INT, randomValidBigInt } = require('../src/utils');

const isElGamalWithValidFields = (instance, millerRabinPasses = 300000) => {
  const moduleP = instance.getModuleP();
  assert(moduleP);
  assert(new BigInt(moduleP).isProbablePrime(millerRabinPasses)); // Check if really prime

  const generatorG = instance.getGeneratorG();
  assert(generatorG);

  const publicKey = instance.getPublicKey();
  assert(publicKey);

  assert.doesNotThrow(() => instance.getPrivateKey());

  const privateKey = instance.getPrivateKey();
  assert(privateKey);
};

describe('ElGamal', () => {
  const biggerThanMax = SOLIDITY_MAX_INT.add(BigInt.ONE);

  let randomModuleP;
  let randomGeneratorG;
  let randomPublicKey;

  beforeEach(async () => {
    randomModuleP = await randomValidBigInt();
    randomGeneratorG = await randomValidBigInt();
    randomPublicKey = await randomValidBigInt();
  });

  describe('constructor', () => {
    it('works properly', () => {
      const instance = new ElGamal(randomModuleP, randomGeneratorG, randomPublicKey);
      assert.equal(instance.getModuleP(), randomModuleP.toString());
      assert.equal(instance.getGeneratorG(), randomGeneratorG.toString());
      assert.equal(instance.getPublicKey(), randomPublicKey.toString());
      assert.equal(instance.getPrivateKey(), null);
    });

    describe('throws when', () => {
      it('moduleP is bigger than Solidity uint256 max value', () => {
        assert.throws(
          () => new ElGamal(biggerThanMax, randomGeneratorG, randomPublicKey),
          /Basis Module P can not be bigger than Solidity uint256 max value!/,
        );
      });

      it('generatorG is bigger than Solidity uint256 max value', () => {
        assert.throws(
          () => new ElGamal(randomModuleP, biggerThanMax, randomPublicKey),
          /Basis Generator G can not be bigger than Solidity uint256 max value!/,
        );
      });

      it('publicKey is bigger than Solidity uint256 max value', () => {
        assert.throws(
          () => new ElGamal(randomModuleP, randomGeneratorG, biggerThanMax),
          /Public Key Key can not be bigger than Solidity uint256 max value!/,
        );
      });
    });
  });

  describe('#setPrivateKey', () => {
    let instance;

    beforeEach(() => {
      instance = new ElGamal(randomModuleP, randomGeneratorG, randomPublicKey);
    });

    it('sets Private Key properly', async () => {
      const randomPrivateKey = await randomValidBigInt();

      instance.setPrivateKey(randomPrivateKey);

      assert.equal(instance.getPrivateKey(), randomPrivateKey.toString());
    });

    it('throws on Private Key is bigger than Solidity uint256 max value', () => {
      assert.throws(
        () => instance.setPrivateKey(biggerThanMax),
        /Private Key can not be bigger than Solidity uint256 max value!/,
      );
      assert.equal(instance.getPrivateKey(), null);
    });
  });

  it('#toString works properly', async () => {
    const instance = new ElGamal(1, 2, 3);
    assert.equal(
      instance.toString(),
      'ElGamal(moduleP: 1, generatorG: 2, publicKey: 3, privateKey: null)',
    );

    const randomPrivateKey = await randomValidBigInt();
    instance.setPrivateKey(randomPrivateKey);
    assert.equal(
      instance.toString(),
      `ElGamal(moduleP: 1, generatorG: 2, publicKey: 3, privateKey: ${randomPrivateKey.toString()})`,
    );
  });

  describe('#generateRandom', () => {
    describe('creates proper ElGamal instance', () => {
      it('with min (4) prime bits length', async () => {
        const instance = await ElGamal.generateRandom(4);
        isElGamalWithValidFields(instance);
      });

      it('with default & max (256) prime bits length', async () => {
        const instance = await ElGamal.generateRandom();
        isElGamalWithValidFields(instance);
      });

      it('with non-standart (113) prime bits length', async () => {
        const instance = await ElGamal.generateRandom(113);
        isElGamalWithValidFields(instance);
      });
    });

    describe('throws an error on prime bits length', () => {
      it('less than min (4)', async () => {
        await assert.isRejected(
          ElGamal.generateRandom(2),
          /System Basis Prime Bits can not be lower than 4!/,
        );
      });

      it('more than max (256)', async () => {
        await assert.isRejected(
          ElGamal.generateRandom(4096),
          /System Basis Prime Bits can not be bigger than 256!/,
        );
      });
    });
  });

  describe('encryption', () => {
    const data = 314159265359;

    const encryptedDataVariant = {
      a: '28207599145896165307141639222893659947558227666663921611297528744432083158976',
      b: '2799460656900035928959280775035997342002511129757465988871086732916384615048',
    };

    let instance;
    let randomData;
    let entropy;

    beforeEach(() => {
      instance = ElGamal.buildWithPrivateKey(
        '32862200562630521788980472968838646784763947907008155349436315233456083129987',
        '20166087976232711545763857867279624494402297581792257844354215842729200821654',
        '480428482696831915551622765168415499179372926067818003084587470756582717242',
        '29039715855515570891974418182804268103834027039725601166317243826465852655370',
      );

      randomData = Math.floor(Math.random() * Math.floor(10000));
      entropy = Math.floor(Math.random() * Math.floor(10000000));
    });

    describe('#encrypt', () => {
      it('works properly', async () => {
        const encryptedData = await instance.encrypt(randomData, entropy);

        assert(encryptedData.a);
        assert(encryptedData.b);
      });

      it('throws on entropy is missing', async () => {
        await assert.isRejected(
          instance.encrypt(randomData),
          /Entropy must present!/,
        );
      });

      it('throws on entropy is equal One', async () => {
        await assert.isRejected(
          instance.encrypt(randomData, 1),
          /Entropy for Session Key must be Integer bigger than 1!/,
        );
      });

      it('throws on entropy is negative', async () => {
        await assert.isRejected(
          instance.encrypt(randomData, -1),
          /Entropy for Session Key must be Integer bigger than 1!/,
        );
      });

      it('throws on entropy equal to moduleP', async () => {
        const moduleP = new BigInt(instance.getModuleP());

        await assert.isRejected(
          instance.encrypt(randomData, moduleP),
          /Entropy for Session Key can not be bigger or equal Basis Module P!/,
        );
      });

      it('throws on entropy bigger than moduleP', async () => {
        const biggerThanModuleP = new BigInt(instance.getModuleP()).add(BigInt.ONE);

        await assert.isRejected(
          instance.encrypt(randomData, biggerThanModuleP),
          /Entropy for Session Key can not be bigger or equal Basis Module P!/,
        );
      });

      it('throws on data is missing', async () => {
        await assert.isRejected(
          instance.encrypt(null, 1),
          /Data must present!/,
        );

        await assert.isRejected(
          instance.encrypt(undefined, 1),
          /Data must present!/,
        );
      });

      it('throws on data equal to moduleP', async () => {
        const moduleP = new BigInt(instance.getModuleP());

        await assert.isRejected(
          instance.encrypt(moduleP, entropy),
          /Data to encrypt can not be bigger or equal Basis Module P!/,
        );
      });

      it('throws on data bigger than moduleP', async () => {
        const biggerThanModuleP = new BigInt(instance.getModuleP()).add(BigInt.ONE);

        await assert.isRejected(
          instance.encrypt(biggerThanModuleP, entropy),
          /Data to encrypt can not be bigger or equal Basis Module P!/,
        );
      });
    });

    describe('#getDecryptor', () => {
      it('works properly', async () => {
        const decryptor = instance.getDecryptor(encryptedDataVariant);

        assert.equal(
          decryptor,
          '1006123396400992564947480137333847875350450816944801336951119695244768265283',
        );
      });

      it('throws on invalid data', async () => {
        const encryptedData = await instance.encrypt(randomData, entropy);

        delete encryptedData.a;

        assert.throws(
          () => instance.getDecryptor(encryptedData),
          /Can not get decryptor — "A" is not present!/,
        );
      });
    });

    describe('#decrypt', () => {
      describe('works properly', () => {
        it('with existing data', async () => {
          const decryptedData = await instance.decrypt(encryptedDataVariant);

          assert.equal(decryptedData, data.toString());
        });

        it('with random data', async () => {
          const encryptedData = await instance.encrypt(randomData, entropy);
          const decryptedData = await instance.decrypt(encryptedData, entropy);

          assert.equal(decryptedData, randomData.toString());
        });
      });
    });
  });
});
