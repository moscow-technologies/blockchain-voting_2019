pragma solidity 0.5.4;

import "./Ownable.sol";


contract VotersRegistry is Ownable {
    struct BallotInfo {
        bool isBallotIssued;
        uint256 ballotIssuedBlock;
    }

    struct Voter {
        bool isParticipating;
        bool isParticipationRevoked;
        uint256 paricipationReceivedBlock;
        uint256 revocationReceivedBlock;
        uint256 firstBallotIssuedBlock;
        // votingId => BallotInfo
        mapping(uint256 => BallotInfo) issuedBallots;
    }

    event VoterParticipating(uint256 voterId);
    event VoterRevokedParticipating(uint256 voterId);
    event BallotIssued(uint256 voterId, uint256 votingId);
    event RegistrationStopped();

    mapping(uint256 => Voter) private voters;
    uint256 private votersCount;
    mapping(uint256 => bool) private votingsMap;
    uint256[] private votingsList;
    mapping(uint256 => uint256) private ballotsIssuedByVoting;

    bool public isRegistrationStopped = false;

    function stopRegistration() external onlyOwner {
        require(
            isRegistrationStopped == false,
            "Can not stop registration twice!");

        isRegistrationStopped = true;

        emit RegistrationStopped();
    }

    function revokeParticipation(uint256 voterId) external onlyOwner {
        require(
            voterId != 0,
            "Voter Id can not be zero!");

        require(
            voters[voterId].paricipationReceivedBlock != 0,
            "Voter must participate!");

        require(
            voters[voterId].revocationReceivedBlock == 0,
            "Voter must not revoke earlier!");

        require(
            voters[voterId].firstBallotIssuedBlock == 0,
            "Voter can not revoke after Ballot Issue!");

        voters[voterId].isParticipating = false;
        voters[voterId].isParticipationRevoked = true;
        voters[voterId].revocationReceivedBlock = block.number;

        votersCount--;

        emit VoterRevokedParticipating(voterId);
    }

    function issueBallotFor(uint256 voterId, uint256 votingId) external onlyOwner {
        require(
            voterId != 0,
            "Voter Id can not be zero!");

        require(
            votingId != 0,
            "Voting Id can not be zero!");

        require(
            voters[voterId].paricipationReceivedBlock != 0,
            "Voter must participate!");

        require(
            voters[voterId].revocationReceivedBlock == 0,
            "Voter must not revoke earlier!");

        require(
            voters[voterId].issuedBallots[votingId].ballotIssuedBlock == 0,
            "Voter Issue Ballot twice!");

        voters[voterId].firstBallotIssuedBlock = block.number;

        voters[voterId].issuedBallots[votingId].isBallotIssued = true;
        voters[voterId].issuedBallots[votingId].ballotIssuedBlock = block.number;

        if (!votingsMap[votingId]) {
            votingsMap[votingId] = true;
            votingsList.push(votingId);
        }

        ballotsIssuedByVoting[votingId]++;

        emit BallotIssued(voterId, votingId);
    }

    function isAnyBallotIssued(uint256 voterId) external view returns (bool) {
        return voters[voterId].firstBallotIssuedBlock > 0;
    }

    function getVotersCount() external view returns (uint256) {
        return votersCount;
    }

    function getIssuedBallotsByVotingsCount() external view returns (uint256[] memory, uint256[] memory) {
        uint256 votingsAmount = votingsList.length;
        uint256[] memory ballotsIssuedCount = new uint256[](votingsAmount);

        for (uint i = 0; i < votingsAmount; i++) {
            ballotsIssuedCount[i] = ballotsIssuedByVoting[votingsList[i]];
        }

        return (votingsList, ballotsIssuedCount);
    }

    function getParticipationFor(uint256 voterId) external view returns (bool, uint256) {
        bool isParticipating = voters[voterId].isParticipating;
        uint256 paricipationReceivedBlock = voters[voterId].paricipationReceivedBlock;

        return (isParticipating, paricipationReceivedBlock);
    }

    function getRevocationFor(uint256 voterId) external view returns (bool, uint256) {
        bool isParticipationRevoked = voters[voterId].isParticipationRevoked;
        uint256 revocationReceivedBlock = voters[voterId].revocationReceivedBlock;

        return (isParticipationRevoked, revocationReceivedBlock);
    }

    function getBallotFor(uint256 voterId, uint256 votingId) external view returns (bool, uint256) {
        bool isBallotIssued = voters[voterId].issuedBallots[votingId].isBallotIssued;
        uint256 ballotIssuedBlock = voters[voterId].issuedBallots[votingId].ballotIssuedBlock;

        return (isBallotIssued, ballotIssuedBlock);
    }

    function addVoter(uint256 voterId) public onlyOwner {
        require(
            isRegistrationStopped == false,
            "Can not add Voter when registration is closed!");

        require(
            voterId != 0,
            "Voter Id can not be zero!");

        require(
            voters[voterId].paricipationReceivedBlock == 0,
            "Voter must not participate earlier!");

        voters[voterId].isParticipating = true;
        voters[voterId].paricipationReceivedBlock = block.number;

        votersCount++;

        emit VoterParticipating(voterId);
    }

    function addVotersBatch(uint256[] memory votersIds) public onlyOwner {
        uint idsAmount = votersIds.length;

        for (uint i = 0; i < idsAmount; i++) {
            addVoter(votersIds[i]);
        }
    }
}
