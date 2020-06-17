const {
  Cryptor,
  util: {
    hexadecimalToUint8Array,
    uint8ArrayToHexadecimal,
    numberToLeBytes,
    numberFromLeBytes,
  },
} = require('crypto-lib');
const TransactionSigner = require('./src/transactionSigner');

module.exports = {
  Cryptor,
  TransactionSigner,
  util: {
    hexadecimalToUint8Array,
    uint8ArrayToHexadecimal,
    numberToLeBytes,
    numberFromLeBytes,
  },
};
