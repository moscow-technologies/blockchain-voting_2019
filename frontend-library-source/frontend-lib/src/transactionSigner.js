const {
  AccountBuilder,
  transactions,
  util,
} = require('blockchain-connector');

const { storeBallot } = transactions;
const { calculateRawTxHash } = util;

/**
 * TransactionSigner purpose is to construct signed raw store ballot transaction
 * with encrypted (with DataEncryptor, or any other Encryptor) voter's choice.
 *
 * @export
 * @class TransactionSigner
 */
class TransactionSigner {
  /**
   * Creates an instance of TransactionSigner with random blockhain account keypair
   * @memberof TransactionSigner
   */
  constructor() {
    this.account = AccountBuilder.createNewAccount();
  }

  /**
   * Returns account public key, uniquely generated during class initialization
   * @returns {string} - account address (publicKey)
   * @memberof TransactionSigner
   */
  getAccountAddress() {
    return this.account.publicKey;
  }

  /**
   * Build signed raw store ballot transaction
   * @param {string} votingId - voting ID
   * @param {number} districtId - district ID
   * @param {string} encryptedMessage - encrypted voter's choice as hex string
   * @param {string} nonce - nonce as hex string
   * @param {string} publicKey - encryption public key as hex string
   * @returns {string} - raw transaction data
   */
  getSignedTransaction(votingId, districtId, encryptedMessage, nonce, publicKey) {
    const storeBallotRequest = storeBallot(this.account, {
      voting_id: votingId,
      district_id: districtId,
      encrypted_choice: {
        encrypted_message: encryptedMessage,
        nonce,
        public_key: publicKey,
      },
    });

    return storeBallotRequest.getRawTx();
  }

  /**
   * Returns raw transaction hash
   * @param {string} rawTx - raw transaction
   * @return {string} - raw transaction hash
   */
  getRawTransactionHash(rawTx) { // eslint-disable-line class-methods-use-this
    return calculateRawTxHash(rawTx);
  }
}

module.exports = TransactionSigner;
