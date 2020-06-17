/* eslint-disable no-console */
const Exonum = require('exonum-client');

const { votings_service: { TxRevokeVoterParticipation } } = require('../proto');
const TransactionRequest = require('../transactionRequest');

const VOTINGS_SERVICE_ID = 1001;
const REVOKE_VOTER_PARTICIPATION_MSG_ID = 3;

/**
 * Returns TransactionRequest object for making RevokeVoterParticipation transaction
 * @param {{publicKey: string, secretKey: string}} sender - transaction sendet keypair
 * @param {Object} data - transaction data
 * @param {string} data.voting_id - voting ID
 * @param {string} data.voter_id - voter ID
 * @return {TransactionRequest}
 */
module.exports = (sender, data) => {
  const revokeParticipationTx = Exonum.newTransaction({
    author: sender.publicKey,
    service_id: VOTINGS_SERVICE_ID,
    message_id: REVOKE_VOTER_PARTICIPATION_MSG_ID,
    schema: TxRevokeVoterParticipation,
  });

  const txData = {
    voting_id: data.voting_id,
    voter_id: data.voter_id,
    seed: Exonum.randomUint64(),
  };

  return new TransactionRequest(sender, revokeParticipationTx, txData);
};
