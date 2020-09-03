/* eslint-disable no-console */
const Exonum = require('exonum-client');

const { votings_service: { TxStoreBallot } } = require('../proto');
const { pbConvert } = require('../util');
const TransactionRequest = require('../transactionRequest');

const VOTINGS_SERVICE_ID = 1001;
const STORE_BALLOT_MSG_ID = 6;

/**
 * @typedef EncryptedChoice
 * @type {Object}
 * @property {string} encrypted_message - encrypted message in hex string
 * @property {string} nonce - encrypted message in hex string
 * @property {string} public_key - encrypted message in hex string
 */

/**
 * Returns TransactionRequest object for making StoreBallot transaction
 * @param {{publicKey: string, secretKey: string}} sender - transaction sendet keypair
 * @param {Object} data - transaction data
 * @param {string} data.voting_id - voting ID
 * @param {number} data.district_id - district ID
 * @param {EncryptedChoice} data.encrypted_choice - encrypted choice
 * @return {TransactionRequest}
 */
module.exports = (sender, data) => {
  const storeBallotTx = Exonum.newTransaction({
    author: sender.publicKey,
    service_id: VOTINGS_SERVICE_ID,
    message_id: STORE_BALLOT_MSG_ID,
    schema: TxStoreBallot,
  });

  const txData = {
    voting_id: data.voting_id,
    district_id: data.district_id,
    encrypted_choice: {
      encrypted_message: Exonum.hexadecimalToUint8Array(data.encrypted_choice.encrypted_message),
      nonce: pbConvert.SealedBoxNonce(data.encrypted_choice.nonce),
      public_key: pbConvert.SealedBoxPublicKey(data.encrypted_choice.public_key),
    },
  };

  return new TransactionRequest(sender, storeBallotTx, txData);
};
