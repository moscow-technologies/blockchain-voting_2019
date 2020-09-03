/* eslint-disable class-methods-use-this */

const nacl = require('tweetnacl');
const Exonum = require('exonum-client');

class AccountBuilder {
  /**
   * Creates new account keypair
   * @return ({privateKey, secretKey}) - account keypair
   */
  createNewAccount() {
    return Exonum.keyPair();
  }

  /**
   * Creates account keypair from secret key
   * @param {string} secretKey - secret key
   * @return ({publicKey, secretKey}) - account keypair
   */
  createAccountFromSecretKey(secretKey) {
    try {
      const pair = nacl.sign.keyPair.fromSecretKey(Exonum.hexadecimalToUint8Array(secretKey));
      const keyPair = {
        publicKey: Exonum.uint8ArrayToHexadecimal(pair.publicKey),
        secretKey: Exonum.uint8ArrayToHexadecimal(pair.secretKey),
      };
      return keyPair;
    } catch (err) {
      throw new Error('Private Key is invalid!');
    }
  }
}

module.exports = new AccountBuilder();
