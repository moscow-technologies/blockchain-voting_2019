
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
#[exonum(pb = "proto::TxRegisterVoters")]
pub struct TxRegisterVoters {
  pub voting_id: String,
  pub voters: Vec<String>,
}

impl Transaction for TxRegisterVoters {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let author = context.author();

        let service_data = ServiceData::instantiate(context.fork());
        let api_public_keys = service_data.get_actual_configuration().api_public_keys();

        if !api_public_keys.contains(&author) {
          Err(Error::AuthorNotAuthorized)?
        }

        let voting = Voting::get(context.fork(), self.voting_id.clone())
          .ok_or_else(|| Error::VotingDoesNotExist)?;

        if voting.get_state() != VotingState::Registration {
          Err(Error::ForbiddenForThisVotingState)?
        }

        let mut voters_registry = VotersRegistry::instantiate(context.fork(), self.voting_id.clone());
        voters_registry.register_voters(self.voters.clone());

        Ok(())
    }
}
