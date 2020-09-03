/* eslint-disable arrow-body-style */
/**
 * This module contains methods for making requests to blockchain
 */
const { VotingState } = require('../enums');
const ReadRequest = require('../readRequest');

/**
 * @typedef CryptoSystemSettings
 * @type {Object}
 * @property {string} public_key - cryptosystem public key
 * @property {string|null} private_key - private key will be returned if it is published
 */

/**
 * @typedef BallotConfig
 * @type {Object}
 * @property {number} district_id - district ID (integer
 * @property {string} question - question for voting
 * @property {Object.<number, string} options - options map <option number, option text>
 */

/**
 * @typedef VoterInfo
 * @type {Object}
 * @property {string} voter_id - voter ID
 * @property {bool} is_participation_revoked - flag indicating whether
 * voter participation was revoked
 * @property {number|null} ballot_issuing_district - if ballot was issued for voter,
 * stores voter's district ID
 */

/**
 * @typedef DecryptionStatistics
 * @type {Object}
 * @property {string} decrypted_ballots_amount - amount of successfully decrypted ballots
 * @property {bool} invalid_ballots_amount - amount of invalid ballots
 * (invalid means that decryption failed or choice is out of bounds)
 */

/**
 * @typedef EncryptedChoice
 * @type {Object}
 * @property {string} encrypted_message - encrypted message in hex string
 * @property {string} nonce - encrypted message in hex string
 * @property {string} public_key - encrypted message in hex string
 */

/**
 * @typedef Ballot
 * @type {Object}
 * @property {number} index - ballot index
 * @property {string} voter - voter's public key
 * @property {number} district_id - district ID
 * @property {EncryptedChoice} encrypted_choice - encrypted choice
 * @property {number|null} decrypted_choice - decrypted choice, if ballot is decrypted
 * @property {string} store_tx_hash - store transaction hash
 * @property {string|null} decrypt_tx_hash - decryption transaction hash, if ballot is decrypted
 * @property {bool} invalid - flag indication whether ballot decryption failed
 */

/**
 * @typedef VotingResults
 * @type {Object}
 * @property {number} district_id - district id
 * @property {Object.<number, number} tally - results map (<choice, votes_amount>)
 */

module.exports = {
  /**
   * Makes ReadRequest returning voting cryptosystem settings
   * @param {string} votingId - voting Id
   * @return {ReadRequest<CryptoSystemSettings} - ReadRequest returning cryptosystem settings
   */
  getCryptoSystemSettings: (votingId) => {
    return new ReadRequest([
      'services/votings_service/v1/crypto-system-settings',
      `?voting_id=${votingId}`,
    ].join(''));
  },
  /**
   * Makes ReadRequest returning ballots configuration (questions & options) for all districts
   * @param {string} votingId - voting Id
   * @return {ReadRequest<Array<BallotConfig>} - ReadRequest returning ballots config
   */
  getBallotsConfig: (votingId) => {
    return new ReadRequest([
      'services/votings_service/v1/ballots-config',
      `?voting_id=${votingId}`,
    ].join(''));
  },
  /**
   * Makes ReadRequest returning voting state
   * @param {string} votingId - voting Id
   * @return {ReadRequest<VotingState>} - ReadRequest returning voting state respresented as
   * VotingState enum
   */
  getVotingState: (votingId) => {
    return new ReadRequest(
      [
        'services/votings_service/v1/voting-state',
        `?voting_id=${votingId}`,
      ].join(''),
      (result) => {
        switch (result.state) {
          case 'Registration': return VotingState.Registration;
          case 'InProcess': return VotingState.InProcess;
          case 'Stopped': return VotingState.Stopped;
          case 'Finished': return VotingState.Finished;
          default: throw new Error(`Unknown voting state: ${result.state}`);
        }
      },
    );
  },
  /**
   * Makes ReadRequest returning registered voters amount
   * @param {string} votingId - voting Id
   * @return {ReadRequest<number>} - ReadRequest returning registered voters amount
   */
  getRegisteredVotersAmount: (votingId) => {
    return new ReadRequest(
      [
        'services/votings_service/v1/registered-voters-amount',
        `?voting_id=${votingId}`,
      ].join(''),
      result => result.registered_voters_amount,
    );
  },
  /**
   * Makes ReadRequest returning voter info
   * @param {string} votingId - voting ID
   * @param {string} voterId - voter ID
   * @return {ReadRequest<VoterInfo>} - ReadRequest returning voter info
   */
  getVoterInfo: (votingId, voterId) => {
    return new ReadRequest([
      'services/votings_service/v1/voter-info',
      `?voting_id=${votingId}&voter_id=${voterId}`,
    ].join(''));
  },
  /**
   * Makes ReadRequest returning issued ballots amount for all districts
   * @param {string} votingId - voting Id
   * @return {ReadRequest<Object.{number, number}>} - ReadRequest returning issued ballots amount
   * by district map
   */
  getIssuedBallotsAmount: (votingId) => {
    return new ReadRequest(
      [
        'services/votings_service/v1/issued-ballots-amount',
        `?voting_id=${votingId}`,
      ].join(''),
      result => result.issued_ballots_amount,
    );
  },
  /**
   * Makes ReadRequest returning stored ballots amount for all districts
   * @param {string} votingId - voting Id
   * @return {ReadRequest<Object.{number, number}>} - ReadRequest returning stored ballots amount
   * by district map
   */
  getStoredBallotsAmount: (votingId) => {
    return new ReadRequest(
      [
        'services/votings_service/v1/stored-ballots-amount',
        `?voting_id=${votingId}`,
      ].join(''),
      result => result.stored_ballots_amount,
    );
  },
  /**
   * Makes ReadRequest returning decryption statistics for voting, if decryption process finished
   * @param {string} votingId - voting Id
   * @return {ReadRequest<DecryptionStatistics>} - ReadRequest returning decryption statistics
   */
  getDecryptionStatistics: (votingId) => {
    return new ReadRequest(
      [
        'services/votings_service/v1/decryption-statistics',
        `?voting_id=${votingId}`,
      ].join(''),
    );
  },
  /**
   * Makes ReadRequest returning ballot info
   * @param {string} votingId - voting Id
   * @param {number} ballotIndex - ballot index
   * @return {ReadRequest<Ballot>} - ReadRequest returning ballot info
   */
  getBallotByIndex: (votingId, ballotIndex) => {
    return new ReadRequest([
      'services/votings_service/v1/ballot-by-index',
      `?voting_id=${votingId}&ballot_index=${ballotIndex}`,
    ].join(''));
  },
  /**
   * Makes ReadRequest returning ballot info
   * @param {string} votingId - voting Id
   * @param {string} storeTxHash - hash of store ballot transaction
   * @return {ReadRequest<Ballot>} - ReadRequest returning ballot info
   */
  getBallotByStoreTxHash: (votingId, storeTxHash) => {
    return new ReadRequest([
      'services/votings_service/v1/ballot-by-store-tx-hash',
      `?voting_id=${votingId}&store_tx_hash=${storeTxHash}`,
    ].join(''));
  },
  /**
   * Makes ReadRequest returning invalid ballots for all districts
   * @param {string} votingId - voting Id
   * @return {ReadRequest<Object.{Ballot[]}>} ReadRequest returning invalid ballots
   * by district map
   */
  getInvalidBallots: (votingId) => {
    return new ReadRequest([
      'services/votings_service/v1/invalid-ballots',
      `?voting_id=${votingId}`,
    ].join(''));
  },
  /**
   * Makes ReadRequest returning voting results for all districts if voting is finished
   * @param {string} votingId - voting Id
   * @return {ReadRequest<Object.<number, VotingResults>} - ReadRequest returning voting results
   */
  getVotingResults: (votingId) => {
    return new ReadRequest([
      'services/votings_service/v1/voting-results',
      `?voting_id=${votingId}`,
    ].join(''));
  },
};
