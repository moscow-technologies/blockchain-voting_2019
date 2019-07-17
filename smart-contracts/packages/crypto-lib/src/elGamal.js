// Based on MIT licensed work of Kristóf Poduszló in 2016 https://github.com/kripod/elgamal.js
const { BigInteger: BigInt } = require('jsbn');

const {
  BIG_TWO, SOLIDITY_MAX_INT, getRandomBigPrime, getRandomBigInt, trimBigInt,
} = require('./utils');

const calculateSystemBasis = async (primeBits, millerRabinPasses = 100000) => {
  let denominatorQ;
  let moduleP;
  let generatorG;

  do {
    // eslint-disable-next-line no-await-in-loop
    denominatorQ = await getRandomBigPrime(primeBits - 1, millerRabinPasses);
    moduleP = denominatorQ.shiftLeft(1).add(BigInt.ONE);
  } while (!moduleP.isProbablePrime(millerRabinPasses)); // p MUST be Prime

  do {
    // eslint-disable-next-line no-await-in-loop
    generatorG = await getRandomBigInt(new BigInt('3'), moduleP); // avoid g=2 because of Bleichenbacher's attack
  } while (
    generatorG.modPowInt(2, moduleP).equals(BigInt.ONE)
    || generatorG.modPow(denominatorQ, moduleP).equals(BigInt.ONE)
    || moduleP
      .subtract(BigInt.ONE)
      .remainder(generatorG)
      .equals(BigInt.ZERO) // g|p-1
    || moduleP
      .subtract(BigInt.ONE)
      .remainder(generatorG.modInverse(moduleP))
      .equals(BigInt.ZERO) // g^(-1)|p-1 (evades Khadir's attack)
  );

  return { moduleP, generatorG };
};

class ElGamal {
  constructor(moduleP, generatorG, publicKey) {
    this.moduleP = new BigInt(moduleP.toString());
    if (this.moduleP.compareTo(SOLIDITY_MAX_INT) >= 0) {
      this.moduleP = null;
      throw new Error('Basis Module P can not be bigger than Solidity uint256 max value!');
    }

    this.generatorG = new BigInt(generatorG.toString());
    if (this.generatorG.compareTo(SOLIDITY_MAX_INT) >= 0) {
      this.generatorG = null;
      throw new Error('Basis Generator G can not be bigger than Solidity uint256 max value!');
    }

    this.publicKey = new BigInt(publicKey.toString());
    if (this.publicKey.compareTo(SOLIDITY_MAX_INT) >= 0) {
      this.publicKey = null;
      throw new Error('Public Key Key can not be bigger than Solidity uint256 max value!');
    }

    this.privateKey = null;
  }

  /**
   * @returns {Promise<ElGamal>}
   */
  static async generateRandom(primeBits = 256) {
    if (primeBits < 4) {
      throw new Error('System Basis Prime Bits can not be lower than 4!');
    }

    if (primeBits > 256) {
      throw new Error('System Basis Prime Bits can not be bigger than 256!');
    }

    const { moduleP, generatorG } = await calculateSystemBasis(primeBits);

    // Generate private key
    const privateKey = await getRandomBigInt(BIG_TWO, moduleP.subtract(BigInt.ONE));

    // Generate public key
    const publicKey = generatorG.modPow(privateKey, moduleP);

    return ElGamal.buildWithPrivateKey(moduleP, generatorG, publicKey, privateKey);
  }

  static buildWithPrivateKey(moduleP, generatorG, publicKey, privateKey) {
    const elGamal = new ElGamal(moduleP, generatorG, publicKey);

    elGamal.setPrivateKey(privateKey);

    return elGamal;
  }

  setPrivateKey(privateKey) {
    this.privateKey = new BigInt(privateKey.toString());

    if (this.privateKey.compareTo(SOLIDITY_MAX_INT) >= 0) {
      this.privateKey = null;
      throw new Error('Private Key can not be bigger than Solidity uint256 max value!');
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

    if (dataAsBI.compareTo(this.moduleP) >= 0) {
      throw new Error('Data to encrypt can not be bigger or equal Basis Module P!');
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

    const sharedKey = this.publicKey.modPow(sessionKey, this.moduleP);

    const a = this.generatorG.modPow(sessionKey, this.moduleP).toString();
    const b = sharedKey
      .multiply(dataAsBI)
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

    return new BigInt(encryptedData.b.toString())
      .multiply(decryptor)
      .remainder(this.moduleP)
      .toString();
  }
}

module.exports = ElGamal;
