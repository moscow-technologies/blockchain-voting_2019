
/**
 * Strips '0x' prefix from hex string, if present
 */
module.exports = (hex) => { // eslint-disable-line arrow-body-style
  return (typeof hex === 'string' && hex.slice(0, 2) === '0x') ? hex.slice(2) : hex; // eslint-disable-line no-extra-parens
};
