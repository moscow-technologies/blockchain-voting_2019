pragma solidity 0.5.4;


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    address private currentOwner;

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor() internal {
        currentOwner = msg.sender;
        emit OwnershipTransferred(address(0), currentOwner);
    }

    /**
     * @return the address of the owner.
     */
    function getOwner() public view returns (address) {
        return currentOwner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner(), "Only Owner can do this!");
        _;
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == currentOwner;
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Can not transfer to Zero!");
        emit OwnershipTransferred(currentOwner, newOwner);
        currentOwner = newOwner;
    }
}
