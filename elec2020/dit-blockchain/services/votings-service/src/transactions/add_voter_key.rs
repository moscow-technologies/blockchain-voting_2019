
use exonum::{
    crypto::PublicKey,
    blockchain::{ExecutionResult, Transaction, TransactionContext},
};

use crate::{
    errors::Error,
    schema::{
      ServiceData,
      Voting,
      BallotsStorage,
    },
    enums::VotingState,
    proto,
};

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxAddVoterKey")]
pub struct TxAddVoterKey {
  pub voting_id: String,
  pub voter_key: PublicKey,
}

impl Transaction for TxAddVoterKey {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let author = context.author();

        let service_data = ServiceData::instantiate(context.fork());
        let api_public_keys = service_data.get_actual_configuration().api_public_keys();

        if !api_public_keys.contains(&author) {
          Err(Error::AuthorNotAuthorized)?
        }

        let voting = Voting::get(context.fork(), self.voting_id.clone())
          .ok_or_else(|| Error::VotingDoesNotExist)?;

        if voting.get_state() != VotingState::InProcess {
          Err(Error::ForbiddenForThisVotingState)?
        }

        let mut ballots_storage = BallotsStorage::instantiate(context.fork(), self.voting_id.clone());
        ballots_storage.add_voter_to_voters_list(self.voter_key);

        println!("Voter key {} added for voting {}", self.voter_key, self.voting_id);
        Ok(())
    }
}
