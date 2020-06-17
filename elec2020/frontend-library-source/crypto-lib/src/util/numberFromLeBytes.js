/**
 * Reconstructs number from little-endian byte array
 * @param {Uint8Array} bytes - uint8array with data in little-endian
 * @return {number} - reconstructed number or NaN if conversion failed
 */
module.exports = (bytes) => {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError('Wrong data type of array of 8-bit integers. Uint8Array is expected')
  }

  // eslint-disable-next-line prefer-const
  let bigEndianBytes = bytes.slice();
  bigEndianBytes.reverse();

  const hex = bigEndianBytes.reduce((acc, byte) => {
    const hexByte = byte.toString(16);
    return acc + ((hexByte.length === 1) ? `0${hexByte}` : hexByte);
  }, '');

  return parseInt(hex, 16);
};
