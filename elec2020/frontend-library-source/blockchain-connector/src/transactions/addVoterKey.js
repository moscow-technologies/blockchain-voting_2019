/* eslint-disable no-console */
const Exonum = require('exonum-client');

const { votings_service: { TxAddVoterKey } } = require('../proto');
const { pbConvert } = require('../util');
const TransactionRequest = require('../transactionRequest');

const VOTINGS_SERVICE_ID = 1001;
const ADD_VOTER_KEY_MSG_ID = 5;

/**
 * Returns TransactionRequest object for making AddVoterKey transaction
 * @param {{publicKey: string, secretKey: string}} sender - transaction sendet keypair
 * @param {Object} data - transaction data
 * @param {string} data.voting_id - voting ID
 * @param {string} data.voter_key - voter public key
 * @return {TransactionRequest}
 */
module.exports = (sender, data) => {
  const addVoterKeyTx = Exonum.newTransaction({
    author: sender.publicKey,
    service_id: VOTINGS_SERVICE_ID,
    message_id: ADD_VOTER_KEY_MSG_ID,
    schema: TxAddVoterKey,
  });

  const txData = {
    voting_id: data.voting_id,
    voter_key: pbConvert.PublicKey(data.voter_key),
  };

  return new TransactionRequest(sender, addVoterKeyTx, txData);
};
