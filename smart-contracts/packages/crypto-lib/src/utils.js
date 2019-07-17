// Based on MIT licensed work of Kristóf Poduszló in 2016 https://github.com/kripod/elgamal.js
const randomBytes = require('randombytes');
const { BigInteger: BigInt } = require('jsbn');

const BIG_TWO = new BigInt('2');
const SOLIDITY_MAX_INT = BIG_TWO.pow('256').subtract(BigInt.ONE);

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

/**
 * @returns {Promise<BigInt>}
 */
const getRandomNbitBigInt = async (bits) => {
  // Generate random bytes with the length of the range
  const randomBigInt = new BigInt(randomBytesHex(bits), 16);

  // Trim the result and then ensure that the highest bit is set
  return trimBigInt(randomBigInt, bits)
    .setBit(bits - 1)
    .or(BigInt.ONE);
};

// Exported functions

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

  if (max.compareTo(SOLIDITY_MAX_INT) > 0) {
    throw new Error('Can not generate BigInt bigger than Solidity uint256 max value!');
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

/**
 * @returns {Promise<BigInt>}
 */
const getRandomBigPrime = async (bits = 256, millerRabinPasses = 100000) => {
  let randomBigInt = await getRandomNbitBigInt(bits);

  while (!randomBigInt.isProbablePrime(millerRabinPasses)) {
    randomBigInt = randomBigInt.add(BIG_TWO);
  }

  return trimBigInt(randomBigInt, bits).setBit(bits - 1);
};

const randomValidBigInt = () => getRandomBigInt(BigInt.ONE, SOLIDITY_MAX_INT);

const checkEveryFieldIsSame = (objects, fieldName) => {
  const isSame = objects.map(obj => obj[fieldName]).every((val, i, arr) => val === arr[0]);

  if (!isSame) {
    throw new Error(`Not all objects have the same ${fieldName}!`);
  }

  return isSame;
};

module.exports = {
  BIG_TWO,
  SOLIDITY_MAX_INT,
  getRandomBigInt,
  getRandomBigPrime,
  randomValidBigInt,
  checkEveryFieldIsSame,
  trimBigInt,
};
