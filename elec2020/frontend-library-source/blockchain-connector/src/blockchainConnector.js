
const axios = require('axios');
const Exonum = require('exonum-client');
const { ContractLogicError, RequestError } = require('./errors');

axios.defaults.timeout = 3000;

class BlockchainConnector {
  /**
   * @param {string} apiUrl - blockchain node api url, ex. http://127.0.0.1:8200
   * @param {Object} config - connector configuration
   */
  constructor(apiUrl, config = {}) {
    this.apiUrl = apiUrl;
    this.config = Object.assign({
      txResultRequestAttemps: 10,
      txResultPollingTimeout: 500,
    }, config);
  }

  /**
   * Sends transaction to blockchain without waiting for commitment
   * @param {{publicKey: string, secretKey: string}} sender - transaction sendet keypair
   * @param {Object} tx - transaction object (made with Exonum.newTransaction(...))
   * @param {Object} txData - transaction data
   * @return {Promise<string>} - promise resolved with transaction hash after tx is successfuly sent
   */
  sendTransaction(sender, tx, txData) {
    return tx.send(`${this.apiUrl}/api/explorer/v1/transactions`, txData, sender.secretKey, 0);
  }

  /**
   * Sends raw transaction to blockchain without waiting for commitment
   * @param {string} rawTx - serialized transaction data in hex
   * @return {Promise<string>} - promise resolved with transaction hash after tx is successfuly sent
   */
  sendRawTransaction(rawTx) {
    // TODO: check whether hash really gives correct transaction hash
    return axios.post(`${this.apiUrl}/api/explorer/v1/transactions`, {
      tx_body: rawTx,
    }).then(() => Exonum.hash(Exonum.hexadecimalToUint8Array(rawTx)));
  }

  /**
   * Returns transaction result, if committed & successfull, otherwise throws error
   * @param {string} txHash - transaction hash
   * @return {Promise<Object>} - promise resolved with transaction info
   */
  getTransactionResult(txHash) {
    const apiUrl = this.apiUrl;

    return axios.get(`${apiUrl}/api/explorer/v1/transactions?hash=${txHash}`)
      .then((response) => {
        if (response.data.type !== 'committed') {
          throw new Error('Transaction is not committed yet');
        }

        if (response.data.status.type === 'error') {
          throw new ContractLogicError(
            response.data.status.code,
            response.data.status.description,
          );
        }

        return response.data;
      });
  }

  /**
   * Waits for transaction commitment
   * @param {string} txHash - transaction hash
   * @return {Promise<Object>} - promise resolved with transaction info when tx
   * is commited & successfull
   */
  waitTransactionResult(txHash) {
    let attemptsCounter = this.config.txResultRequestAttemps;
    const pollingTimeout = this.config.txResultPollingTimeout;

    const self = this;

    return new Promise((resolve) => {
      setTimeout(resolve, pollingTimeout);
    }).then(() => {
      const getTxResult = () => {
        // eslint-disable-next-line no-plusplus
        if (attemptsCounter-- === 0) {
          return Promise.reject(new Error('The transaction was not accepted to the block for the expected period.'));
        }

        return self.getTransactionResult(txHash)
          .catch((err) => {
            if (err instanceof ContractLogicError) {
              throw err;
            }

            if (attemptsCounter === 0) {
              throw new Error('The request failed or the blockchain node did not respond.');
            }

            return new Promise((resolve) => {
              setTimeout(resolve, pollingTimeout);
            }).then(getTxResult);
          });
      };

      return getTxResult();
    });
  }

  /**
   * Makes request to blockchain & returns result
   * @param {string} request - relative url path with request params,
   * ex.: services/votings_service/v1/crypto-system-settings?voting_id=5d76...
   * @return {Promise<Object>} - promise resolved with response data
   */
  makeRequest(request) {
    const fullRequestUrl = [this.apiUrl, '/api/', request].join('');

    return axios.get(fullRequestUrl)
      .then(response => response.data)
      .catch((err) => {
        if (err.response && +err.response.status < 500) {
          throw new RequestError(+err.response.status, err.message);
        } else {
          throw err;
        }
      });
  }
}

module.exports = BlockchainConnector;
