/* eslint-disable no-console */
const Exonum = require('exonum-client');

const { votings_service: { TxFinalizeVoting } } = require('../proto');
const TransactionRequest = require('../transactionRequest');

const VOTINGS_SERVICE_ID = 1001;
const FINALIZE_VOTING_MSG_ID = 10;

/**
 * Returns TransactionRequest object for making FinalizeVoting transaction
 * @param {{publicKey: string, secretKey: string}} sender - transaction sendet keypair
 * @param {Object} data - transaction data
 * @param {string} data.voting_id - cryptosystem settings
 * @return {TransactionRequest}
 */
module.exports = (sender, data) => {
  const finalizeVotingTx = Exonum.newTransaction({
    author: sender.publicKey,
    service_id: VOTINGS_SERVICE_ID,
    message_id: FINALIZE_VOTING_MSG_ID,
    schema: TxFinalizeVoting,
  });

  const txData = {
    voting_id: data.voting_id,
    seed: Exonum.randomUint64(),
  };

  return new TransactionRequest(sender, finalizeVotingTx, txData);
};
