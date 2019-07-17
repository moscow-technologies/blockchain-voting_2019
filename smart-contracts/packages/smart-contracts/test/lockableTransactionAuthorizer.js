const truffleAssert = require('truffle-assertions');

const catchThrow = require('./utils/catchThrow');

const LockableTransactionAuthorizer = artifacts.require('LockableTransactionAuthorizer');

contract('LockableTransactionAuthorizer', (accounts) => {
  const [admin, hacker] = accounts;

  let authorizer;
  beforeEach(async () => {
    authorizer = await LockableTransactionAuthorizer.new({ from: admin });
  });

  describe('has basic functions', () => {
    it('#contractName', async () => {
      const contractName = await authorizer.contractName();
      assert.equal(contractName, 'TX_PERMISSION_CONTRACT');
    });

    it('#contractNameHash', async () => {
      const contractNameHash = await authorizer.contractNameHash();
      assert.equal(
        contractNameHash,
        '0x4f314075ff8295c9e673f6888aace9667726c2f93ad15417ecdfe22d94b659c5',
      );
    });

    it('#contractVersion', async () => {
      const contractVersion = await authorizer.contractVersion();
      assert.equal(contractVersion, 2);
    });

    it('#isOwner', async () => {
      assert.isTrue(await authorizer.isOwner({ from: admin }));
      assert.isFalse(await authorizer.isOwner({ from: hacker }));
    });

    it('#getCreator', async () => {
      const creator = await authorizer.getCreator();
      assert.equal(creator, admin);
    });
  });

  describe('after deploy', () => {
    it('should be unlocked', async () => {
      assert.isFalse(await authorizer.isLocked());
    });

    it('should have no lock reason', async () => {
      assert.isEmpty(await authorizer.getLockReason());
    });

    it('should allow all transactions', async () => {
      const { 0: adminAllowance, 1: repeatAdminAllowance } = await authorizer.allowedTxTypes(
        admin,
        hacker,
        100,
      );

      assert.equal(Number(adminAllowance), 15);
      assert.isFalse(repeatAdminAllowance);

      const { 0: hackerAllowance, 1: repeatHackerAllowance } = await authorizer.allowedTxTypes(
        admin,
        hacker,
        100,
      );

      assert.equal(Number(hackerAllowance), 15);
      assert.isFalse(repeatHackerAllowance);
    });
  });

  describe('lock', () => {
    const expectedLockReason = 'TestReason13';

    it('should emit Locked event', async () => {
      const lockTx = await authorizer.lock(expectedLockReason, { from: admin });
      truffleAssert.eventEmitted(lockTx, 'Locked');
    });

    it('should be available only to owner', async () => {
      const shouldThrowTX = authorizer.lock(expectedLockReason, { from: hacker });
      await catchThrow(shouldThrowTX);
      assert.isFalse(await authorizer.isLocked());

      const lockTx = await authorizer.lock(expectedLockReason, { from: admin });
      truffleAssert.eventEmitted(lockTx, 'Locked');

      assert.isTrue(await authorizer.isLocked());
    });

    it('should be locked', async () => {
      const lockTx = await authorizer.lock(expectedLockReason, { from: admin });
      truffleAssert.eventEmitted(lockTx, 'Locked');

      assert.isTrue(await authorizer.isLocked());
    });

    it('should have proper reason', async () => {
      const lockTx = await authorizer.lock(expectedLockReason, { from: admin });
      truffleAssert.eventEmitted(lockTx, 'Locked');

      assert.equal(await authorizer.getLockReason(), expectedLockReason);
    });

    it('should not allow deploys', async () => {
      const lockTx = await authorizer.lock(expectedLockReason, { from: admin });
      truffleAssert.eventEmitted(lockTx, 'Locked');

      const { 0: adminAllowance, 1: repeatAdminAllowance } = await authorizer.allowedTxTypes(
        admin,
        hacker,
        100,
      );

      assert.equal(Number(adminAllowance), 3);
      assert.isFalse(repeatAdminAllowance);

      const { 0: hackerAllowance, 1: repeatHackerAllowance } = await authorizer.allowedTxTypes(
        admin,
        hacker,
        100,
      );

      assert.equal(Number(hackerAllowance), 3);
      assert.isFalse(repeatHackerAllowance);
    });
  });
});
