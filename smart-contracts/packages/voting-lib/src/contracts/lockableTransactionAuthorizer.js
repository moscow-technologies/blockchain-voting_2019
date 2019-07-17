const ethers = require('ethers');

const {
  LockableTransactionAuthorizer: { abi, bytecode },
} = require('smart-contracts');

const { txReceiptParseLogs } = require('../helpers');

class LockableTransactionAuthorizer {
  constructor(contract) {
    this.contract = contract;
  }

  // Fields
  get address() {
    return this.contract.address;
  }

  // Getters
  allowedTxTypes(sender, to, value) {
    return this.contract.allowedTxTypes(sender, to, value);
  }

  contractName() {
    return this.contract.contractName();
  }

  contractNameHash() {
    return this.contract.contractNameHash();
  }

  contractVersion() {
    return this.contract.contractVersion();
  }

  isOwner() {
    return this.contract.isOwner();
  }

  isLocked() {
    return this.contract.isLocked();
  }

  getLockReason() {
    return this.contract.getLockReason();
  }

  getCreator() {
    return this.contract.getCreator();
  }

  /**
   * Returns parsed events from trabsaction receipt
   * @param {Object} txReceipt - transaction receipt. Tx should be sent to this contract
   * @return {Object[]} - array of events in this transaction
   */
  // eslint-disable-next-line class-methods-use-this
  getEventsFromTransaction(txReceipt) {
    return txReceiptParseLogs(txReceipt, { abi, bytecode });
  }

  // "Setters"
  async lock(reason) {
    const tx = await this.contract.lock(reason);

    return tx.wait();
  }

  // Statics
  static async at(address, signerAccount) {
    const deployedContract = new ethers.Contract(address, abi, signerAccount);

    await deployedContract.deployed();

    return new LockableTransactionAuthorizer(deployedContract);
  }

  static async deploy(signerAccount) {
    const factory = new ethers.ContractFactory(abi, bytecode, signerAccount);

    const contract = await factory.deploy();

    await contract.deployed();

    return new LockableTransactionAuthorizer(contract);
  }
}

module.exports = LockableTransactionAuthorizer;
