// solium-disable security/no-block-members
pragma solidity 0.5.4;

import "./Ownable.sol";


contract BallotsRegistry is Ownable {
    struct Ballot {
        address voter;
        uint256 votingId;
        uint256 receivedBlock;
        uint256 receivedBlockTimestamp;
        uint256 decryptedBlock;
        uint256 decryptedTimestamp;
        uint256[4] encryptedData;
        uint256 decryptedData;
        uint256 index;
    }

    event AllowedVoterAdded(address voter, uint256 allowedVoting);
    event BallotAdded(
        address voter,
        uint256 votingId,
        uint256 receivedBlock,
        uint256 receivedBlockTimestamp,
        bytes32 controlHash,
        uint256[4] encryptedData,
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
        uint256[4] encryptedData,
        uint256 decryptedData,
        uint256 index
    );
    event PublicKeysPublished(uint256[3] publicKeys);
    event PrivateKeysPublished(uint256[3] privateKeys);
    event RegistryClosed();

    Ballot[] private ballots;
    mapping(uint256 => bool) private votingsMap;
    uint256[] private votingsList;
    mapping(uint256 => uint256[]) private ballotsByVoting;
    mapping(bytes32 => uint256) private ballotsByControlHash;
    mapping(address => mapping(uint256 => bool)) private allowedVotingsForVoters;
    mapping(address => mapping(uint256 => bool)) private votingsChecks;
    uint256[3] private modulesP;
    uint256[3] private generatorsG;
    uint256[3] private publicKeys;
    uint256[3] private privateKeys;

    bool public isRegistryClosed = false;

    constructor(uint256[3] memory _modulesP, uint256[3] memory _generatorsG, uint256[3] memory _publicKeys) public {
        require(
            _modulesP[0] != 0,
            "Must pass proper Level 1 Module P!");

        require(
            _modulesP[1] != 0,
            "Must pass proper Level 2 Module P!");

        require(
            _modulesP[2] != 0,
            "Must pass proper Level 3 Module P!");

        require(
            _generatorsG[0] != 0,
            "Must pass proper Level 1 Generator G!");

        require(
            _generatorsG[1] != 0,
            "Must pass proper Level 2 Generator G!");

        require(
            _generatorsG[2] != 0,
            "Must pass proper Level 3 Generator G!");

        require(
            _publicKeys[0] != 0,
            "Must pass proper Level 1 Public Key!");

        require(
            _publicKeys[1] != 0,
            "Must pass proper Level 2 Public Key!");

        require(
            _publicKeys[2] != 0,
            "Must pass proper Level 3 Public Key!");

        modulesP = _modulesP;
        generatorsG = _generatorsG;
        publicKeys = _publicKeys;

        emit PublicKeysPublished(_publicKeys);
    }

    function closeRegistry() external onlyOwner {
        require(
            isRegistryClosed == false,
            "Registry must not be closed!");

        isRegistryClosed = true;

        emit RegistryClosed();
    }

    function getModulesP() external view returns (uint256[3] memory) {
        return modulesP;
    }

    function getGeneratorsG() external view returns (uint256[3] memory) {
        return generatorsG;
    }

    function getPublicKeys() external view returns (uint256[3] memory) {
        return publicKeys;
    }

    function getPrivateKeys() external view returns (uint256[3] memory) {
        return privateKeys;
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

    function decryptBallot(uint256 index) external onlyOwner {
        require(
            isRegistryClosed == true,
            "Registry must be closed!");

        require(
            index < ballots.length,
            "Must pass valid index!");

        require(
            privateKeys[0] != 0 && privateKeys[1] != 0 && privateKeys[2] != 0,
            "Private Keys must present!");

        require(
            ballots[index].decryptedData == 0,
            "Can not decrypt Ballot twice!");

        Ballot storage ballot = ballots[index];

        // Decrypt Here
        uint256 levelOneA = getLevelOneA(index);
        uint256 decryptedData = decryptLevel(
            levelOneA,
            ballot.encryptedData[0],
            modulesP[0],
            privateKeys[0]);

        ballot.decryptedData = decryptedData;
        ballot.decryptedBlock = block.number;
        ballot.decryptedTimestamp = block.timestamp;

        bytes32 controlHash = keccak256(abi.encodePacked(ballot.voter, ballot.votingId, ballot.encryptedData));

        emit BallotDecrypted(
            ballot.voter,
            ballot.votingId,
            ballot.receivedBlock,
            ballot.receivedBlockTimestamp,
            ballot.decryptedBlock,
            ballot.decryptedTimestamp,
            controlHash,
            ballot.encryptedData,
            ballot.decryptedData,
            ballot.index);
    }

    // solhint-disable-next-line max-line-length
    function getBallotByControlHash(bytes32 controlHash) external view returns (address, uint256, uint256, uint256, uint256, uint256, uint256[4] memory, uint256, uint256) {
        uint256 index = ballotsByControlHash[controlHash];

        return getBallotByIndex(index);
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

    function publishPrivateKeys(uint256[3] memory _privateKeys) public onlyOwner {
        require(
            isRegistryClosed == true,
            "Registry must be closed!");

        require(
            privateKeys[0] == 0 && privateKeys[1] == 0 && privateKeys[2] == 0,
            "Can not publis Private Key twice!");

        require(
            _privateKeys[0] != 0 && _privateKeys[1] != 0 && _privateKeys[2] != 0,
            "Must pass proper Private Key!");

        privateKeys = _privateKeys;

        emit PrivateKeysPublished(_privateKeys);
    }

    function addBallot(uint256 votingId, uint256[4] memory data) public {
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
            privateKeys[0] == 0 && privateKeys[1] == 0 && privateKeys[2] == 0,
            "Private Keys must not present!");

        uint256 newBallotsAmount = ballots.push(Ballot({
            voter: msg.sender,
            votingId: votingId,
            receivedBlock: block.number,
            receivedBlockTimestamp: block.timestamp,
            decryptedBlock: 0,
            decryptedTimestamp: 0,
            encryptedData: data,
            decryptedData: 0,
            index: ballots.length
        }));

        bytes32 controlHash = keccak256(abi.encodePacked(msg.sender, votingId, data));

        votingsChecks[msg.sender][votingId] = true;
        ballotsByControlHash[controlHash] = newBallotsAmount - 1;
        ballotsByVoting[votingId].push(newBallotsAmount - 1);

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
            data,
            newBallotsAmount - 1);
    }

    // solhint-disable-next-line max-line-length
    function getBallotByIndex(uint256 index) public view returns (address, uint256, uint256, uint256, uint256, uint256, uint256[4] memory, uint256, uint256) {
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
            ballot.encryptedData,
            ballot.decryptedData,
            ballot.index);
    }

    function getLevelOneA(uint256 index) private view returns (uint256) {
        uint256[4] memory encryptedData = ballots[index].encryptedData;

        // Decrypt Level 3, get Level 2 'A'
        uint256 levelTwoA = decryptLevel(
            encryptedData[2],
            encryptedData[3],
            modulesP[2],
            privateKeys[2]);

        // Decrypt Level 2, get Level 1 'A'
        uint256 levelOneA = decryptLevel(
            levelTwoA,
            encryptedData[1],
            modulesP[1],
            privateKeys[1]);

        return levelOneA;
    }

    function decryptLevel(
        uint256 a,
        uint256 b,
        uint256 moduleP,
        uint256 privateKey)
    private pure returns (uint256)
    {
        uint256 decryptor = calculateDecryptor(a, moduleP, privateKey);

        return mulmod(b, decryptor, moduleP);
    }

    function calculateDecryptor(uint256 a, uint256 moduleP, uint256 privateKey) private pure returns (uint256) {
        // Modular Multiplicative Inverse, Euler's theorem
        uint256 mmiResult = modexp(a, moduleP - 2, moduleP);

        return modexp(mmiResult, privateKey, moduleP);
    }

    function modexp(uint256 base, uint256 exponent, uint256 modulus) private pure returns (uint256) {
        uint256 result = 1;
        uint256 b = base;
        uint256 e = exponent;

        while (e != 0) {
            if (e & 1 == 1) {
                result = mulmod(result, b, modulus);
            }

            b = mulmod(b, b, modulus);
            e /= 2;
        }

        return result;
    }
}
