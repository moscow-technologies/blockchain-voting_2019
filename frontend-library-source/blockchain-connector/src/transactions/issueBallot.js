/* eslint-disable no-console */
const Exonum = require('exonum-client');

const { votings_service: { TxIssueBallot } } = require('../proto');
const TransactionRequest = require('../transactionRequest');

const VOTINGS_SERVICE_ID = 1001;
const ISSUE_BALLOT_MSG_ID = 4;

/**
 * Returns TransactionRequest object for making AddVoterKey transaction
 * @param {{publicKey: string, secretKey: string}} sender - transaction sendet keypair
 * @param {Object} data - transaction data
 * @param {string} data.voting_id - voting ID
 * @param {string} data.voter_id - voter ID
 * @param {number} data.district_id - district ID
 * @return {TransactionRequest}
 */
module.exports = (sender, data) => {
  const issueBallotTx = Exonum.newTransaction({
    author: sender.publicKey,
    service_id: VOTINGS_SERVICE_ID,
    message_id: ISSUE_BALLOT_MSG_ID,
    schema: TxIssueBallot,
  });

  const txData = {
    voting_id: data.voting_id,
    voter_id: data.voter_id,
    district_id: data.district_id,
    seed: Exonum.randomUint64(),
  };

  return new TransactionRequest(sender, issueBallotTx, txData);
};
