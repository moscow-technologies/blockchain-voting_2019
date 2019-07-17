const truffleAssert = require('truffle-assertions');

const catchThrow = require('./utils/catchThrow');

const VotersRegistry = artifacts.require('VotersRegistry');

contract('VotersRegistry', (accounts) => {
  const [admin, hacker] = accounts;

  let votersRegistry;
  beforeEach(async () => {
    votersRegistry = await VotersRegistry.new({ from: admin });
  });

  describe('is Ownable', () => {
    it('#getOwner() should return proper owner', async () => {
      const owner = await votersRegistry.getOwner({ from: hacker });

      assert.equal(owner, admin);
    });

    it('#isOwner() should return proper value', async () => {
      const isAdminOwner = await votersRegistry.isOwner({ from: admin });
      const isHackerOwner = await votersRegistry.isOwner({ from: hacker });

      assert.isTrue(isAdminOwner);
      assert.isFalse(isHackerOwner);
    });

    it('#transferOwnership() transfer ownership properly', async () => {
      let owner = await votersRegistry.getOwner({ from: hacker });
      assert.equal(owner, admin);

      const transferTX = await votersRegistry.transferOwnership(hacker, { from: admin });
      truffleAssert.eventEmitted(
        transferTX,
        'OwnershipTransferred',
        ev => ev.previousOwner === admin && ev.newOwner === hacker,
      );

      owner = await votersRegistry.getOwner({ from: hacker });
      assert.equal(owner, hacker);

      let shouldThrowTX = votersRegistry.transferOwnership(hacker, { from: admin });
      await catchThrow(shouldThrowTX);

      shouldThrowTX = votersRegistry.transferOwnership(
        '0x0000000000000000000000000000000000000000',
        { from: hacker },
      );
      await catchThrow(shouldThrowTX);
    });
  });

  describe('#addVoter', () => {
    it('allowed only to Owner', async () => {
      let votersCount = await votersRegistry.getVotersCount();
      assert.equal(0, votersCount);

      const addTX = await votersRegistry.addVoter(1, { from: admin });
      truffleAssert.eventEmitted(addTX, 'VoterParticipating', ev => ev.voterId.toNumber() === 1);

      votersCount = await votersRegistry.getVotersCount();
      assert.equal(1, votersCount);

      const shouldThrowTX = votersRegistry.addVoter(1, { from: hacker });
      await catchThrow(shouldThrowTX);
    });

    it('add Voters properly', async () => {
      let shouldThrowTX;

      let votersCount = await votersRegistry.getVotersCount();
      assert.equal(0, votersCount);

      const addTX = await votersRegistry.addVoter(1, { from: admin });
      truffleAssert.eventEmitted(addTX, 'VoterParticipating', ev => ev.voterId.toNumber() === 1);

      // Can't add Voter twice
      shouldThrowTX = votersRegistry.addVoter(1, { from: admin });
      await catchThrow(shouldThrowTX);

      const stopTX = await votersRegistry.stopRegistration({ from: admin });
      truffleAssert.eventEmitted(stopTX, 'RegistrationStopped');

      // Can't stop after registration stop
      shouldThrowTX = votersRegistry.addVoter(2, { from: admin });
      await catchThrow(shouldThrowTX);

      votersCount = await votersRegistry.getVotersCount();
      assert.equal(1, votersCount);

      let {
        0: isParticipating,
        1: paricipationReceivedBlock,
      } = await votersRegistry.getParticipationFor(1, { from: admin });
      assert.isTrue(isParticipating);
      // #toNumber because it's BigNumber
      assert.isAtLeast(paricipationReceivedBlock.toNumber(), 2);

      // non-existent
      ({
        0: isParticipating,
        1: paricipationReceivedBlock,
      } = await votersRegistry.getParticipationFor(13, { from: admin }));
      assert.isFalse(isParticipating);
      assert.equal(paricipationReceivedBlock, 0);

      const { 0: isRevoked, 1: revocationReceivedBlock } = await votersRegistry.getRevocationFor(
        1,
        { from: admin },
      );
      assert.isFalse(isRevoked);
      assert.equal(revocationReceivedBlock, 0);

      const { 0: isBallotIssued, 1: ballotIssuedBlock } = await votersRegistry.getBallotFor(1, 1, {
        from: admin,
      });
      assert.isFalse(isBallotIssued);
      assert.equal(ballotIssuedBlock, 0);
    });

    it('can not add Voter with Zero Id', async () => {
      const shouldThrowTX = votersRegistry.addVoter(0, { from: admin });
      await catchThrow(shouldThrowTX);
    });
  });

  describe('#stopRegistration', () => {
    it('should work properly', async () => {
      let isRegistrationStopped;

      isRegistrationStopped = await votersRegistry.isRegistrationStopped();
      assert.equal(isRegistrationStopped, false);

      await votersRegistry.addVoter(1, { from: admin });

      const stopTX = await votersRegistry.stopRegistration({ from: admin });
      truffleAssert.eventEmitted(stopTX, 'RegistrationStopped');

      isRegistrationStopped = await votersRegistry.isRegistrationStopped();
      assert.equal(isRegistrationStopped, true);

      // Can't stop after registration stop
      const shouldThrowTX = votersRegistry.addVoter(2, { from: admin });
      await catchThrow(shouldThrowTX);
    });

    it('throws when trying to stop twice', async () => {
      const stopTX = await votersRegistry.stopRegistration({ from: admin });
      truffleAssert.eventEmitted(stopTX, 'RegistrationStopped');

      const stopTXThrow = votersRegistry.stopRegistration({ from: admin });
      await catchThrow(stopTXThrow);
    });
  });

  describe('#revokeParticipation', () => {
    it('allowed only to Owner', async () => {
      let votersCount = await votersRegistry.getVotersCount();
      assert.equal(0, votersCount);

      const addTX = await votersRegistry.addVoter(2, { from: admin });
      truffleAssert.eventEmitted(addTX, 'VoterParticipating', ev => ev.voterId.toNumber() === 2);
      votersCount = await votersRegistry.getVotersCount();
      assert.equal(1, votersCount);

      const shouldThrowTX = votersRegistry.revokeParticipation(2, { from: hacker });
      await catchThrow(shouldThrowTX);

      const revokeTX = await votersRegistry.revokeParticipation(2, { from: admin });
      truffleAssert.eventEmitted(
        revokeTX,
        'VoterRevokedParticipating',
        ev => ev.voterId.toNumber() === 2,
      );

      votersCount = await votersRegistry.getVotersCount();
      assert.equal(0, votersCount);
    });

    it('revokes participation properly', async () => {
      let votersCount = await votersRegistry.getVotersCount();
      assert.equal(0, votersCount);

      // Can't revoke before participation
      let shouldThrowTX = votersRegistry.revokeParticipation(1, { from: hacker });
      await catchThrow(shouldThrowTX);

      await votersRegistry.addVotersBatch([1, 2], { from: admin });

      votersCount = await votersRegistry.getVotersCount();
      assert.equal(2, votersCount);

      const revokeTX = await votersRegistry.revokeParticipation(2, { from: admin });
      truffleAssert.eventEmitted(
        revokeTX,
        'VoterRevokedParticipating',
        ev => ev.voterId.toNumber() === 2,
      );

      votersCount = await votersRegistry.getVotersCount();
      assert.equal(1, votersCount);

      const { 0: isRevoked, 1: revocationReceivedBlock } = await votersRegistry.getRevocationFor(
        2,
        { from: admin },
      );
      assert.isTrue(isRevoked);
      assert.notEqual(revocationReceivedBlock, 0);

      let { 0: isParticipating } = await votersRegistry.getParticipationFor(2, { from: admin });
      assert.isFalse(isParticipating);

      ({ 0: isParticipating } = await votersRegistry.getParticipationFor(1, { from: admin }));
      assert.isTrue(isParticipating);

      // Can't revoke twice
      shouldThrowTX = votersRegistry.revokeParticipation(2, { from: hacker });
      await catchThrow(shouldThrowTX);

      // Can't revoke non-existent
      shouldThrowTX = votersRegistry.revokeParticipation(42, { from: hacker });
      await catchThrow(shouldThrowTX);

      // Can't add Voter after revocation
      shouldThrowTX = votersRegistry.addVoter(2, { from: admin });
      await catchThrow(shouldThrowTX);
    });

    it('can not Revoke for Voter with Zero Id', async () => {
      const shouldThrowTX = votersRegistry.revokeParticipation(0, { from: admin });
      await catchThrow(shouldThrowTX);
    });
  });

  describe('#issueBallotFor', () => {
    it('allowed only to Owner', async () => {
      let votersCount = await votersRegistry.getVotersCount();
      assert.equal(0, votersCount);

      const addTX = await votersRegistry.addVoter(2, { from: admin });
      truffleAssert.eventEmitted(addTX, 'VoterParticipating', ev => ev.voterId.toNumber() === 2);

      votersCount = await votersRegistry.getVotersCount();
      assert.equal(1, votersCount);

      const shouldThrowTX = votersRegistry.issueBallotFor(2, 1, { from: hacker });
      await catchThrow(shouldThrowTX);

      const issueTX = await votersRegistry.issueBallotFor(2, 1, { from: admin });
      truffleAssert.eventEmitted(
        issueTX,
        'BallotIssued',
        ev => ev.voterId.toNumber() === 2 && ev.votingId.toNumber() === 1,
      );

      const { 0: isBallotIssued, 1: ballotIssuedBlock } = await votersRegistry.getBallotFor(2, 1, {
        from: admin,
      });
      assert.isTrue(isBallotIssued);
      assert.notEqual(ballotIssuedBlock, 0);
    });

    it('issues Ballot properly', async () => {
      let votersCount = await votersRegistry.getVotersCount();
      assert.equal(0, votersCount);

      await votersRegistry.addVotersBatch([1, 2], { from: admin });

      votersCount = await votersRegistry.getVotersCount();
      assert.equal(2, votersCount);

      await votersRegistry.revokeParticipation(2, { from: admin });

      votersCount = await votersRegistry.getVotersCount();
      assert.equal(1, votersCount);

      const { 0: isRevoked, 1: revocationReceivedBlock } = await votersRegistry.getRevocationFor(
        2,
        { from: admin },
      );
      assert.isTrue(isRevoked);
      assert.notEqual(revocationReceivedBlock, 0);

      let { 0: isParticipating } = await votersRegistry.getParticipationFor(2, { from: admin });
      assert.isFalse(isParticipating);

      ({ 0: isParticipating } = await votersRegistry.getParticipationFor(1, { from: admin }));
      assert.isTrue(isParticipating);

      let shouldThrowTX;
      // Can't issue for revoked
      shouldThrowTX = votersRegistry.issueBallotFor(2, 1, { from: hacker });
      await catchThrow(shouldThrowTX);

      // Can't issue for non-existent
      shouldThrowTX = votersRegistry.issueBallotFor(42, 1, { from: hacker });
      await catchThrow(shouldThrowTX);

      let isAlreadyIssuedOne = await votersRegistry.isAnyBallotIssued(1);
      assert.isFalse(isAlreadyIssuedOne);

      const issueBallot = await votersRegistry.issueBallotFor(1, 1, { from: admin });
      truffleAssert.eventEmitted(
        issueBallot,
        'BallotIssued',
        ev => ev.voterId.toNumber() === 1,
        ev => ev.votingId.toNumber() === 1,
      );

      isAlreadyIssuedOne = await votersRegistry.isAnyBallotIssued(1);
      assert.isTrue(isAlreadyIssuedOne);

      const isAlreadyIssuedNonExistent = await votersRegistry.isAnyBallotIssued(13);
      assert.isFalse(isAlreadyIssuedNonExistent);

      // Can't issue Ballot twice
      shouldThrowTX = votersRegistry.issueBallotFor(1, 1, { from: admin });
      await catchThrow(shouldThrowTX);

      let { 0: isBallotIssued, 1: ballotIssuedBlock } = await votersRegistry.getBallotFor(1, 1, {
        from: admin,
      });
      assert.isTrue(isBallotIssued);
      assert.notEqual(ballotIssuedBlock, 0);

      ({ 0: isBallotIssued, 1: ballotIssuedBlock } = await votersRegistry.getBallotFor(2, 1, {
        from: admin,
      }));
      assert.isFalse(isBallotIssued);
      assert.equal(ballotIssuedBlock, 0);
    });

    it('can not Issue Ballot for Voter with Zero Id', async () => {
      const shouldThrowTX = votersRegistry.issueBallotFor(0, 1, { from: admin });
      await catchThrow(shouldThrowTX);
    });

    it('can not Issue Ballot for Voting with Zero Id', async () => {
      const shouldThrowTX = votersRegistry.issueBallotFor(1, 0, { from: admin });
      await catchThrow(shouldThrowTX);
    });
  });

  describe('#getVotersCount', () => {
    it('returns voters amount properly', async () => {
      const votersIds = [1, 2, 3, 4, 5];
      await votersRegistry.addVotersBatch(votersIds);
      const votersAmount = await votersRegistry.getVotersCount();
      assert.equal(votersAmount, votersIds.length);
    });
  });

  describe('#getIssuedBallotsByVotingsCount', () => {
    it('should return proper amounts', async () => {
      const votersIds = [1, 2, 3, 4, 5];
      const votersInVotings = {
        1: [1, 2, 3],
        2: [1, 2],
        3: [1, 2, 3, 4, 5],
        4: [1],
      };
      await votersRegistry.addVotersBatch(votersIds);

      // eslint-disable-next-line arrow-body-style
      await Promise.all(Object.entries(votersInVotings).map(([votingId, votersList]) => {
        return Promise.all(votersList.map(
          voterId => votersRegistry.issueBallotFor(voterId, votingId),
        ));
      }));

      // eslint-disable-next-line max-len
      const { 0: receivedVotingsIds, 1: issuedBallotsAmounts } = await votersRegistry.getIssuedBallotsByVotingsCount();

      assert.equal(receivedVotingsIds.length, Object.keys(votersInVotings).length, 'votings ids are incorrect');

      receivedVotingsIds.forEach((votingId, index) => {
        // eslint-disable-next-line no-param-reassign
        votingId = votingId.toNumber();

        assert.equal(
          issuedBallotsAmounts[index].toNumber(),
          votersInVotings[votingId].length,
          `incorrect amount of ballots issued for voting ${votingId}`,
        );
      });
    });
  });
});
