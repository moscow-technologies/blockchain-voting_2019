
use exonum::{
    blockchain::{ExecutionResult, Transaction, TransactionContext},
};

use crate::{
    errors::Error,
    schema::{
      ServiceData,
      Voting,
      VotersRegistry,
    },
    enums::VotingState,
    proto,
};

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxRevokeVoterParticipation")]
pub struct TxRevokeVoterParticipation {
  pub voting_id: String,
  pub voter_id: String,
  pub seed: u64,
}

impl Transaction for TxRevokeVoterParticipation {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let author = context.author();

        let service_data = ServiceData::instantiate(context.fork());
        let api_public_keys = service_data.get_actual_configuration().api_public_keys();

        if !api_public_keys.contains(&author) {
          Err(Error::AuthorNotAuthorized)?
        }

        let voting = Voting::get(context.fork(), self.voting_id.clone())
          .ok_or_else(|| Error::VotingDoesNotExist)?;

        if voting.get_state() > VotingState::InProcess {
          Err(Error::ForbiddenForThisVotingState)?
        }

        let mut voters_registry = VotersRegistry::instantiate(context.fork(), self.voting_id.clone());
        voters_registry.revoke_participation(self.voter_id.clone())
          .or_else(|_| Err(Error::ParticipationCannotBeRevoked))?;

        println!("Participation in voting {} revoked for voter {}", self.voting_id, self.voter_id);
        Ok(())
    }
}
