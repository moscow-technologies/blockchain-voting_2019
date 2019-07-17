const { Wallet } = require('ethers');

class Account extends Wallet {
  constructor(privateKey, provider) {
    super(privateKey, provider);

    this.nonce = null;
    this.txSemaphore = null;

    if (provider) {
      this.txSemaphore = this.getTransactionCount()
        .then((txCount) => {
          this.nonce = txCount;
        });
    }
  }

  /**
   * Creates account with random generated keypair
   * @param {Object} [provider] - ethers connection provider
   */
  static createRandom(provider) {
    // eslint-disable-next-line prefer-destructuring
    const privateKey = Wallet.createRandom().signingKey.privateKey;
    return new Account(privateKey, provider);
  }

  sendTransaction(transaction) {
    if (!this.provider) {
      throw new Error('missing provider');
    }

    const tx = this.txSemaphore
      .then(() => {
        // eslint-disable-next-line no-param-reassign
        transaction.nonce = this.nonce;
        return super.sendTransaction(transaction);
      })
      .then((txResponse) => {
        this.nonce++; // eslint-disable-line no-plusplus
        return txResponse;
      });

    this.txSemaphore = tx.catch(() => {});

    return tx;
  }
}

const newRandomAccount = () => Account.createRandom();

const newRandomAccountWithProvider = provider => Account.createRandom(provider);

const accountFromPrivateKey = privateKey => new Account(privateKey);

// eslint-disable-next-line max-len
const accountFromPrivateKeyWithProvider = (privateKey, provider) => new Account(privateKey, provider);


module.exports = {
  newRandomAccount,
  newRandomAccountWithProvider,
  accountFromPrivateKey,
  accountFromPrivateKeyWithProvider,
};
