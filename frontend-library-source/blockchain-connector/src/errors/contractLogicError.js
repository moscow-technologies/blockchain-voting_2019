class ContractLogicError extends Error {
  constructor(code, message, txHash) {
    super(message);

    this.errorCode = code;
    this.txHash = txHash;
  }

  get code() {
    return this.errorCode;
  }

  get transactionHash() {
    return this.txHash;
  }
}

module.exports = ContractLogicError;
