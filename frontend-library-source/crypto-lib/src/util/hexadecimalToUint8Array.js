
/**
 * Converts hexadecimal to Uint8Array.
 * Code taken from Exonum light client library (https://github.com/exonum/exonum-client).
 * We assume that this function will be called with values that passed valudation,
 * so only small sanity check is left here.
 * @param {string} str - hex string
 * @return {Uint8Array}
 */
module.exports = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError('Wrong data type passed to convertor. Hexadecimal string is expected');
  }

  if (str.length % 2 !== 0) {
    throw new TypeError('Hex string should contain full bytes');
  }

  const uint8arr = new Uint8Array(str.length / 2);

  for (let i = 0, j = 0; i < str.length; i += 2, j++) {
    uint8arr[j] = parseInt(str.substr(i, 2), 16);
  }

  return uint8arr;
};
