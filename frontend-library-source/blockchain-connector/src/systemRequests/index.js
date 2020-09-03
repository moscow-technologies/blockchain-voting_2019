/* eslint-disable arrow-body-style */
/**
 * This module contains methods for making system requests to blockchain
 * (eg transaction info, block info, etc.)
 */
const ReadRequest = require('../readRequest');


module.exports = {
  /**
   * Makes ReadRequest returning transaction info
   * @param {string} txHash - transaction hash
   * @return {ReadRequest<Object} - ReadRequest returning transaction info.
   * See exonum doc for params
   */
  getTransactionInfo: (txHash) => {
    return new ReadRequest([
      'explorer/v1/transactions',
      `?hash=${txHash}`,
    ].join(''));
  },
};
