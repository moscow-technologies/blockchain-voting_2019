const { BigInteger: BigInt } = require('jsbn');

const ElGamal = require('./elGamal');

/**
 * MultiLevelEncryptor main purpose is to encrypt arbitrary data with an instance of ElGamal,
 * which is built on valid cryptosystem basis — Module P, Generator G and Public Key.
 *
 * @export
 * @class MultiLevelEncryptor
 */
class MultiLevelEncryptor {
  /**
   * Creates an instance of MultiLevelEncryptor with 3 (three) ElGamal instances,
   * built from arguments.
   * @param {Array<String>} modulesP - Array of ElGamal Modules P
   * @param {Array<String>} generatorsG - Array of ElGamal Generators G
   * @param {Array<String>} publicKeys - Array of ElGamal Public Keys
   * @memberof MultiLevelEncryptor
   */
  constructor(modulesP, generatorsG, publicKeys) {
    const levelOneModuleP = new BigInt(modulesP[0]);
    const levelTwoModuleP = new BigInt(modulesP[1]);
    const levelThreeModuleP = new BigInt(modulesP[2]);

    const levelOneGeneratorG = new BigInt(generatorsG[0]);
    const levelTwoGeneratorG = new BigInt(generatorsG[1]);
    const levelThreeGeneratorG = new BigInt(generatorsG[2]);

    const levelOnePublicKey = new BigInt(publicKeys[0]);
    const levelTwoPublicKey = new BigInt(publicKeys[1]);
    const levelThreePublicKey = new BigInt(publicKeys[2]);

    if (levelOneModuleP.compareTo(levelTwoModuleP) >= 0) {
      throw new Error('Level 1 Module must be less than Level 2 Module');
    }

    if (levelTwoModuleP.compareTo(levelThreeModuleP) >= 0) {
      throw new Error('Level 2 Module must be less than Level 3 Module');
    }

    this.elGamalInstanceLevelOne = new ElGamal(
      levelOneModuleP,
      levelOneGeneratorG,
      levelOnePublicKey,
    );
    this.elGamalInstanceLevelTwo = new ElGamal(
      levelTwoModuleP,
      levelTwoGeneratorG,
      levelTwoPublicKey,
    );
    this.elGamalInstanceLevelThree = new ElGamal(
      levelThreeModuleP,
      levelThreeGeneratorG,
      levelThreePublicKey,
    );
  }

  /**
   * Creates an instance of MultiLevelEncryptor from 3 (three) ElGamal instances.
   * @param {ElGamal} elGamalLevelOne - Instance of ElGamal for Level 1, MUST be less then Level 2
   * @param {ElGamal} elGamalLevelTwo - Instance of ElGamal for Level 2, MUST be less then Level 3
   * @param {ElGamal} elGamalLevelThree - Instance of ElGamal for Level 3
   * @returns MultiLevelEncryptor
   * @memberof MultiLevelEncryptor
   */
  static fromElGamals(elGamalLevelOne, elGamalLevelTwo, elGamalLevelThree) {
    const levelOneModuleP = elGamalLevelOne.getModuleP();
    const levelOneGeneratorG = elGamalLevelOne.getGeneratorG();
    const levelOnePublicKey = elGamalLevelOne.getPublicKey();

    const levelTwoModuleP = elGamalLevelTwo.getModuleP();
    const levelTwoGeneratorG = elGamalLevelTwo.getGeneratorG();
    const levelTwoPublicKey = elGamalLevelTwo.getPublicKey();

    const levelThreeModuleP = elGamalLevelThree.getModuleP();
    const levelThreeGeneratorG = elGamalLevelThree.getGeneratorG();
    const levelThreePublicKey = elGamalLevelThree.getPublicKey();

    const modulesP = [levelOneModuleP, levelTwoModuleP, levelThreeModuleP];
    const generatorsG = [levelOneGeneratorG, levelTwoGeneratorG, levelThreeGeneratorG];
    const publicKeys = [levelOnePublicKey, levelTwoPublicKey, levelThreePublicKey];

    return new MultiLevelEncryptor(modulesP, generatorsG, publicKeys);
  }

  /**
   * Creates an instance of MultiLevelEncryptor from 3 (three) random ElGamal instances.
   * It should not be used in production, as it also retruns Private Keys.
   * @static
   * @param {number} [bits=256] - Number of bits in ElGamal Level 3;
   * ElGamals Level 2 and 1 will be one and two bits smaller, respectively. Default value - 256.
   * @memberof MultiLevelEncryptor
   */
  static async generateRandom(bits = 256) {
    const [elGamalLevelOne, elGamalLevelTwo, elGamalLevelThree] = await Promise.all([
      ElGamal.generateRandom(bits - 2),
      ElGamal.generateRandom(bits - 1),
      ElGamal.generateRandom(bits),
    ]);

    const privateKeys = [
      elGamalLevelOne.getPrivateKey(),
      elGamalLevelTwo.getPrivateKey(),
      elGamalLevelThree.getPrivateKey(),
    ];

    const encryptor = MultiLevelEncryptor.fromElGamals(
      elGamalLevelOne,
      elGamalLevelTwo,
      elGamalLevelThree,
    );

    return {
      encryptor,
      privateKeys,
    };
  }

  setPrivateKeys(privateKeys) {
    this.elGamalInstanceLevelOne.setPrivateKey(privateKeys[0]);
    this.elGamalInstanceLevelTwo.setPrivateKey(privateKeys[1]);
    this.elGamalInstanceLevelThree.setPrivateKey(privateKeys[2]);
  }

  getModulesP() {
    return [
      this.elGamalInstanceLevelOne.getModuleP(),
      this.elGamalInstanceLevelTwo.getModuleP(),
      this.elGamalInstanceLevelThree.getModuleP(),
    ];
  }

  getGeneratorsG() {
    return [
      this.elGamalInstanceLevelOne.getGeneratorG(),
      this.elGamalInstanceLevelTwo.getGeneratorG(),
      this.elGamalInstanceLevelThree.getGeneratorG(),
    ];
  }

  getPublicKeys() {
    return [
      this.elGamalInstanceLevelOne.getPublicKey(),
      this.elGamalInstanceLevelTwo.getPublicKey(),
      this.elGamalInstanceLevelThree.getPublicKey(),
    ];
  }

  getPrivateKeys() {
    return [
      this.elGamalInstanceLevelOne.getPrivateKey(),
      this.elGamalInstanceLevelTwo.getPrivateKey(),
      this.elGamalInstanceLevelThree.getPrivateKey(),
    ];
  }

  getCryptors() {
    return [
      this.elGamalInstanceLevelOne,
      this.elGamalInstanceLevelTwo,
      this.elGamalInstanceLevelThree,
    ];
  }

  /**
   * Encrypt a data with ElGamal algorithm, returns a Promise which resolves to object
   * with exactly two fields
   * @param {number|string} data - data to encrypt, number or string representation
   * @returns {Promise<{
   *  levelOneB: string,
   *  levelTwoB: string,
   *  levelThreeA: string,
   *  levelThreeB: string
   * }>}
   * @memberof MultiLevelEncryptor
   */
  async encrypt(data, entropy) {
    const dataAsBI = new BigInt(data.toString());

    if (dataAsBI.compareTo(BigInt.ONE) <= 0) {
      throw new Error('Only Positive Integers can be encrypted!');
    }

    const { a: levelOneA, b: levelOneB } = await this.elGamalInstanceLevelOne.encrypt(data, entropy); // eslint-disable-line max-len
    const { a: levelTwoA, b: levelTwoB } = await this.elGamalInstanceLevelTwo.encrypt(levelOneA, entropy); // eslint-disable-line max-len
    const { a: levelThreeA, b: levelThreeB } = await this.elGamalInstanceLevelThree.encrypt(levelTwoA, entropy); // eslint-disable-line max-len

    return {
      levelOneB,
      levelTwoB,
      levelThreeA,
      levelThreeB,
    };
  }

  /**
   * Decrypt a data with ElGamal algorithm, returns a Promise which resolves to a string
   * @param {Promise<{
    *  levelOneB: string,
    *  levelTwoB: string,
    *  levelThreeA: string,
    *  levelThreeB: string
    * }>} data - data to decrypt, an Object in format returned from #encrypt function
    * @returns {string}
    * @memberof MultiLevelEncryptor
    */
  async decrypt(data) {
    const {
      levelOneB,
      levelTwoB,
      levelThreeA,
      levelThreeB,
    } = data;

    const levelTwoA = await this.elGamalInstanceLevelThree.decrypt({ a: levelThreeA, b: levelThreeB }); // eslint-disable-line max-len
    const levelOneA = await this.elGamalInstanceLevelTwo.decrypt({ a: levelTwoA, b: levelTwoB }); // eslint-disable-line max-len

    return this.elGamalInstanceLevelOne.decrypt({ a: levelOneA, b: levelOneB }); // eslint-disable-line max-len
  }
}

module.exports = MultiLevelEncryptor;
