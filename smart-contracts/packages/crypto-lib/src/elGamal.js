// Based on MIT licensed work of Kristóf Poduszló in 2016 https://github.com/kripod/elgamal.js
const ethers = require('ethers');
const { BigInteger: BigInt } = require('jsbn');

const {
  KEY_BIT_LENGTH, CRYPTO_MAX_INT, getRandomBigInt, trimBigInt,
} = require('./utils');


class ElGamal {
  constructor(moduleP, generatorG, publicKey) {
    this.moduleP = new BigInt(moduleP.toString());
    if (this.moduleP.compareTo(CRYPTO_MAX_INT) >= 0) {
      this.moduleP = null;
      throw new Error(`Basis Module P can not be bigger than ${KEY_BIT_LENGTH}-bit value!`);
    }

    this.Q = this.moduleP.subtract(BigInt.ONE).shiftRight(1);

    this.generatorG = new BigInt(generatorG.toString());
    if (this.generatorG.compareTo(CRYPTO_MAX_INT) >= 0) {
      this.generatorG = null;
      throw new Error(`Basis Generator G can not be bigger than ${KEY_BIT_LENGTH}-bit value!`);
    }

    this.publicKey = new BigInt(publicKey.toString());
    if (this.publicKey.compareTo(CRYPTO_MAX_INT) >= 0) {
      this.publicKey = null;
      throw new Error(`Public Key Key can not be bigger than ${KEY_BIT_LENGTH}-bit value!`);
    }

    this.privateKey = null;
  }

  static buildWithPrivateKey(moduleP, generatorG, publicKey, privateKey) {
    const elGamal = new ElGamal(moduleP, generatorG, publicKey);

    elGamal.setPrivateKey(privateKey);

    return elGamal;
  }

  setPrivateKey(privateKey) {
    this.privateKey = new BigInt(privateKey.toString());

    if (this.privateKey.compareTo(CRYPTO_MAX_INT) >= 0) {
      this.privateKey = null;
      throw new Error('Private Key can not be bigger than max value!');
    }
  }

  toString() {
    return `ElGamal(moduleP: ${this.getModuleP()}, generatorG: ${this.getGeneratorG()}, publicKey: ${this.getPublicKey()}, privateKey: ${this.getPrivateKey()})`;
  }

  getModuleP() {
    return this.moduleP.toString();
  }

  getGeneratorG() {
    return this.generatorG.toString();
  }

  getPrivateKey() {
    return this.privateKey ? this.privateKey.toString() : null;
  }

  getPublicKey() {
    return this.publicKey.toString();
  }

  /**
   * Retuns key verification hash which allows to encsure that all cryptosystem
   * params are set correctly
   * @return {String} - sha256 hash of moduleP|generatorG|publicKey
   */
  getKeyVerificationHash() {
    return ethers.utils.id([
      this.moduleP.toString(),
      this.generatorG.toString(),
      this.publicKey.toString(),
    ].join('|'));
  }

  /**
   * @returns {BigInt}
   */
  getDecryptor(encryptedData) {
    if (!('a' in encryptedData)) {
      throw new Error('Can not get decryptor — "A" is not present!');
    }

    return new BigInt(encryptedData.a.toString())
      .modInverse(this.moduleP)
      .modPow(this.privateKey, this.moduleP);
  }

  /**
   * @returns {Promise<{a: string, b: string}>}
   */
  async encrypt(data, entropy) {
    if (!data) {
      throw new Error('Data must present!');
    }

    if (!entropy) {
      throw new Error('Entropy must present!');
    }

    const dataAsBI = new BigInt(data.toString());
    const entropyAsBI = new BigInt(entropy.toString());

    if (dataAsBI.compareTo(this.Q) >= 0) {
      throw new Error('Data to encrypt can not be bigger or equal that (P-1)/2!');
    }

    if (entropyAsBI.compareTo(BigInt.ONE) <= 0) {
      throw new Error('Entropy for Session Key must be Integer bigger than 1!');
    }

    if (entropyAsBI.compareTo(this.moduleP) >= 0) {
      throw new Error('Entropy for Session Key can not be bigger or equal Basis Module P!');
    }

    const randomBigInt = await getRandomBigInt(BigInt.ONE, this.moduleP.subtract(BigInt.ONE));
    const xoredRandomBigInt = randomBigInt.xor(entropyAsBI);
    const sessionKey = trimBigInt(xoredRandomBigInt, this.moduleP.bitLength() - 1);
    const squaredData = dataAsBI.modPow(new BigInt('2'), this.moduleP);

    const a = this.generatorG.modPow(sessionKey, this.moduleP).toString();
    const b = this.publicKey
      .modPow(sessionKey, this.moduleP)
      .multiply(squaredData)
      .remainder(this.moduleP)
      .toString();

    // ElGamal Ciphertext, usually named (c_1, c_2)
    return { a, b };
  }

  /**
   * @returns {Promise<string>}
   */
  async decrypt(encryptedData) {
    const decryptor = this.getDecryptor(encryptedData);

    const squared = new BigInt(encryptedData.b.toString())
      .multiply(decryptor)
      .remainder(this.moduleP);

    const criterion = squared.modPow(this.moduleP.subtract(BigInt.ONE).divide(new BigInt('2')), this.moduleP);

    if (criterion.compareTo(BigInt.ONE) !== 0) {
      throw new Error('Data is incorrect: encrypted value should be quadratic residue moduleP');
    }

    const decryptedValue = squared.modPow(this.moduleP.add(BigInt.ONE).divide(new BigInt('4')), this.moduleP);
    const decryptedValueNegative = this.moduleP.subtract(decryptedValue);

    return (decryptedValueNegative.compareTo(decryptedValue) > 0)
      ? decryptedValue.toString()
      : decryptedValueNegative.toString();
  }
}

module.exports = ElGamal;
