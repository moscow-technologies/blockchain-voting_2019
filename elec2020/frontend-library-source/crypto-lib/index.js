const Cryptor = require('./src/cryptor');
const {
  numberToLeBytes,
  numberFromLeBytes,
  hexadecimalToUint8Array,
  uint8ArrayToHexadecimal,
} = require('./src/util');

module.exports = {
  Cryptor,
  util: {
    numberToLeBytes,
    numberFromLeBytes,
    hexadecimalToUint8Array,
    uint8ArrayToHexadecimal,
  },
};
