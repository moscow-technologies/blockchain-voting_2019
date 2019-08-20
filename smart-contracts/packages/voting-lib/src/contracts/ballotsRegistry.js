const ethers = require('ethers');
const { BigInteger: BigInt } = require('jsbn');

const {
  BallotsRegistry: { abi, bytecode },
} = require('smart-contracts');

const { txReceiptParseLogs, bigIntToBytes, bytesToBigInt } = require('../helpers');

const Ownable = require('./ownable.js');

/**
 * Normalizes some units in ballot data ontained from blockchain
 * @param {Object} ballotData - ballot data from blockchain
 * @return {Object} - normalized ballot data
 */
const normalizeBallotData = (ballotData) => {
  const [
    voter,
    votingId,
    receivedBlock,
    receivedBlockTimestamp,
    decryptedBlock,
    decryptedTimestamp,
    encryptedA,
    encryptedB,
    decryptedData,
    ballotIndex,
  ] = ballotData;

  const normalizedReceivedBlockTimestamp = receivedBlockTimestamp.toNumber() * 1000;
  const normalizedDecryptedTimestamp = decryptedTimestamp.toNumber() * 1000;
  const normalizedEncryptedA = bytesToBigInt(encryptedA).toString();
  const normalizedEncryptedB = bytesToBigInt(encryptedB).toString();

  return {
    voter,
    votingId,
    receivedBlock,
    receivedBlockTimestamp: normalizedReceivedBlockTimestamp,
    decryptedBlock,
    decryptedTimestamp: normalizedDecryptedTimestamp,
    encryptedA: normalizedEncryptedA,
    encryptedB: normalizedEncryptedB,
    decryptedData,
    index: ballotIndex,
  };
};

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

  /**
   * @return {string} - module (decimal as string)
   */
  async getModuleP() {
    return this.contract.getModuleP().then(mod => bytesToBigInt(mod).toString());
  }

  /**
   * @return {string} - generator (decimal as string)
   */
  async getGeneratorG() {
    return this.contract.getGeneratorG().then(gen => bytesToBigInt(gen).toString());
  }

  /**
   * @return {string} - public key (decimal as string)
   */
  async getPublicKey() {
    return this.contract.getPublicKey().then(pk => bytesToBigInt(pk).toString());
  }

  /**
   * @return {string} - private key (decimal as string)
   */
  async getPrivateKey() {
    return this.contract.getPrivateKey().then(pk => bytesToBigInt(pk).toString());
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
    const ballotData = await this.contract.getBallotByIndex(index);
    return normalizeBallotData(ballotData);
  }

  /**
   * Returns ballot info by control hash.
   * Control hash can be created from store transaction params,
   * it is keccak256 hash from tightly packed stora transaction data
   * (msg.sender, votingId, encryptedA, encryptedB).
   * With ethers.js you can calculate hash like this:
   *   ethers.utils.solidityKeccak256(
   *     ['address', 'uint256', 'bytes', 'bytes'],
   *     [tx.from, votingId.toString(), encryptedA, encryptedB],
   *   );
   * @param {string} controlHash - ballot control hash
   * @return {Promise<Object>} - promise resolved with ballot data
   */
  async getBallotByControlHash(controlHash) {
    const ballotData = await this.contract.getBallotByControlHash(controlHash);
    return normalizeBallotData(ballotData);
  }

  /**
   * Returns ballot data by storeBallot transaction data
   * @param {Object} tx - storeBallot transaction data (see ethers Transaction)
   * @return {Promise<Object>} - promise resolved with ballot data
   */
  async getBallotByStoreTransaction(tx) {
    if (tx.to !== this.contract.address) {
      // eslint-disable-next-line prefer-const
      let err = new Error('Transaction destination contract address does not match');
      err.code = 'INCORRECT_DESTINATION_ADDRESS';
      throw err;
    }

    const registryInterface = new ethers.utils.Interface(abi);
    const { signature, args: transactionArgs } = registryInterface.parseTransaction(tx);

    if (signature !== registryInterface.functions.addBallot.signature) {
      // eslint-disable-next-line prefer-const
      let err = new Error('Incorrect contract method used in transaction');
      err.code = 'INCORRECT_CONTRACT_METHOD';
      throw err;
    }

    const [votingId, encryptedA, encryptedB] = transactionArgs;

    const ballotControlHash = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'bytes', 'bytes'],
      [tx.from, votingId.toString(), encryptedA, encryptedB],
    );

    return this.getBallotByControlHash(ballotControlHash);
  }

  /**
   * Returns indices of ballots stored for given voting ID
   * @param {number} votingId - voting ID
   * @return {Promise<number[]} - ballots indices
   */
  async getBallotsByVotingId(votingId) {
    const data = await this.contract.getBallotsByVotingId(votingId);

    return data.map(el => el.toNumber());
  }

  /**
   * Returns parsed events from transaction receipt
   * @param {Object} txReceipt - transaction receipt. Tx should be sent to this contract
   * @return {Object[]} - array of events in this transaction
   */
  getEventsFromTransaction(txReceipt) { // eslint-disable-line class-methods-use-this
    return txReceiptParseLogs(txReceipt, { abi, bytecode });
  }

  /**
   * Returns parsed decrypt transations found in given transaction set
   * @param {Object[]} - transactions set (see ethers TransactionResponse)
   * @return {Object[]} - decryptBallot txs combined data
   * (see ethers TransactionResponse + TransactionDescription)
   */
  filterDecryptTransactions(txResponses) {
    const registryInterface = new ethers.utils.Interface(abi);
    const decryptBallotSignature = registryInterface.functions.storeDecryptedData.signature;

    return txResponses
      .filter(tx => tx.to === this.contract.address)
      .map(tx => Object.assign({}, tx, registryInterface.parseTransaction(tx)))
      .filter(txDesc => txDesc.signature === decryptBallotSignature);
  }

  /**
   * Closes registry, fobiding further storeBallot transactions
   * @return {Promise<void>} - promise resolved when registry closed
   */
  async closeRegistry() {
    const tx = await this.contract.closeRegistry();

    return tx.wait();
  }

  /**
   * Publishes private key
   * @param {string} key - private key (decimal as string)
   * @return {Promise<void>} - promise resolved when key published
   */
  async publishPrivateKey(key) {
    const tx = await this.contract.publishPrivateKey(bigIntToBytes(new BigInt(key)));

    return tx.wait();
  }

  /**
   * Adds account as allowed voter in given voting, permitting storeBallot transaction from it
   * @param {string} voterAddress - blockchain account address
   * @param {number} allowedVoting - voting ID
   * @return {Promise<void>} - promise resolved when permission granted
   */
  async addVoterToAllowedVoters(voterAddress, allowedVoting) {
    const tx = await this.contract.addVoterToAllowedVoters(voterAddress, allowedVoting);

    return tx.wait();
  }

  /**
   * Stores ballot
   * @param {number} votingId - voting ID
   * @param {number|string} data - data to encrypt (number or representation as decimal string)
   * @param {number|string} entropy - additional encryption entropy
   * @param {ElGamal} cryptor - ElGamal cryptor instance
   * @return {Promise<void>} - promise resolved when ballot stored
   */
  async addBallot(votingId, data, entropy, cryptor) {
    const { a, b } = await cryptor.encrypt(data, entropy);

    const tx = await this.contract.addBallot(
      votingId,
      bigIntToBytes(new BigInt(a)),
      bigIntToBytes(new BigInt(b)),
      { gasLimit: 1000000 },
    );

    return tx.wait();
  }

  /**
   * addBallot as SIGNED RAW TX
   *
   * WARNING! Starting NONCE for ALL accounts is 0xFF, so for
   * every account next nonce will equal 255, by default.
   * But you MUST calculate proper nonce if you want to pass
   * more than one TX from one account.
   * @param {number} votingId - voting ID
   * @param {number|string} data - data to encrypt (number or representation as decimal string)
   * @param {number|string} entropy - additional encryption entropy
   * @param {ElGamal} cryptor - ElGamal cryptor instance
   * @param {Promise} [getNonce] - promise that resolves with correct nonce value for transaction
   * @return {Promise<string>} - promise resolved with signed raw transaction
   */
  // eslint-disable-next-line max-len
  async addBallotRAW(votingId, data, entropy, cryptor, getNonce = Promise.resolve(255)) {
    const { a, b } = await cryptor.encrypt(data, entropy);

    const tx = {};

    tx.to = this.address;
    // tx.from = await this.contract.signer.getAddress();
    tx.data = this.contract.interface.functions.addBallot.encode([
      votingId,
      bigIntToBytes(new BigInt(a)),
      bigIntToBytes(new BigInt(b)),
    ]);

    tx.gasLimit = 1000000;
    tx.nonce = await getNonce; // We can pass Promise here, which will return a Number

    return this.contract.signer.sign(tx);
  }

  /**
   * Launches ballot decryption
   * @param {number} index - ballot index
   * @param {ElGamal} cryptor - cryptor with decryption key
   * @return {Promise<void>} - promise resolved when ballot decrypted
   */
  async decryptBallot(index, cryptor) {
    const ballotData = await this.getBallotByIndex(index);

    // if ballot contains decrypted value, skip decryption
    if (ballotData.decryptedData.toNumber() !== 0) {
      return Promise.resolve();
    }

    const decrypted = await cryptor.decrypt({
      a: ballotData.encryptedA,
      b: ballotData.encryptedB,
    });

    const tx = await this.contract.storeDecryptedData(index, decrypted);
    return tx.wait();
  }

  // Statics
  static async at(address, signerAccount) {
    const deployedContract = new ethers.Contract(address, abi, signerAccount);

    // Offline account will not have a Provider to call getCode,
    // but we must be sure, that there is a valid BallotRegistry
    // on this address
    if (signerAccount.provider) {
      await deployedContract.deployed();
    }

    return new BallotsRegistry(deployedContract);
  }

  /**
   * Deploys ballots registry contract
   * @param {string} moduleP - cryptosystem module
   * @param {string} generatorG - cryptosystem generator
   * @param {string} publicKey - cryptosystem public key
   * @param {string} signerAccount - ethers account who should deploy contract
   * @return {Promise<BallotsRegistry>} - promise resolved with BallotsRegistry contract wrapper
   * (this instance in fact)
   */
  static async deploy(moduleP, generatorG, publicKey, signerAccount) {
    const factory = new ethers.ContractFactory(abi, bytecode, signerAccount);

    const contract = await factory.deploy(
      bigIntToBytes(new BigInt(moduleP)),
      bigIntToBytes(new BigInt(generatorG)),
      bigIntToBytes(new BigInt(publicKey)),
    );

    await contract.deployed();

    return new BallotsRegistry(contract);
  }
}

module.exports = BallotsRegistry;
