const ethers = require('ethers');

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

module.exports = { txReceiptParseLogs };
