
use exonum::{
    blockchain::{ExecutionResult, Transaction, TransactionContext},
};

use crate::{
    errors::Error,
    schema::{
      ServiceData,
      Voting,
    },
    enums::VotingState,
    proto,
};

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxStopVoting")]
pub struct TxStopVoting {
  pub voting_id: String,
  pub seed: u64,
}

impl Transaction for TxStopVoting {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let author = context.author();

        let service_data = ServiceData::instantiate(context.fork());
        let api_public_keys = service_data.get_actual_configuration().api_public_keys();

        if !api_public_keys.contains(&author) {
          Err(Error::AuthorNotAuthorized)?
        }

        let mut voting = Voting::get(context.fork(), self.voting_id.clone())
          .ok_or_else(|| Error::VotingDoesNotExist)?;

        if voting.get_state() != VotingState::InProcess {
          Err(Error::ForbiddenForThisVotingState)?
        }

        voting.change_state(VotingState::Stopped);

        println!("Voting {} was stopped", self.voting_id);
        Ok(())
    }
}
