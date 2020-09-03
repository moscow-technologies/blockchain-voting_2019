
const nacl = require('tweetnacl');
const sha256 = require('js-sha256');

const { numberToLeBytes, numberFromLeBytes } = require('./util');

/**
 * Cryptor class, using tweetnacl's box for encrypting & decrypting messages
 */
class Cryptor {
  constructor(keyPair) {
    this.keyPair = keyPair;
  }

  /**
   * Creates cryptor with keypair restored from private key
   * @param {Uint8Array} secretKey - secret key
   * @return {Cryptor}
   */
  static fromSecretKey(secretKey) {
    const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);
    return new Cryptor(keyPair);
  }

  /**
   * Creates cryptor with random keypair
   * @return {Cryptor}
   */
  static withRandomKeyPair() {
    const keyPair = nacl.box.keyPair();
    return new Cryptor(keyPair);
  }

  /**
   * Tests public key: attempts to encrypt some values for supplied key
   * @param {Uint8Array} publicKey - public key
   * @return {bool} - test result
   */
  static testPublicKey(publicKey) {
    const cryptor = Cryptor.withRandomKeyPair();

    try {
      const testDatums = [1, 2, 200, 1000, 21312];
      testDatums.forEach((datum) => {
        cryptor.encrypt(numberToLeBytes(datum), publicKey);
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Constructs key verification hash for supplied public key
   * @param {Uint8Array} publicKey - public key
   * @return {string} - key verification hash
   */
  static getKeyVerificationHash(publicKey) {
    return sha256(publicKey);
  }

  /**
   * Returns cryptor keypair
   * @return {Object} - keypair (nacl.box.keyPair)
   */
  getKeyPair() {
    return Object.assign({}, this.keyPair);
  }

  /**
   * Encrypts given message for supplied public key
   * @param {Uint8Array} message - message as Uint8Array
   * @param {Uint8Array} publicKey - public key (nacl.box.keypair.publicKey)
   * @param {Uint8Array} [nonce] - if supplied, this nonce will be used for encryption
   * @return {{encryptedMessage: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array}} -
   * object with encrypted message & params for decryption
   */
  encrypt(message, publicKey, nonce = null) {
    if (nonce == null) {
      // eslint-disable-next-line no-param-reassign
      nonce = nacl.randomBytes(nacl.box.nonceLength);
    }

    const encryptedMessage = nacl.box(message, nonce, publicKey, this.keyPair.secretKey);
    return { encryptedMessage, nonce, publicKey: this.keyPair.publicKey };
  }

  /**
   * Decrypts message
   * @param {Uint8Array} encyptedMessage - encrypted message
   * @param {Uint8Array} nonce - nonce used for message encryptino
   * @param {Uint8Array} publicKey - public key of encryption keypair
   * @return {Uint8Array|null} - decrypted message or null if decryption failed
   */
  decrypt(encyptedMessage, nonce, publicKey) {
    return nacl.box.open(encyptedMessage, nonce, publicKey, this.keyPair.secretKey);
  }

  /**
   * Tests cryptor
   * @return {bool} - test result
   */
  test() {
    try {
      const testDatums = [1, 2, 200, 1000, 21312];

      const encryptedDatums = testDatums.map((datum) => {
        const voter = Cryptor.withRandomKeyPair();
        return voter.encrypt(numberToLeBytes(datum), this.getKeyPair().publicKey);
      });

      const decryptedDatums = encryptedDatums.map(({ encryptedMessage, nonce, publicKey }) => {
        const decrypted = this.decrypt(encryptedMessage, nonce, publicKey);
        return numberFromLeBytes(decrypted);
      });

      const checkResult = testDatums.reduce((checks, testDatum, index) => {
        return checks && (testDatum === decryptedDatums[index]);
      }, true);

      return checkResult;
    } catch (err) {
      return false;
    }
  }
}

module.exports = Cryptor;
