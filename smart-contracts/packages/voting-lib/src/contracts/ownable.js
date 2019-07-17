const ethers = require('ethers');

const {
  Ownable: { abi },
} = require('smart-contracts');

class Ownable {
  constructor(contract) {
    this.contract = contract;
  }

  // Fields
  get address() {
    return this.contract.address;
  }

  // Getters
  async getOwner() {
    return this.contract.getOwner();
  }

  async isOwner() {
    return this.contract.isOwner();
  }

  // "Setters"
  async transferOwnership(address) {
    const tx = await this.contract.transferOwnership(address);

    return tx.wait();
  }

  // Statics
  static async at(address, signerAccount) {
    const deployedContract = new ethers.Contract(address, abi, signerAccount);

    await deployedContract.deployed();

    return new Ownable(deployedContract);
  }

  static async deploy() {
    throw new Error('Can not deploy Ownable by itself!');
  }
}

module.exports = Ownable;
