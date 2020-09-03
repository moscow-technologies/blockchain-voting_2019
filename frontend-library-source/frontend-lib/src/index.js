// import 'core-js';
// import 'regenerator-runtime';

const {
  Cryptor,
  util: {
    hexadecimalToUint8Array,
    uint8ArrayToHexadecimal,
  },
} = require('crypto-lib');

const {
  proto: {
    votings_service: { Choices },
  },
} = require('blockchain-connector');

const TransactionSigner = require('./transactionSigner');

/**
 * Creates ballot.
 * @param {Object} opts - Ballot options.
 * @param {string} opts.votingId - Voting ID.
 * @param {string} opts.encryptionKey - Encryption key.
 * @param {Number} opts.districtId - District ID.
 * @param {Number} [opts.minChoices] - Minimum choices.
 * @param {Number} [opts.maxChoices] - Maximum choices.
 * @param {Number[]} opts.voterChoices - Voter choices
 * @returns {Object} created ballot { voterAddress, districtId, keyVerificationHash, txHash, tx }
 */
function createBallot({
  votingId,
  encryptionKey,
  districtId,
  minChoices = 1,
  maxChoices = 1,
  voterChoices,
} = {}) {
  if (voterChoices.length < minChoices) {
    throw new Error('voterChoices can not be less minChoices');
  }

  if (voterChoices.length > maxChoices) {
    throw new Error('voterChoices can not be more maxChoices');
  }

  if ((new Set(voterChoices).size) < voterChoices.length) {
    throw new Error('voterChoices can not contain duplicates');
  }

  const choices = Array(maxChoices).fill(0);
  voterChoices.forEach((choice, idx) => {
    choices[idx] = choice;
  });

  const choicesMessage = Choices.create({ data: choices });
  const buffer = Choices.encode(choicesMessage).finish();

  const cryptor = Cryptor.withRandomKeyPair();

  const encryptedBox = cryptor.encrypt(
    buffer,
    hexadecimalToUint8Array(encryptionKey),
  );

  const signer = new TransactionSigner();
  const rawStoreBallotTx = signer.getSignedTransaction(
    votingId,
    districtId,
    uint8ArrayToHexadecimal(encryptedBox.encryptedMessage),
    uint8ArrayToHexadecimal(encryptedBox.nonce),
    uint8ArrayToHexadecimal(encryptedBox.publicKey),
  );

  const rawTxHash = signer.getRawTransactionHash(rawStoreBallotTx);

  const voterAddress = signer.getAccountAddress();

  const keyVerificationHash = Cryptor.getKeyVerificationHash(
    hexadecimalToUint8Array(encryptionKey),
  );

  return {
    voterAddress,
    districtId,
    keyVerificationHash,
    txHash: rawTxHash,
    tx: rawStoreBallotTx,
  };
}

module.exports = {
  createBallot,
};
