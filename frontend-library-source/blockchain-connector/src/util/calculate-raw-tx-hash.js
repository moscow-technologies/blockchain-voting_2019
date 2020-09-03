const Exonum = require('exonum-client');

/**
 * Returns hash of raw transaction supplied as hex string
 * @param {String} rawTx - serialized transaction as hex string
 * @return {String} - transaction hash
 */
module.exports = rawTx => Exonum.hash(Exonum.hexadecimalToUint8Array(rawTx));
