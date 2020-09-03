/* eslint-disable arrow-body-style */

const Exonum = require('exonum-client');

// Methods for converting values to protobuf structures
module.exports = {
  /**
   * Converts exonum public key in string representation to PublicKey proto struct
   * @param {string} publicKey - public key as string
   */
  PublicKey: (publicKey) => {
    return { data: Exonum.hexadecimalToUint8Array(publicKey) };
  },
  /**
   * Converts nacl box public key string representation to SealedBoxPublicKey proto struct
   * @param {string} publicKey - nacl box public key
   */
  SealedBoxPublicKey: (publicKey) => {
    return { data: Exonum.hexadecimalToUint8Array(publicKey) };
  },
  /**
   * Converts nacl box secret key in string representation to SealedBoxSecretKey proto struct
   * @param {string} secretKey - nacl box secret key
   */
  SealedBoxSecretKey: (secretKey) => {
    return { data: Exonum.hexadecimalToUint8Array(secretKey) };
  },
  /**
   * Converts nacl box nonce string representation to SealedBoxNonce proto struct
   * @param {string} nonce - nacl box nonce
   */
  SealedBoxNonce: (nonce) => {
    return { data: Exonum.hexadecimalToUint8Array(nonce) };
  },
};
