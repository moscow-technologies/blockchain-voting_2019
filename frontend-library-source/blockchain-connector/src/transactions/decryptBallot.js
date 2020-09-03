/* eslint-disable no-console */
const Exonum = require('exonum-client');

const { votings_service: { TxDecryptBallot } } = require('../proto');
const TransactionRequest = require('../transactionRequest');

const VOTINGS_SERVICE_ID = 1001;
const DECRYPT_BALLOT_MSG_ID = 9;

/**
 * Returns TransactionRequest object for making DecryptBalltot transaction
 * @param {{publicKey: string, secretKey: string}} sender - transaction sendet keypair
 * @param {Object} data - transaction data
 * @param {string} data.voting_id - voting ID
 * @param {number} data.ballot_index - ballot index
 * @return {TransactionRequest}
 */
module.exports = (sender, data) => {
  const decryptBallotTx = Exonum.newTransaction({
    author: sender.publicKey,
    service_id: VOTINGS_SERVICE_ID,
    message_id: DECRYPT_BALLOT_MSG_ID,
    schema: TxDecryptBallot,
  });

  const txData = {
    voting_id: data.voting_id,
    ballot_index: data.ballot_index,
    seed: Exonum.randomUint64(),
  };

  return new TransactionRequest(sender, decryptBallotTx, txData);
};
