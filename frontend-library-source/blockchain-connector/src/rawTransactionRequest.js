
/**
 * Transaction request object can be used to send transaction stored in it
 * with supplied blockchain connector & wait for transaction commitment
 */
class RawTransactionRequest {
  /**
   * @param {Object} rawTx - raw transaction
   */
  constructor(rawTx) {
    this.rawTx = rawTx;

    this.hash = null;
    this.blockchainConnector = null;
  }

  /**
   * Send transaction to blockchain, does not wait for its commitment
   * @param {BlockchainConnector} blockchainConnector - BlockchainConnector instance
   * @return {Promise<string>} - promise resolved with transaction hash
   */
  send(blockchainConnector) {
    this.blockchainConnector = blockchainConnector;
    return blockchainConnector.sendRawTransaction(this.rawTx)
      .then((txHash) => {
        this.hash = txHash;
        return txHash;
      });
  }

  /**
   * Returns transaction hash, if transacton was already sent
   * @return {string|null} - tx hash or null if tx was not sent
   */
  getHash() {
    return this.hash;
  }

  /**
   * Returns transaction result, if ready, otherwise throws error.
   * @param {BlockchainConnector} [blockchainConnector] - you may pass new BlockchainConenctor
   * instance to replace existing one
   * @return {Promise<Object>} - promise resolved with transaction result, if ready
   */
  getResult(blockchainConnector) {
    if (blockchainConnector) {
      this.blockchainConnector = blockchainConnector;
    }
    if (!this.blockchainConnector) {
      return Promise.reject(new Error('Transaction should be sent to wait for its result'));
    }
    if (!this.hash) {
      return Promise.reject(new Error('Transaction either was not sent or sending failed'));
    }

    return this.blockchainConnector.getTransactionResult(this.hash);
  }

  /**
   * Waits for transaction commitment, either succesfull or not. Returns transaction info
   * if tx was successfull, or throws error otherwise.
   * @param {BlockchainConnector} [blockchainConnector] - you may pass new BlockchainConenctor
   * instance to replace existing one
   * @return {Promise<Object>} - promise resolved with transaction result received
   */
  waitResult(blockchainConnector) {
    if (blockchainConnector) {
      this.blockchainConnector = blockchainConnector;
    }
    if (!this.blockchainConnector) {
      return Promise.reject(new Error('Transaction should be sent to wait for its result'));
    }
    if (!this.hash) {
      return Promise.reject(new Error('Transaction either was not sent or sending failed'));
    }

    return this.blockchainConnector.waitTransactionResult(this.hash);
  }

  /**
   * Returns serialized signed transaction as hex string
   * @return {String} - serialized transaction as hex string
   */
  getRawTx() {
    return this.rawTx;
  }

  /**
   * Returns serialized unsigned transaction as hex string
   * @return {String} - serialized transaction as hex string
   */
  getUnsignedRawTx() {
    return this.rawTx.slice(0, -128); // strip 64-byte signature
  }
}

module.exports = RawTransactionRequest;
