/**
 * Read request object can be used to make request to blockchain
 */
class ReadRequest {
  /**
   * @param {string} requestUrl - request url
   * @param {function(Object):any} [responseProcessor] - function for processing response data,
   * if necessary
   */
  constructor(requestUrl, responseProcessor) {
    this.requestUrl = requestUrl;
    this.responseProcessor = typeof responseProcessor === 'function'
      ? responseProcessor
      : res => res;
    this.blockchainConnector = null;
  }

  /**
   * Send request to blockchain
   * @param {BlockchainConnector} blockchainConnector - BlockchainConnector instance
   * @return {Promise<T>} - promise resolved with response data
   */
  send(blockchainConnector) {
    this.blockchainConnector = blockchainConnector;
    return blockchainConnector.makeRequest(this.requestUrl)
      .then(this.responseProcessor);
  }
}

module.exports = ReadRequest;
