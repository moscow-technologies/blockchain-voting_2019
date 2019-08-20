const ethers = require('ethers');
const { BigInteger: BigInt } = require('jsbn');

/**
 *
 * @param {Object} txReceipt - transaction recipt
 * @param {any} txReceipt.logs - transaction logs object
 * @param {Object} contract - contract definition
 * @param {Object} contract.abi - contract definition
 * @param {Object} contract.bytecode - contract bytecode
 * @returns {Array.<{
 * transactionLogIndex: Number,
 * transactionIndex: Number,
 * blockNumber: Number,
 * transactionHash: String,
 * address: String,
 * topics: Array<String>,
 * data: String,
 * logIndex: Number,
 * blockHash:
 * String,
 * args: any,
 * event: String,
 * eventSignature: String}>} - array of events
 */
const txReceiptParseLogs = (txReceipt, contract) => {
  if (!(txReceipt && txReceipt.logs)) {
    throw new Error('Must pass a proper Transaction Receipt with definition with Logs!');
  }

  if (!(contract && contract.abi && contract.bytecode)) {
    throw new Error('Must pass a proper contract definition with ABI and Bytecode!');
  }

  const { abi, bytecode } = contract;

  const factory = new ethers.ContractFactory(abi, bytecode);

  // Copy of Ethers.js tx.wait(), minus added
  // functions removeListener, getBlock, getTransaction, getTransactionReceipt
  return txReceipt.logs.map((log) => {
    const event = Object.assign({}, log);

    const parsed = factory.interface.parseLog(log);
    if (parsed) {
      event.args = parsed.values;
      event.decode = parsed.decode;
      event.event = parsed.name;
      event.eventSignature = parsed.signature;
    }

    return event;
  });
};

/**
 * Parses raw transaction & returns its properties
 * See https://docs.ethers.io/ethers.js/html/api-utils.html#transactions
 * @param {String} rawTx - raw transaction data
 * @return {Object} - transaction properties (from, to, data, hash, etc.)
 */
const parseRawTransaction = rawTx => ethers.utils.parseTransaction(rawTx);

/**
* Strips 0x from hex sequence if present
* @param {string} hex - hex sequence
* @return {string} - hex sequence without 0x
*/
const cleanHex = (hex) => { // eslint-disable-line arrow-body-style
  return (typeof hex === 'string' && hex.slice(0, 2) === '0x') ? hex.slice(2) : hex; // eslint-disable-line no-extra-parens
};

/**
 * Converts BigInteger number to bytes representaion
 * @param {Object} bigint - BigInteger
 * @return {string} - bytes representaion of number
 */
const bigIntToBytes = (bigint) => {
  const hex = cleanHex(bigint.toString(16));
  // eslint-disable-next-line prefer-template
  return '0x' + (((hex.length % 64) !== 0) ? '0'.repeat(64 - (hex.length % 64)) : '') + hex;
};

/**
 * Converts bytes representaion to BigInteger
 * @param {string} - bytes representaion of number
 * @return {Object} bigint - BigInteger
 */
const bytesToBigInt = (bytes) => { // eslint-disable-line arrow-body-style
  return new BigInt(cleanHex(bytes), 16);
};

module.exports = {
  txReceiptParseLogs,
  parseRawTransaction,
  bigIntToBytes,
  bytesToBigInt,
};
