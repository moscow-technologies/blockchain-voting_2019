/**
 * Converts Uint8Array to hexadecimal.
 * Code taken from Exonum light client library (https://github.com/exonum/exonum-client).
 * @param {Uint8Array} uint8arr - Uint8Array
 * @return {string}
 */

module.exports = (uint8arr) => {
  let str = '';

  if (!(uint8arr instanceof Uint8Array)) {
    throw new TypeError('Wrong data type of array of 8-bit integers. Uint8Array is expected');
  }

  for (let i = 0; i < uint8arr.length; i++) {
    let hex = uint8arr[i].toString(16);
    hex = (hex.length === 1) ? `0${hex}` : hex;
    str += hex;
  }

  return str.toLowerCase();
};
