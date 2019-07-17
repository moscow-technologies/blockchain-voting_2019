const ethers = require('ethers');

const {
  BallotsRegistry: { abi, bytecode },
} = require('smart-contracts');

const { txReceiptParseLogs } = require('../helpers');

const Ownable = require('./ownable.js');

class BallotsRegistry extends Ownable {
  constructor(contract) {
    super();

    this.contract = contract;
  }

  // Fields
  get address() {
    return this.contract.address;
  }

  // Getters
  async isRegistryClosed() {
    return this.contract.isRegistryClosed();
  }

  async getModulesP() {
    return this.contract.getModulesP();
  }

  async getGeneratorsG() {
    return this.contract.getGeneratorsG();
  }

  async getPublicKeys() {
    return this.contract.getPublicKeys();
  }

  async getPrivateKeys() {
    return this.contract.getPrivateKeys();
  }

  async getBallotsCount() {
    return this.contract.getBallotsCount();
  }

  /**
   * Returns map with ballots amount by each voting
   * @return {Promise{Object}} - promise resolved with map votingId => issuedBallotsCount
   */
  async getBallotsByVotingsCount() {
    return this.contract.getBallotsByVotingsCount()
      .then(([votingsIds, ballotsCount]) => { // eslint-disable-line arrow-body-style
        return votingsIds.reduce((votingsMap, votingId, index) => {
          // eslint-disable-next-line no-param-reassign
          votingsMap[votingId.toNumber()] = ballotsCount[index].toNumber();
          return votingsMap;
        }, {});
      });
  }

  async getBallotByIndex(index) {
    const [
      voter,
      votingId,
      receivedBlock,
      receivedBlockTimestamp,
      decryptedBlock,
      decryptedTimestamp,
      encryptedData,
      decryptedData,
      ballotIndex,
    ] = await this.contract.getBallotByIndex(index);

    return {
      voter,
      votingId,
      receivedBlock,
      receivedBlockTimestamp,
      decryptedBlock,
      decryptedTimestamp,
      encryptedData,
      decryptedData,
      index: ballotIndex,
    };
  }

  async getBallotByControlHash(controlHash) {
    const [
      voter,
      votingId,
      receivedBlock,
      receivedBlockTimestamp,
      decryptedBlock,
      decryptedTimestamp,
      encryptedData,
      decryptedData,
      ballotIndex,
    ] = await this.contract.getBallotByControlHash(controlHash);

    return {
      voter,
      votingId,
      receivedBlock,
      receivedBlockTimestamp,
      decryptedBlock,
      decryptedTimestamp,
      encryptedData,
      decryptedData,
      index: ballotIndex,
    };
  }

  async getBallotsByVotingId(votingId) {
    const data = await this.contract.getBallotsByVotingId(votingId);

    return data.map(el => el.toNumber());
  }

  /**
   * Returns parsed events from trabsaction receipt
   * @param {Object} txReceipt - transaction receipt. Tx should be sent to this contract
   * @return {Object[]} - array of events in this transaction
   */
  // eslint-disable-next-line class-methods-use-this
  getEventsFromTransaction(txReceipt) {
    return txReceiptParseLogs(txReceipt, { abi, bytecode });
  }

  // "Setters"
  async closeRegistry() {
    const tx = await this.contract.closeRegistry();

    return tx.wait();
  }

  async publishPrivateKeys(key) {
    const tx = await this.contract.publishPrivateKeys(key);

    return tx.wait();
  }

  async addVoterToAllowedVoters(voterAddress, allowedVoting) {
    const tx = await this.contract.addVoterToAllowedVoters(voterAddress, allowedVoting);

    return tx.wait();
  }

  async addBallot(votingId, data, entropy, multiLevelEncryptor) {
    const {
      levelOneB,
      levelTwoB,
      levelThreeA,
      levelThreeB,
    } = await multiLevelEncryptor.encrypt(data, entropy);

    const tx = await this.contract.addBallot(votingId, [
      levelOneB,
      levelTwoB,
      levelThreeA,
      levelThreeB,
    ]);

    return tx.wait();
  }

  /**
   * addBallot as SIGNED RAW TX
   *
   * WARNING! Starting NONCE for ALL accounts is 0xFF, so for
   * every account next nonce will equal 255, by default.
   * But you MUST to calculate proper nonce if you want to pass
   * more than one TX from one account.
   */
  // eslint-disable-next-line max-len
  async addBallotRAW(votingId, data, entropy, multiLevelEncryptor, getNonce = Promise.resolve(255)) {
    const {
      levelOneB,
      levelTwoB,
      levelThreeA,
      levelThreeB,
    } = await multiLevelEncryptor.encrypt(data, entropy);

    const tx = {};

    tx.to = this.address;
    // tx.from = await this.contract.signer.getAddress();
    tx.data = this.contract.interface.functions.addBallot.encode([votingId, [
      levelOneB,
      levelTwoB,
      levelThreeA,
      levelThreeB,
    ]]);

    tx.gasLimit = 600000;
    tx.nonce = await getNonce; // We can pass Promise here, which will return a Number

    return this.contract.signer.sign(tx);
  }

  async decryptBallot(index) {
    const tx = await this.contract.decryptBallot(index);

    return tx.wait();
  }

  // Statics
  static async at(address, signerAccount) {
    const deployedContract = new ethers.Contract(address, abi, signerAccount);

    // Offline account will not have a Provder to call getCode,
    // but we must be sure, that there is a valid BallotRegistry
    // on this address
    if (signerAccount.provider) {
      await deployedContract.deployed();
    }

    return new BallotsRegistry(deployedContract);
  }

  static async deploy(modulesP, generatorsG, publicKeys, signerAccount) {
    const factory = new ethers.ContractFactory(abi, bytecode, signerAccount);

    const contract = await factory.deploy(modulesP, generatorsG, publicKeys);

    await contract.deployed();

    return new BallotsRegistry(contract);
  }
}

module.exports = BallotsRegistry;
