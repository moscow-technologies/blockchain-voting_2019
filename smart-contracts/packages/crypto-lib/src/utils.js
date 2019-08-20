// Based on MIT licensed work of Kristóf Poduszló in 2016 https://github.com/kripod/elgamal.js
const randomBytes = require('randombytes');
const { BigInteger: BigInt } = require('jsbn');

const KEY_BIT_LENGTH = 1024;
const CRYPTO_MAX_INT = BigInt.ONE.shiftLeft(KEY_BIT_LENGTH + 1).subtract(BigInt.ONE);

// Helper functions

/**
 * @returns {String}
 */
const randomBytesHex = bits => randomBytes(Math.ceil(bits / 8)).toString('hex');

/**
 * @returns {BigInt}
 */
const trimBigInt = (bigInt, bits) => {
  const trimLength = bigInt.bitLength() - bits;
  return trimLength > 0 ? bigInt.shiftRight(trimLength) : bigInt;
};

// exported functions

/**
 * @returns {Promise<BigInt>}
 */
const getRandomBigInt = async (min, max) => {
  if (min.compareTo(BigInt.ZERO) <= 0) {
    throw new Error('Min value can not be less or equal 0!');
  }

  if (min.compareTo(max) >= 0) {
    throw new Error('Min value can not be more or equal Max value!');
  }

  if (max.compareTo(CRYPTO_MAX_INT) > 0) {
    console.log(`max: ${max.toString()}`);
    console.log(`crypto: ${CRYPTO_MAX_INT.toString()}`);
    console.log(`compare: ${max.compareTo(CRYPTO_MAX_INT)}`);
    throw new Error('Can not generate BigInt bigger than crypto max value!');
  }

  const rangeBitLength = max
    .subtract(min)
    .subtract(BigInt.ONE)
    .bitLength();

  let randomBigInt;
  do {
    randomBigInt = new BigInt(randomBytesHex(rangeBitLength), 16).add(min);
  } while (randomBigInt.compareTo(max) >= 0);

  return randomBigInt;
};

const randomValidBigInt = () => getRandomBigInt(BigInt.ONE, CRYPTO_MAX_INT);

const checkEveryFieldIsSame = (objects, fieldName) => {
  const isSame = objects.map(obj => obj[fieldName]).every((val, i, arr) => val === arr[0]);

  if (!isSame) {
    throw new Error(`Not all objects have the same ${fieldName}!`);
  }

  return isSame;
};

module.exports = {
  CRYPTO_MAX_INT,
  KEY_BIT_LENGTH,

  getRandomBigInt,
  randomValidBigInt,
  checkEveryFieldIsSame,
  trimBigInt,
};
