/* eslint-disable no-console */
const Exonum = require('exonum-client');

const { votings_service: { TxPublishDecryptionKey } } = require('../proto');
const { pbConvert } = require('../util');
const TransactionRequest = require('../transactionRequest');

const VOTINGS_SERVICE_ID = 1001;
const PUBLISH_DECRYPTION_KEY_MSG_ID = 8;

/**
 * Returns TransactionRequest object for making PublishDecryptionKey transaction
 * @param {{publicKey: string, secretKey: string}} sender - transaction sendet keypair
 * @param {Object} data - transaction data
 * @param {string} data.voting_id - voting ID
 * @param {string} data.private_key - ballots decryption (private) key
 * @return {TransactionRequest}
 */
module.exports = (sender, data) => {
  const publishDecryptionKeyTx = Exonum.newTransaction({
    author: sender.publicKey,
    service_id: VOTINGS_SERVICE_ID,
    message_id: PUBLISH_DECRYPTION_KEY_MSG_ID,
    schema: TxPublishDecryptionKey,
  });

  const txData = {
    voting_id: data.voting_id,
    private_key: pbConvert.SealedBoxSecretKey(data.private_key),
    seed: Exonum.randomUint64(),
  };

  return new TransactionRequest(sender, publishDecryptionKeyTx, txData);
};
