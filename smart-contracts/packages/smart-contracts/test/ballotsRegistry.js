const truffleAssert = require('truffle-assertions');

const { MultiLevelEncryptor } = require('crypto-lib');

const catchThrow = require('./utils/catchThrow');

const BallotsRegistry = artifacts.require('BallotsRegistry');

contract('BallotsRegistry', (accounts) => {
  let admin;
  let hacker;
  let otherUser;

  /** @type MultiLevelEncryptor */
  let cryptor;

  let modulesP;
  let generatorsG;
  let publicKeys;
  let privateKeys;

  let ballotsRegistry;

  before(async () => {
    [
      admin,
      hacker,
      otherUser,
    ] = accounts;

    ({ encryptor: cryptor, privateKeys } = await MultiLevelEncryptor.generateRandom());

    modulesP = cryptor.getModulesP();
    generatorsG = cryptor.getGeneratorsG();
    publicKeys = cryptor.getPublicKeys();
  });

  beforeEach(async () => {
    ballotsRegistry = await BallotsRegistry.new(modulesP, generatorsG, publicKeys, { from: admin });
  });

  describe('is Ownable', () => {
    it('#getOwner() should return proper owner', async () => {
      const owner = await ballotsRegistry.getOwner({ from: hacker });

      assert.equal(owner, admin);
    });

    it('#isOwner() should return proper value', async () => {
      const isAdminOwner = await ballotsRegistry.isOwner({ from: admin });
      const isHackerOwner = await ballotsRegistry.isOwner({ from: hacker });

      assert.isTrue(isAdminOwner);
      assert.isFalse(isHackerOwner);
    });

    it('#transferOwnership() transfer ownership properly', async () => {
      let owner = await ballotsRegistry.getOwner({ from: hacker });
      assert.equal(owner, admin);

      const transferTX = await ballotsRegistry.transferOwnership(hacker, { from: admin });
      truffleAssert.eventEmitted(
        transferTX,
        'OwnershipTransferred',
        ev => ev.previousOwner === admin && ev.newOwner === hacker,
      );

      owner = await ballotsRegistry.getOwner({ from: hacker });
      assert.equal(owner, hacker);

      let shouldThrowTX = ballotsRegistry.transferOwnership(hacker, { from: admin });
      await catchThrow(shouldThrowTX);

      shouldThrowTX = ballotsRegistry.transferOwnership(
        '0x0000000000000000000000000000000000000000',
        { from: hacker },
      );
      await catchThrow(shouldThrowTX);
    });
  });

  describe('constuctor', () => {
    it('must throw on invalid arguments', async () => {
      let shouldThrowTX;

      shouldThrowTX = BallotsRegistry.new([0, 1, 1], generatorsG, publicKeys, { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');

      shouldThrowTX = BallotsRegistry.new([1, 0, 1], generatorsG, publicKeys, { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');

      shouldThrowTX = BallotsRegistry.new([1, 1, 0], generatorsG, publicKeys, { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');

      shouldThrowTX = BallotsRegistry.new(modulesP, [0, 1, 1], publicKeys, { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');

      shouldThrowTX = BallotsRegistry.new(modulesP, [1, 0, 1], publicKeys, { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');

      shouldThrowTX = BallotsRegistry.new(modulesP, [1, 1, 0], publicKeys, { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');

      shouldThrowTX = BallotsRegistry.new(modulesP, generatorsG, [0, 1, 1], { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');

      shouldThrowTX = BallotsRegistry.new(modulesP, generatorsG, [1, 0, 1], { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');

      shouldThrowTX = BallotsRegistry.new(modulesP, generatorsG, [1, 1, 0], { from: admin });
      await catchThrow(shouldThrowTX, 'gas limit');
    });
  });

  describe('#addBallot', async () => {
    it('allowed only to Allowed Voters', async () => {
      let ballotsCount;
      let shouldThrowTX;

      ballotsCount = await ballotsRegistry.getBallotsCount();
      assert.equal(0, ballotsCount);

      // Can not vote if not allowed
      shouldThrowTX = ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: admin });
      await catchThrow(shouldThrowTX);

      // Can not vote if not allowed
      shouldThrowTX = ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: hacker });
      await catchThrow(shouldThrowTX);

      // Only owner can add
      shouldThrowTX = ballotsRegistry.addVoterToAllowedVoters(admin, 1, { from: hacker });
      await catchThrow(shouldThrowTX);

      // Can not add self
      shouldThrowTX = ballotsRegistry.addVoterToAllowedVoters(admin, 1, { from: admin });
      await catchThrow(shouldThrowTX);

      // Can add other user
      const addVoterTx = await ballotsRegistry.addVoterToAllowedVoters(hacker, 1, {
        from: admin,
      });
      truffleAssert.eventEmitted(addVoterTx, 'AllowedVoterAdded', ev => ev.voter === hacker);

      // Can not vote if not allowed
      shouldThrowTX = ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: admin });
      await catchThrow(shouldThrowTX);

      // Voter is allowed, but Voting ID is not allowed
      shouldThrowTX = ballotsRegistry.addBallot(3, [2, 3, 4, 5], { from: hacker });
      await catchThrow(shouldThrowTX);

      // Allowed Voter and VoterID allowed
      await ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: hacker });

      ballotsCount = await ballotsRegistry.getBallotsCount();
      assert.equal(1, ballotsCount);
    });

    it('forbids to pass ballot twice', async () => {
      let ballotsCount = await ballotsRegistry.getBallotsCount();
      assert.equal(0, ballotsCount);

      let shouldThrowTX = ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: otherUser });
      await catchThrow(shouldThrowTX);

      const addVoterTxOne = await ballotsRegistry.addVoterToAllowedVoters(otherUser, 1, {
        from: admin,
      });
      truffleAssert.eventEmitted(
        addVoterTxOne,
        'AllowedVoterAdded',
        ev => ev.voter === otherUser && ev.allowedVoting.toNumber() === 1,
      );

      const addVoterTxTwo = await ballotsRegistry.addVoterToAllowedVoters(otherUser, 2, {
        from: admin,
      });
      truffleAssert.eventEmitted(
        addVoterTxTwo,
        'AllowedVoterAdded',
        ev => ev.voter === otherUser && ev.allowedVoting.toNumber() === 2,
      );

      // eslint-disable-next-line max-len
      const addTXFirstVoting = await ballotsRegistry.addBallot(1, [1, 2, 4, 5], {
        from: otherUser,
      });
      truffleAssert.eventEmitted(
        addTXFirstVoting,
        'BallotAdded',
        ev => ev.votingId.toNumber() === 1 && ev.index.toNumber() === 0,
      );

      // eslint-disable-next-line max-len
      const addTXSecondVoting = await ballotsRegistry.addBallot(2, [4, 5, 6, 7], {
        from: otherUser,
      });
      truffleAssert.eventEmitted(
        addTXSecondVoting,
        'BallotAdded',
        ev => ev.votingId.toNumber() === 2 && ev.index.toNumber() === 1,
      );

      shouldThrowTX = ballotsRegistry.addBallot(1, [2, 3, 6, 8], { from: otherUser });
      await catchThrow(shouldThrowTX);

      ballotsCount = await ballotsRegistry.getBallotsCount();
      assert.equal(2, ballotsCount);

      const ballotsForFirst = await ballotsRegistry.getBallotsByVotingId(1);
      assert.deepEqual([0], ballotsForFirst.map(el => el.toNumber()));

      const ballotsForSecond = await ballotsRegistry.getBallotsByVotingId(2);
      assert.deepEqual([1], ballotsForSecond.map(el => el.toNumber()));

      const ballotsForThird = await ballotsRegistry.getBallotsByVotingId(3);
      assert.empty(ballotsForThird);
    });

    it('forbids to pass ballot after private key was published', async () => {
      let ballotsCount;
      let shouldThrowTX;
      let addVoterTx;

      ballotsCount = await ballotsRegistry.getBallotsCount();
      assert.equal(0, ballotsCount);

      shouldThrowTX = ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: otherUser });
      await catchThrow(shouldThrowTX);

      shouldThrowTX = ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: hacker });
      await catchThrow(shouldThrowTX);

      addVoterTx = await ballotsRegistry.addVoterToAllowedVoters(otherUser, 1, { from: admin });
      truffleAssert.eventEmitted(
        addVoterTx,
        'AllowedVoterAdded',
        ev => ev.voter === otherUser && ev.allowedVoting.toNumber() === 1,
      );

      addVoterTx = await ballotsRegistry.addVoterToAllowedVoters(hacker, 1, { from: admin });
      truffleAssert.eventEmitted(
        addVoterTx,
        'AllowedVoterAdded',
        ev => ev.voter === hacker && ev.allowedVoting.toNumber() === 1,
      );

      // First Ballot should work fine
      // eslint-disable-next-line max-len
      const addTXFirstVoting = await ballotsRegistry.addBallot(1, [1, 2, 4, 5], {
        from: otherUser,
      });
      truffleAssert.eventEmitted(
        addTXFirstVoting,
        'BallotAdded',
        ev => ev.votingId.toNumber() === 1 && ev.index.toNumber() === 0,
      );

      await ballotsRegistry.closeRegistry();

      const publishTX = await ballotsRegistry.publishPrivateKeys(privateKeys, { from: admin });
      truffleAssert.eventEmitted(
        publishTX,
        'PrivateKeysPublished',
        ev => ev.privateKeys[0].toString() === privateKeys[0].toString(),
      );

      const actualPrivateKeys = await ballotsRegistry.getPrivateKeys();
      assert.equal(actualPrivateKeys[0].toString(), privateKeys[0].toString());
      assert.equal(actualPrivateKeys[1].toString(), privateKeys[1].toString());
      assert.equal(actualPrivateKeys[2].toString(), privateKeys[2].toString());

      // Second Ballot is passed to late, Private Key is already published
      shouldThrowTX = ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: hacker });
      await catchThrow(shouldThrowTX);

      ballotsCount = await ballotsRegistry.getBallotsCount();
      assert.equal(1, ballotsCount);

      const ballotsForFirst = await ballotsRegistry.getBallotsByVotingId(1);
      assert.deepEqual([0], ballotsForFirst.map(el => el.toNumber()));
    });

    it('add Ballots properly', async () => {
      let ballotsCount = await ballotsRegistry.getBallotsCount();
      assert.equal(0, ballotsCount);

      let addVoterTx = await ballotsRegistry.addVoterToAllowedVoters(hacker, 1, { from: admin });
      truffleAssert.eventEmitted(
        addVoterTx,
        'AllowedVoterAdded',
        ev => ev.voter === hacker && ev.allowedVoting.toNumber() === 1,
      );

      addVoterTx = await ballotsRegistry.addVoterToAllowedVoters(otherUser, 1, { from: admin });
      truffleAssert.eventEmitted(
        addVoterTx,
        'AllowedVoterAdded',
        ev => ev.voter === otherUser && ev.allowedVoting.toNumber() === 1,
      );

      const addTXOne = await ballotsRegistry.addBallot(1, [1, 2, 4, 5], { from: otherUser });
      truffleAssert.eventEmitted(
        addTXOne,
        'BallotAdded',
        ev => ev.votingId.toNumber() === 1 && ev.index.toNumber() === 0,
      );

      const addTXTwo = await ballotsRegistry.addBallot(1, [2, 3, 4, 5], { from: hacker });
      truffleAssert.eventEmitted(
        addTXTwo,
        'BallotAdded',
        ev => ev.votingId.toNumber() === 1 && ev.index.toNumber() === 1,
      );

      ballotsCount = await ballotsRegistry.getBallotsCount();
      assert.equal(ballotsCount.toNumber(), 2);

      const ballotsForFirst = await ballotsRegistry.getBallotsByVotingId(1);
      assert.deepEqual([0, 1], ballotsForFirst.map(el => el.toNumber()));

      const ballotOne = await ballotsRegistry.getBallotByIndex(0);
      const ballotTwo = await ballotsRegistry.getBallotByIndex(1);

      assert.equal(ballotOne[0], otherUser);
      assert.equal(ballotOne[1].toNumber(), 1);
      assert.notEqual(ballotOne[2].toNumber(), 0);
      assert.notEqual(ballotOne[3].toNumber(), 0);
      assert.equal(ballotOne[4].toNumber(), 0);
      assert.equal(ballotOne[5].toNumber(), 0);
      assert.equal(ballotOne[6][0].toNumber(), 1);
      assert.equal(ballotOne[6][1].toNumber(), 2);
      assert.equal(ballotOne[6][2].toNumber(), 4);
      assert.equal(ballotOne[6][3].toNumber(), 5);
      assert.equal(ballotOne[7].toNumber(), 0);
      assert.equal(ballotOne[8].toNumber(), 0);

      assert.equal(ballotTwo[0], hacker);
      assert.equal(ballotTwo[1].toNumber(), 1);
      assert.notEqual(ballotTwo[2].toNumber(), 0);
      assert.notEqual(ballotTwo[3].toNumber(), 0);
      assert.equal(ballotTwo[4].toNumber(), 0);
      assert.equal(ballotTwo[5].toNumber(), 0);
      assert.equal(ballotTwo[6][0].toNumber(), 2);
      assert.equal(ballotTwo[6][1].toNumber(), 3);
      assert.equal(ballotTwo[6][2].toNumber(), 4);
      assert.equal(ballotTwo[6][3].toNumber(), 5);
      assert.equal(ballotTwo[7].toNumber(), 0);
      assert.equal(ballotTwo[8].toNumber(), 1);
    });
  });

  describe('#publishPrivateKeys', async () => {
    it('allowed only to Owner', async () => {
      const shouldThrowTX = ballotsRegistry.publishPrivateKeys(privateKeys, { from: hacker });
      await catchThrow(shouldThrowTX);
    });

    it('works properly', async () => {
      await ballotsRegistry.closeRegistry();

      const publishTX = await ballotsRegistry.publishPrivateKeys(privateKeys, { from: admin });
      truffleAssert.eventEmitted(
        publishTX,
        'PrivateKeysPublished',
        ev => ev.privateKeys[0].toString() === privateKeys[0].toString(),
      );

      const actualPrivateKeys = await ballotsRegistry.getPrivateKeys();
      assert.equal(actualPrivateKeys[0].toString(), privateKeys[0].toString());
      assert.equal(actualPrivateKeys[1].toString(), privateKeys[1].toString());
      assert.equal(actualPrivateKeys[2].toString(), privateKeys[2].toString());
    });
  });

  describe('#crypto system getters', () => {
    it('#getModulesP works properly', async () => {
      const actualModulesP = await ballotsRegistry.getModulesP();
      assert.equal(actualModulesP[0].toString(), modulesP[0].toString());
      assert.equal(actualModulesP[1].toString(), modulesP[1].toString());
      assert.equal(actualModulesP[2].toString(), modulesP[2].toString());
    });

    it('#getGeneratorsG works properly', async () => {
      const actualGeneratorsG = await ballotsRegistry.getGeneratorsG();
      assert.equal(actualGeneratorsG[0].toString(), generatorsG[0].toString());
      assert.equal(actualGeneratorsG[1].toString(), generatorsG[1].toString());
      assert.equal(actualGeneratorsG[2].toString(), generatorsG[2].toString());
    });

    it('#getPublicKeys works properly', async () => {
      const actualPublicKeys = await ballotsRegistry.getPublicKeys();
      assert.equal(actualPublicKeys[0].toString(), publicKeys[0].toString());
      assert.equal(actualPublicKeys[1].toString(), publicKeys[1].toString());
      assert.equal(actualPublicKeys[2].toString(), publicKeys[2].toString());
    });

    it('#decryptBallot works properly', async () => {
      const originalData = Math.floor(Math.random() * Math.floor(10000));
      const entropy = Math.floor(Math.random() * Math.floor(1000000000));

      const {
        levelOneB, levelTwoB, levelThreeA, levelThreeB,
      } = await cryptor.encrypt(
        originalData,
        entropy,
      );

      await ballotsRegistry.addVoterToAllowedVoters(otherUser, 1, { from: admin });

      // eslint-disable-next-line max-len
      const addBallotTx = await ballotsRegistry.addBallot(
        1,
        [levelOneB, levelTwoB, levelThreeA, levelThreeB],
        {
          from: otherUser,
        },
      );
      truffleAssert.eventEmitted(
        addBallotTx,
        'BallotAdded',
        ev => ev.votingId.toNumber() === 1 && ev.index.toNumber() === 0,
      );

      await ballotsRegistry.closeRegistry();

      await ballotsRegistry.publishPrivateKeys(privateKeys, { from: admin });

      const ballotOneBeforeDecrypt = await ballotsRegistry.getBallotByIndex(0);
      assert.equal(ballotOneBeforeDecrypt[0], otherUser);
      assert.equal(ballotOneBeforeDecrypt[1].toNumber(), 1);
      assert.notEqual(ballotOneBeforeDecrypt[2].toNumber(), 0);
      assert.notEqual(ballotOneBeforeDecrypt[3].toNumber(), 0);
      assert.equal(ballotOneBeforeDecrypt[4].toNumber(), 0);
      assert.equal(ballotOneBeforeDecrypt[5].toNumber(), 0);
      assert.equal(ballotOneBeforeDecrypt[6][0].toString(), levelOneB);
      assert.equal(ballotOneBeforeDecrypt[6][1].toString(), levelTwoB);
      assert.equal(ballotOneBeforeDecrypt[6][2].toString(), levelThreeA);
      assert.equal(ballotOneBeforeDecrypt[6][3].toString(), levelThreeB);
      assert.equal(ballotOneBeforeDecrypt[7].toNumber(), 0);
      assert.equal(ballotOneBeforeDecrypt[8].toNumber(), 0);

      const decryptBallotTx = await ballotsRegistry.decryptBallot(0);
      truffleAssert.eventEmitted(decryptBallotTx, 'BallotDecrypted');

      const ballotOne = await ballotsRegistry.getBallotByIndex(0);

      assert.equal(ballotOne[0], otherUser);
      assert.equal(ballotOne[1].toNumber(), 1);
      assert.notEqual(ballotOne[2].toNumber(), 0);
      assert.notEqual(ballotOne[3].toNumber(), 0);
      assert.notEqual(ballotOne[4].toNumber(), 0);
      assert.notEqual(ballotOne[5].toNumber(), 0);
      assert.equal(ballotOne[6][0].toString(), levelOneB);
      assert.equal(ballotOne[6][1].toString(), levelTwoB);
      assert.equal(ballotOne[6][2].toString(), levelThreeA);
      assert.equal(ballotOne[6][3].toString(), levelThreeB);
      assert.equal(ballotOne[7].toNumber(), originalData);
      assert.equal(ballotOne[8].toNumber(), 0);
    });
  });

  describe('#getBallotByControlHash', () => {
    it('works properly', async () => {
      const originalData = Math.floor(Math.random() * Math.floor(10000));
      const entropy = Math.floor(Math.random() * Math.floor(1000000000));

      const {
        levelOneB, levelTwoB, levelThreeA, levelThreeB,
      } = await cryptor.encrypt(
        originalData,
        entropy,
      );

      await ballotsRegistry.addVoterToAllowedVoters(otherUser, 1, { from: admin });

      // eslint-disable-next-line max-len
      const addBallotTx = await ballotsRegistry.addBallot(
        1,
        [levelOneB, levelTwoB, levelThreeA, levelThreeB],
        {
          from: otherUser,
        },
      );
      truffleAssert.eventEmitted(
        addBallotTx,
        'BallotAdded',
        ev => ev.votingId.toNumber() === 1 && ev.index.toNumber() === 0,
      );

      let controlHashAfterAdded;
      truffleAssert.eventEmitted(addBallotTx, 'BallotAdded', (ev) => {
        controlHashAfterAdded = ev.controlHash;
        return true;
      });

      const ballot = await ballotsRegistry.getBallotByControlHash(controlHashAfterAdded);
      assert.equal(ballot[0], otherUser);
      assert.equal(ballot[1].toNumber(), 1);
      assert.notEqual(ballot[2].toNumber(), 0);
      assert.notEqual(ballot[3].toNumber(), 0);
      assert.equal(ballot[4].toNumber(), 0);
      assert.equal(ballot[5].toNumber(), 0);
      assert.equal(ballot[6][0].toString(), levelOneB);
      assert.equal(ballot[6][1].toString(), levelTwoB);
      assert.equal(ballot[6][2].toString(), levelThreeA);
      assert.equal(ballot[6][3].toString(), levelThreeB);
      assert.equal(ballot[7].toNumber(), 0);
      assert.equal(ballot[8].toNumber(), 0);

      await ballotsRegistry.closeRegistry();

      await ballotsRegistry.publishPrivateKeys(privateKeys, { from: admin });
      const decryptBallotTx = await ballotsRegistry.decryptBallot(0);

      const ballotOne = await ballotsRegistry.getBallotByIndex(0);
      assert.equal(ballotOne[0], otherUser);
      assert.equal(ballotOne[1].toNumber(), 1);
      assert.notEqual(ballotOne[2].toNumber(), 0);
      assert.notEqual(ballotOne[3].toNumber(), 0);
      assert.notEqual(ballotOne[4].toNumber(), 0);
      assert.notEqual(ballotOne[5].toNumber(), 0);
      assert.equal(ballotOne[6][0].toString(), levelOneB);
      assert.equal(ballotOne[6][1].toString(), levelTwoB);
      assert.equal(ballotOne[6][2].toString(), levelThreeA);
      assert.equal(ballotOne[6][3].toString(), levelThreeB);
      assert.equal(ballotOne[7].toNumber(), originalData);
      assert.equal(ballotOne[8].toNumber(), 0);

      let controlHashAfterDecrypted;
      truffleAssert.eventEmitted(decryptBallotTx, 'BallotDecrypted', (ev) => {
        controlHashAfterDecrypted = ev.controlHash;
        return true;
      });

      // eslint-disable-next-line max-len
      const ballotDecrypted = await ballotsRegistry.getBallotByControlHash(controlHashAfterDecrypted);
      assert.equal(ballotDecrypted[0], otherUser);
      assert.equal(ballotDecrypted[1].toNumber(), 1);
      assert.notEqual(ballotDecrypted[2].toNumber(), 0);
      assert.notEqual(ballotDecrypted[3].toNumber(), 0);
      assert.notEqual(ballotDecrypted[4].toNumber(), 0);
      assert.notEqual(ballotDecrypted[5].toNumber(), 0);
      assert.equal(ballotDecrypted[6][0].toString(), levelOneB);
      assert.equal(ballotDecrypted[6][1].toString(), levelTwoB);
      assert.equal(ballotDecrypted[6][2].toString(), levelThreeA);
      assert.equal(ballotDecrypted[6][3].toString(), levelThreeB);
      assert.equal(ballotDecrypted[7].toNumber(), originalData);
      assert.equal(ballotDecrypted[8].toNumber(), 0);
    });
  });

  describe('#getBallotsByVotingsCount', () => {
    it('should return proper amounts', async () => {
      const voters = [otherUser, hacker];
      // indexes in voters array are used
      const votersInVotings = {
        1: [0, 1],
        2: [0],
        3: [0, 1],
        4: [1],
      };

      // eslint-disable-next-line arrow-body-style
      await Promise.all(Object.entries(votersInVotings).map(([votingId, votersIndexes]) => {
        return Promise.all(votersIndexes.map(async (voterIndex) => {
          const voterAccount = voters[voterIndex];
          await ballotsRegistry.addVoterToAllowedVoters(voterAccount, votingId, { from: admin });
          await ballotsRegistry.addBallot(votingId, [1, 2, 4, 5], { from: voterAccount });
        }));
      }));

      // eslint-disable-next-line max-len
      const { 0: receivedVotingsIds, 1: ballotsAmounts } = await ballotsRegistry.getBallotsByVotingsCount();

      assert.equal(receivedVotingsIds.length, Object.keys(votersInVotings).length, 'votings ids are incorrect');

      receivedVotingsIds.forEach((votingId, index) => {
        // eslint-disable-next-line no-param-reassign
        votingId = votingId.toNumber();

        assert.equal(
          votersInVotings[votingId].length,
          ballotsAmounts[index].toNumber(),
          `incorrect amount of ballots stored for voting ${votingId}`,
        );
      });
    });
  });

  describe('#closeRegistry', () => {
    it('throws when trying to close twice', async () => {
      const stopTX = await ballotsRegistry.closeRegistry({ from: admin });
      truffleAssert.eventEmitted(stopTX, 'RegistryClosed');

      const stopTXThrow = ballotsRegistry.closeRegistry({ from: admin });
      await catchThrow(stopTXThrow);
    });
  });
});
