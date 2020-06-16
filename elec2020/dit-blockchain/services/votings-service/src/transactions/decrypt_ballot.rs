
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
#[exonum(pb = "proto::TxDecryptBallot")]
pub struct TxDecryptBallot {
  pub voting_id: String,
  pub ballot_index: u32,
  pub seed: u64,
}

impl Transaction for TxDecryptBallot {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let author = context.author();

        let service_data = ServiceData::instantiate(context.fork());
        let api_public_keys = service_data.get_actual_configuration().api_public_keys();

        if !api_public_keys.contains(&author) {
          Err(Error::AuthorNotAuthorized)?
        }

        let voting = Voting::get(context.fork(), self.voting_id.clone())
          .ok_or_else(|| Error::VotingDoesNotExist)?;

        if voting.get_state() != VotingState::Stopped {
          Err(Error::ForbiddenForThisVotingState)?
        }

        let mut ballots_storage = BallotsStorage::instantiate(context.fork(), self.voting_id.clone());

        let ballot = ballots_storage.get_ballot_by_index(self.ballot_index)
          .ok_or_else(|| Error::BallotDoesNotExist)?;

        if ballot.decrypted_choice.is_some() || ballot.invalid {
          println!("Ballot for voting {} with index {} was already decrypted", self.voting_id, self.ballot_index);
          return Ok(());
        }

        let cryptosystem_settings = voting.get_crypto_system_settings();

        let private_key = cryptosystem_settings.private_key
          .ok_or_else(|| Error::DecryptionKeyIsNotPublished)?;

        ballots_storage.decrypt_ballot(self.ballot_index, &private_key, context.tx_hash())
          .or_else(|_| Err(Error::BallotCannotBeDecrypted))?;

        println!("Ballot for voting {} with index {} was decrypted", self.voting_id, self.ballot_index);
        Ok(())
    }
}
