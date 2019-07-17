const Shamir = require('secrets.js-grempe');
const RSA = require('node-rsa');

const ElGamal = require('./elGamal');
const { checkEveryFieldIsSame } = require('./utils');

class ElGamalPartitioner {
  static partition(
    elGamalInstance,
    partsCount = 5,
    partsThreshold = 3,
    padLength = 1024,
    rsaKeyLength = 4096,
  ) {
    if (!(elGamalInstance instanceof ElGamal)) {
      throw new Error('Only instances of ElGamal can be partitioned!');
    }

    if (partsCount < 2) {
      throw new Error('Parts Count can not be less than 2!');
    }

    if (partsCount > 255) {
      throw new Error('Parts Count can not be more than 255!');
    }

    if (partsThreshold > partsCount) {
      throw new Error('Parts Threshold can not be more than Parts Count!');
    }

    if (partsThreshold < 1) {
      throw new Error('Parts Threshold can not less than 1!');
    }

    if (padLength > 1024) {
      throw new Error('Pad Length can not be more than 1024!');
    }

    const rsaKey = new RSA({ key: rsaKeyLength });
    const signaturePublicKey = Buffer.from(rsaKey.exportKey('public')).toString('base64');

    // Cryptosystem fields to recreate it later
    const modulePAsString = elGamalInstance.moduleP.toString();
    const generatorGAsString = elGamalInstance.generatorG.toString();
    const publicKeyAsString = elGamalInstance.publicKey.toString();

    // Data to be partitioned
    const privateKeyAsString = elGamalInstance.privateKey.toString();
    const privateKeyHash = rsaKey.sign(privateKeyAsString, 'base64', 'base64').toString();

    /**
     * @type Array<Object>
     */
    const parts = Shamir.share(privateKeyAsString, partsCount, partsThreshold, padLength);

    return parts.map(privateKeyPart => ({
      partsCount,
      partsThreshold,
      moduleP: modulePAsString,
      generatorG: generatorGAsString,
      publicKey: publicKeyAsString,
      privateKeyPart,
      privateKeyPartHash: rsaKey.sign(privateKeyPart, 'base64', 'base64').toString(),
      privateKeyHash,
      signaturePublicKey,
    }));
  }

  static combine(hashedParts) {
    if (hashedParts.length === 0) {
      throw new Error('Hashed Parts is Empty!');
    }

    if (hashedParts.length > hashedParts[0].partsCount) {
      throw new Error('Too many Hashed Parts!');
    }

    if (hashedParts.length < hashedParts[0].partsThreshold) {
      throw new Error('Not enough Hashed Parts!');
    }

    checkEveryFieldIsSame(hashedParts, 'partsCount');
    checkEveryFieldIsSame(hashedParts, 'partsThreshold');
    checkEveryFieldIsSame(hashedParts, 'moduleP');
    checkEveryFieldIsSame(hashedParts, 'generatorG');
    checkEveryFieldIsSame(hashedParts, 'publicKey');
    checkEveryFieldIsSame(hashedParts, 'privateKeyHash');
    checkEveryFieldIsSame(hashedParts, 'signaturePublicKey');

    const rsaKey = new RSA();
    const signaturePublicKey = Buffer.from(hashedParts[0].signaturePublicKey, 'base64');

    rsaKey.importKey(signaturePublicKey, 'public');

    const parts = hashedParts.map((partObj) => {
      // eslint-disable-next-line max-len
      if (!rsaKey.verify(partObj.privateKeyPart, partObj.privateKeyPartHash, 'base64', 'base64')) {
        throw new Error(`Hashed Part ${partObj.privateKeyPart} hash is wrong!`);
      }

      return partObj.privateKeyPart;
    });

    const rebuiltPrivateKey = Shamir.combine(parts);
    // eslint-disable-next-line max-len
    const isValidPrivateKeyHash = hashedParts.every(part => rsaKey.verify(rebuiltPrivateKey, part.privateKeyHash, 'base64', 'base64'));

    if (!isValidPrivateKeyHash) {
      throw new Error('One of Hashed Parts has wrong Private Key hash!');
    }

    const { moduleP, generatorG, publicKey } = hashedParts[0];

    return ElGamal.buildWithPrivateKey(moduleP, generatorG, publicKey, rebuiltPrivateKey);
  }
}

module.exports = ElGamalPartitioner;
