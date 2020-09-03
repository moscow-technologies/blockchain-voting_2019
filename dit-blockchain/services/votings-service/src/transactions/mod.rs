mod create_voting;
mod register_voters;
mod stop_registration;
mod revoke_voter_participation;
mod issue_ballot;
mod add_voter_key;
mod store_ballot;
mod stop_voting;
mod publish_decryption_key;
mod decrypt_ballot;
mod finalize_voting;

use create_voting::TxCreateVoting;
use register_voters::TxRegisterVoters;
use stop_registration::TxStopRegistration;
use revoke_voter_participation::TxRevokeVoterParticipation;
use issue_ballot::TxIssueBallot;
use add_voter_key::TxAddVoterKey;
use store_ballot::TxStoreBallot;
use stop_voting::TxStopVoting;
use publish_decryption_key::TxPublishDecryptionKey;
use decrypt_ballot::TxDecryptBallot;
use finalize_voting::TxFinalizeVoting;

#[derive(Serialize, Deserialize, Clone, Debug, TransactionSet)]
pub enum VotingTransactions {
    CreateVoting(TxCreateVoting),
    RegisterVoters(TxRegisterVoters),
    StopRegistration(TxStopRegistration),
    RevokeParticipation(TxRevokeVoterParticipation),
    IssueBallot(TxIssueBallot),
    AddVoterKey(TxAddVoterKey),
    StoreBallot(TxStoreBallot),
    StopVoting(TxStopVoting),
    PublishDecryptionKey(TxPublishDecryptionKey),
    DecryptBallot(TxDecryptBallot),
    FinalizeVoting(TxFinalizeVoting),
}
