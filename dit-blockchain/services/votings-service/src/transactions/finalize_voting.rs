
use exonum::{
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
#[exonum(pb = "proto::TxFinalizeVoting")]
pub struct TxFinalizeVoting {
  pub voting_id: String,
  pub seed: u64,
}

impl Transaction for TxFinalizeVoting {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let author = context.author();

        let service_data = ServiceData::instantiate(context.fork());
        let api_public_keys = service_data.get_actual_configuration().api_public_keys();

        if !api_public_keys.contains(&author) {
          Err(Error::AuthorNotAuthorized)?
        }

        let mut voting = Voting::get(context.fork(), self.voting_id.clone())
          .ok_or_else(|| Error::VotingDoesNotExist)?;

        if voting.get_state() != VotingState::Stopped {
          Err(Error::ForbiddenForThisVotingState)?;
        }

        let mut ballots_storage = BallotsStorage::instantiate(context.fork(), self.voting_id.clone());

        let stored_ballots_by_disrict_amount = ballots_storage.get_stored_ballots_amount();
        let stored_ballots_amount = stored_ballots_by_disrict_amount.values()
          .fold(0 as u32, |total, for_district| for_district + total);

        let decryption_stats = ballots_storage.get_decryption_statistics();
        let processed_ballots_amount = decryption_stats.decrypted_ballots_amount + decryption_stats.invalid_ballots_amount;

        if stored_ballots_amount != processed_ballots_amount {
          Err(Error::DecryptionIsNotFinished)?;
        }

        ballots_storage.tally_results();
        voting.change_state(VotingState::Finished);

        println!("Voting {} was finalized", self.voting_id);
        Ok(())
    }
}
