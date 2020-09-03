const BlockchainConnector = require('./src/blockchainConnector');
const AccountBuilder = require('./src/accountBuilder');
const { calculateRawTxHash } = require('./src/util');
const { VotingState } = require('./src/enums');

const {
  createVoting,
  registerVoters,
  stopRegistration,
  revokeVoterParticipation,
  issueBallot,
  addVoterKey,
  storeBallot,
  stopVoting,
  publishDecryptionKey,
  decryptBallot,
  finalizeVoting,
} = require('./src/transactions');

const {
  getCryptoSystemSettings,
  getBallotsConfig,
  getVotingState,
  getRegisteredVotersAmount,
  getVoterInfo,
  getIssuedBallotsAmount,
  getStoredBallotsAmount,
  getDecryptionStatistics,
  getBallotByIndex,
  getBallotByStoreTxHash,
  getVotingResults,
} = require('./src/requests');

const {
  getTransactionInfo,
} = require('./src/systemRequests');

const RawTransactionRequest = require('./src/rawTransactionRequest');

const {
  ContractLogicError,
  RequestError,
} = require('./src/errors');

module.exports = {
  BlockchainConnector,
  AccountBuilder,
  RawTransactionRequest,
  enums: {
    VotingState,
  },
  transactions: {
    createVoting,
    registerVoters,
    stopRegistration,
    revokeVoterParticipation,
    issueBallot,
    addVoterKey,
    storeBallot,
    stopVoting,
    publishDecryptionKey,
    decryptBallot,
    finalizeVoting,
  },
  requests: {
    getCryptoSystemSettings,
    getBallotsConfig,
    getVotingState,
    getRegisteredVotersAmount,
    getVoterInfo,
    getIssuedBallotsAmount,
    getStoredBallotsAmount,
    getDecryptionStatistics,
    getBallotByIndex,
    getBallotByStoreTxHash,
    getVotingResults,
  },
  systemRequests: {
    getTransactionInfo,
  },
  util: {
    calculateRawTxHash,
  },
  errors: {
    ContractLogicError,
    RequestError,
  },
};
