const ethers = require('ethers');

const {
  VotersRegistry: { abi, bytecode },
} = require('smart-contracts');

const { txReceiptParseLogs } = require('../helpers');

const Ownable = require('./ownable.js');

class VotersRegistry extends Ownable {
  constructor(contract) {
    super();

    this.contract = contract;
  }

  // Fields
  get address() {
    return this.contract.address;
  }

  // Getters
  async isRegistrationStopped() {
    return this.contract.isRegistrationStopped();
  }

  async getVotersCount() {
    return this.contract.getVotersCount();
  }

  /**
   * Returns map with issued ballots amount by each voting
   * @return {Promise{Object}} - promise resolved with map votingId => issuedBallotsCount
   */
  async getIssuedBallotsByVotingsCount() {
    return this.contract.getIssuedBallotsByVotingsCount()
      .then(([votingsIds, ballotsCount]) => { // eslint-disable-line arrow-body-style
        return votingsIds.reduce((votingsMap, votingId, index) => {
          // eslint-disable-next-line no-param-reassign
          votingsMap[votingId.toNumber()] = ballotsCount[index].toNumber();
          return votingsMap;
        }, {});
      });
  }

  async isAnyBallotIssued(voterId) {
    return this.contract.isAnyBallotIssued(voterId);
  }

  async getParticipationFor(voterId) {
    const [isParticipating, paricipationReceivedBlock] = await this.contract.getParticipationFor(
      voterId,
    );

    return { isParticipating, paricipationReceivedBlock };
  }

  async getRevocationFor(voterId) {
    const [isParticipationRevoked, revocationReceivedBlock] = await this.contract.getRevocationFor(
      voterId,
    );

    return { isParticipationRevoked, revocationReceivedBlock };
  }

  async getBallotFor(voterId, votingId) {
    const [isBallotIssued, ballotIssuedBlock] = await this.contract.getBallotFor(voterId, votingId);

    return { isBallotIssued, ballotIssuedBlock };
  }

  /**
   * Returns parsed events from transaction receipt
   * @param {Object} txReceipt - transaction receipt. Tx should be sent to this contract
   * @return {Object[]} - array of events in this transaction
   */
  // eslint-disable-next-line class-methods-use-this
  getEventsFromTransaction(txReceipt) {
    return txReceiptParseLogs(txReceipt, { abi, bytecode });
  }

  // "Setters"
  async stopRegistration() {
    const tx = await this.contract.stopRegistration();

    return tx.wait();
  }

  async addVoter(voterId) {
    const tx = await this.contract.addVoter(voterId);

    return tx.wait();
  }

  async addVotersBatch(votersIds) {
    const tx = await this.contract.addVotersBatch(votersIds);

    return tx.wait();
  }

  async revokeParticipation(voterId) {
    const tx = await this.contract.revokeParticipation(voterId);

    return tx.wait();
  }

  async issueBallotFor(voterId, votingId) {
    const tx = await this.contract.issueBallotFor(voterId, votingId);

    return tx.wait();
  }

  // Statics
  static async at(address, signerAccount) {
    const deployedContract = new ethers.Contract(address, abi, signerAccount);

    await deployedContract.deployed();

    return new VotersRegistry(deployedContract);
  }

  static async deploy(signerAccount) {
    const factory = new ethers.ContractFactory(abi, bytecode, signerAccount);

    const contract = await factory.deploy();

    await contract.deployed();

    return new VotersRegistry(contract);
  }
}

module.exports = VotersRegistry;
