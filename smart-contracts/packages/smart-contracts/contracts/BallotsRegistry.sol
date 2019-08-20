// solium-disable security/no-block-members
pragma solidity 0.5.4;

import "./Ownable.sol";


contract BallotsRegistry is Ownable {
    struct EncryptedData {
        bytes A;
        bytes B;
    }

    struct Ballot {
        address voter;
        uint256 votingId;
        uint256 receivedBlock;
        uint256 receivedBlockTimestamp;
        uint256 decryptedBlock;
        uint256 decryptedTimestamp;
        EncryptedData encryptedData;
        uint256 decryptedData;
        uint256 index;
    }

    struct BallotIndex {
        uint256 index;
        bool present;
    }

    event AllowedVoterAdded(address voter, uint256 allowedVoting);
    event BallotAdded(
        address voter,
        uint256 votingId,
        uint256 receivedBlock,
        uint256 receivedBlockTimestamp,
        bytes32 controlHash,
        bytes encryptedA,
        bytes encryptedB,
        uint256 index
    );
    event BallotDecrypted(
        address voter,
        uint256 votingId,
        uint256 receivedBlock,
        uint256 receivedBlockTimestamp,
        uint256 decryptedBlock,
        uint256 decryptedTimestamp,
        bytes32 controlHash,
        bytes encryptedA,
        bytes encryptedB,
        uint256 decryptedData,
        uint256 index
    );
    event PublicKeyPublished(bytes publicKey);
    event PrivateKeyPublished(bytes privateKey);
    event RegistryClosed();

    Ballot[] private ballots;
    mapping(uint256 => bool) private votingsMap;
    uint256[] private votingsList;
    mapping(uint256 => uint256[]) private ballotsByVoting;
    mapping(bytes32 => BallotIndex) private ballotsByControlHash;
    mapping(address => mapping(uint256 => bool)) private allowedVotingsForVoters;
    mapping(address => mapping(uint256 => bool)) private votingsChecks;
    bytes private moduleP;
    bytes private generatorG;
    bytes private publicKey;
    bytes private privateKey;

    bool public isRegistryClosed = false;

    // NOTE: We don't use this naming scheme, but for the sake of clarity we use it here
    constructor(bytes memory _module, bytes memory _generator, bytes memory _publicKey) public {
        require(
            _module.length != 0,
            "Must pass proper Module!");

        require(
            _generator.length != 0,
            "Must pass proper Generator!");

        require(
            _publicKey.length != 0,
            "Must pass proper Public Key!");

        moduleP = _module;
        generatorG = _generator;
        publicKey = _publicKey;

        emit PublicKeyPublished(publicKey);
    }

    function closeRegistry() external onlyOwner {
        require(
            isRegistryClosed == false,
            "Registry must not be closed!");

        isRegistryClosed = true;

        emit RegistryClosed();
    }

    function getModuleP() external view returns (bytes memory) {
        return moduleP;
    }

    function getGeneratorG() external view returns (bytes memory) {
        return generatorG;
    }

    function getPublicKey() external view returns (bytes memory) {
        return publicKey;
    }

    function getPrivateKey() external view returns (bytes memory) {
        return privateKey;
    }

    function getBallotsCount() external view returns (uint256) {
        return ballots.length;
    }

    function getBallotsByVotingsCount() external view returns (uint256[] memory, uint256[] memory) {
        uint256 votingsAmount = votingsList.length;
        uint256[] memory ballotsCount = new uint256[](votingsAmount);

        for (uint i = 0; i < votingsAmount; i++) {
            ballotsCount[i] = ballotsByVoting[votingsList[i]].length;
        }

        return (votingsList, ballotsCount);
    }

    function getBallotsByVotingId(uint256 votingId) external view returns (uint256[] memory) {
        return ballotsByVoting[votingId];
    }

    function storeDecryptedData(uint256 ballotIndex, uint256 data) external onlyOwner {
        require(
            isRegistryClosed == true,
            "Registry must be closed!");

        require(
            ballotIndex < ballots.length,
            "Must pass valid index!");

        require(
            privateKey.length != 0,
            "Private Key must present!");

        require(
            ballots[ballotIndex].decryptedData == 0,
            "Can not decrypt Ballot twice!");

        Ballot storage ballot = ballots[ballotIndex];

        ballot.decryptedData = data;
        ballot.decryptedBlock = block.number;
        ballot.decryptedTimestamp = block.timestamp;

        bytes32 controlHash = keccak256(abi.encodePacked(
            ballot.voter,
            ballot.votingId,
            ballot.encryptedData.A,
            ballot.encryptedData.B
        ));

        emit BallotDecrypted(
            ballot.voter,
            ballot.votingId,
            ballot.receivedBlock,
            ballot.receivedBlockTimestamp,
            ballot.decryptedBlock,
            ballot.decryptedTimestamp,
            controlHash,
            ballot.encryptedData.A,
            ballot.encryptedData.B,
            ballot.decryptedData,
            ballot.index);
    }

    // solhint-disable-next-line max-line-length
    function getBallotByControlHash(bytes32 controlHash) external view returns (address, uint256, uint256, uint256, uint256, uint256, bytes memory, bytes memory, uint256, uint256) {
        BallotIndex memory entry = ballotsByControlHash[controlHash];

        require(
            entry.present == true,
            "Ballot with specified control hash does not exist");

        return getBallotByIndex(entry.index);
    }

    function addVoterToAllowedVoters(address voter, uint256 votingId) external onlyOwner {
        require(
            isRegistryClosed == false,
            "Registry must not be closed!");

        require(
            votingId != 0,
            "Voting Id can not be zero!");

        require(
            voter != msg.sender,
            "Can not add Self to Allowed Voters!");

        require(
            allowedVotingsForVoters[voter][votingId] == false,
            "Can not add to Allowed Voters twice!");

        allowedVotingsForVoters[voter][votingId] = true;

        emit AllowedVoterAdded(voter, votingId);
    }

    function publishPrivateKey(bytes memory _privateKey) public onlyOwner {
        require(
            isRegistryClosed == true,
            "Registry must be closed!");

        require(
            _privateKey.length != 0,
            "Must pass proper Private Key!");

        require(
            privateKey.length == 0,
            "Can not publish Private Key twice!");

        privateKey = _privateKey;

        emit PrivateKeyPublished(privateKey);
    }

    function addBallot(uint256 votingId, bytes memory _A, bytes memory _B) public {
        require(
            isRegistryClosed == false,
            "Registry must not be closed!");

        require(
            votingId != 0,
            "Voting Id can not be zero!");

        require(
            allowedVotingsForVoters[msg.sender][votingId] == true,
            "Voter must be allowed to pass Ballot for this Voting!");

        require(
            votingsChecks[msg.sender][votingId] == false,
            "Voter must not pass two Ballots for the Voting!");

        require(
            privateKey.length == 0,
            "Private Key must not present!");

        EncryptedData memory encData = EncryptedData({
            A: _A,
            B: _B
        });

        uint256 newBallotsAmount = ballots.push(Ballot({
            voter: msg.sender,
            votingId: votingId,
            receivedBlock: block.number,
            receivedBlockTimestamp: block.timestamp,
            decryptedBlock: 0,
            decryptedTimestamp: 0,
            encryptedData: encData,
            decryptedData: 0,
            index: ballots.length
        }));

        bytes32 controlHash = keccak256(abi.encodePacked(msg.sender, votingId, encData.A, encData.B));

        votingsChecks[msg.sender][votingId] = true;
        ballotsByVoting[votingId].push(newBallotsAmount - 1);
        ballotsByControlHash[controlHash] = BallotIndex({
            index: newBallotsAmount - 1,
            present: true
        });

        if (!votingsMap[votingId]) {
            votingsMap[votingId] = true;
            votingsList.push(votingId);
        }

        emit BallotAdded(
            msg.sender,
            votingId,
            block.number,
            block.timestamp,
            controlHash,
            encData.A,
            encData.B,
            newBallotsAmount - 1);
    }

    // solhint-disable-next-line max-line-length
    function getBallotByIndex(uint256 index) public view returns (address, uint256, uint256, uint256, uint256, uint256, bytes memory, bytes memory, uint256, uint256) {
        require(
            index < ballots.length,
            "Must pass valid index!");

        Ballot memory ballot = ballots[index];

        return (
            ballot.voter,
            ballot.votingId,
            ballot.receivedBlock,
            ballot.receivedBlockTimestamp,
            ballot.decryptedBlock,
            ballot.decryptedTimestamp,
            ballot.encryptedData.A,
            ballot.encryptedData.B,
            ballot.decryptedData,
            ballot.index);
    }
}
