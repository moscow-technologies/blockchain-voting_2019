pragma solidity 0.5.4;


contract LockableTransactionAuthorizer {
    /// Allowed transaction types mask
    uint32 constant NONE = 0;
    uint32 constant BASIC = 0x01;
    uint32 constant CALL = 0x02;
    uint32 constant CREATE = 0x04;
    uint32 constant PRIVATE = 0x08;
    uint32 constant ALL = BASIC | CALL | CREATE | PRIVATE;

    event Locked(address requester, string reason);

    bool private locked = false;
    string private lockReason;
    address private owner;
    address private creator;

    constructor() public {
        creator = msg.sender;

        // FOR GENESIS BLOCK THIS ADDRESS MUST BE REPLACED WITH PROPER VALUE
        // this is "admin" from tests
        address hardcodedOwner = address(0xD0D8E2C98C1e759b82a4705e973b9542C677183d);
        if (creator == address(0)) {
            owner = hardcodedOwner;
        } else {
            owner = creator;
        }
    }

    modifier onlyOwner() {
        require(isOwner(), "Only Owner can do this!");
        _;
    }

    /*
     * Allowed transaction types
     *
     * Returns:
     *  - uint32 - set of allowed transactions for #'sender' depending on tx #'to' address
     *    and value in wei.
     *  - bool - if true is returned the same permissions will be applied from the same #'sender'
     *    without calling this contract again.
     *
     * In case of contract creation #'to' address equals to zero-address
     *
     * Result is represented as set of flags:
     *  - 0x01 - basic transaction (e.g. ether transferring to user wallet)
     *  - 0x02 - contract call
     *  - 0x04 - contract creation
     *  - 0x08 - private transaction
     *
     * @param sender Transaction sender address
     * @param to Transaction recepient address
     * @param value Value in wei for transaction
     *
     */
    function allowedTxTypes(address sender, address to, uint256 value) public view returns (uint32, bool) {
        if (isLocked()) {
            return (BASIC | CALL, false);
        }

        return (ALL, false);
    }

    /// Contract name
    function contractName() public pure returns (string memory) {
        return "TX_PERMISSION_CONTRACT";
    }

    /// Contract name hash
    function contractNameHash() public pure returns (bytes32) {
        return keccak256(abi.encodePacked(contractName()));
    }

    /// Contract version
    function contractVersion() public pure returns (uint256) {
        return 2;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    function lock(string memory reason) public onlyOwner {
        require(!isLocked(), "Can not lock again!");

        locked = true;
        lockReason = reason;

        emit Locked(msg.sender, getLockReason());
    }

    function isLocked() public view returns (bool) {
        return locked;
    }

    function getLockReason() public view returns (string memory) {
        return lockReason;
    }

    function getCreator() public view returns (address) {
        return creator;
    }
}
