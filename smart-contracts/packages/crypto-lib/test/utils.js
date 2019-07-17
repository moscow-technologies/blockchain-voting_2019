const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { assert } = chai;
const { BigInteger: BigInt } = require('jsbn');

const utils = require('../src/utils');

describe('utils', () => {
  describe('#getRandomBigInt', () => {
    it('works properly with valid params', async () => {
      const randomBigInt = await utils.getRandomBigInt(BigInt.ONE, utils.SOLIDITY_MAX_INT);

      assert.notEqual(randomBigInt.toString(), '0');
      assert.notEqual(randomBigInt.toString(), '1');
      assert.notEqual(randomBigInt.toString(), utils.SOLIDITY_MAX_INT.toString());
    });

    describe('throws when', () => {
      it('Min value less than 0', async () => {
        await assert.isRejected(
          utils.getRandomBigInt(new BigInt('-1'), utils.BIG_TWO),
          /Min value can not be less or equal 0!/,
        );
      });

      it('Min value equals 0', async () => {
        await assert.isRejected(
          utils.getRandomBigInt(BigInt.ZERO, utils.BIG_TWO),
          /Min value can not be less or equal 0!/,
        );
      });

      it('Min value equals Max', async () => {
        await assert.isRejected(
          utils.getRandomBigInt(utils.BIG_TWO, utils.BIG_TWO),
          /Min value can not be more or equal Max value!/,
        );
      });

      it('Min value more than Max', async () => {
        await assert.isRejected(
          utils.getRandomBigInt(utils.BIG_TWO, BigInt.ONE),
          /Min value can not be more or equal Max value!/,
        );
      });

      it('Max value more than Solidity uint256 max value', async () => {
        await assert.isRejected(
          utils.getRandomBigInt(BigInt.ONE, utils.SOLIDITY_MAX_INT.add(BigInt.ONE)),
          /Can not generate BigInt bigger than Solidity uint256 max value!/,
        );
      });
    });
  });

  describe('#getRandomBigPrime', () => {
    it('works with default values', async () => {
      const randomPrime = await utils.getRandomBigPrime();

      assert(randomPrime.isProbablePrime()); // Check if really prime
    });

    it('works with custom values', async () => {
      const randomPrime = await utils.getRandomBigPrime(32, 100001);

      assert(randomPrime.isProbablePrime()); // Check if really prime
    });
  });
});
