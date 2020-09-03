use std::convert::{Into};

use exonum::{
    blockchain::{ExecutionResult, Transaction, TransactionContext},
};

use crate::{
    errors::Error,
    schema::{
      Voting,
      BallotsStorage,
      EncryptedChoice,
    },
    enums::VotingState,
    types::{
      SealedBoxPublicKeyWrapper,
      SealedBoxNonceWrapper,
    },
    proto,
};

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxEncryptedChoice")]
pub struct TxEncryptedChoice {
  pub encrypted_message: Vec<u8>,
  pub nonce: SealedBoxNonceWrapper,
  pub public_key: SealedBoxPublicKeyWrapper,
}

impl Into<EncryptedChoice> for TxEncryptedChoice {
  fn into(self) -> EncryptedChoice {
    EncryptedChoice {
      encrypted_message: self.encrypted_message,
      nonce: self.nonce.into(),
      public_key: self.public_key.into(),
    }
  }
}

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxStoreBallot")]
pub struct TxStoreBallot {
  pub voting_id: String,
  pub district_id: u32,
  pub encrypted_choice: TxEncryptedChoice,
}

impl Transaction for TxStoreBallot {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let voter = context.author();

        let voting = Voting::get(context.fork(), self.voting_id.clone())
          .ok_or_else(|| Error::VotingDoesNotExist)?;

        if voting.get_state() != VotingState::InProcess {
          Err(Error::ForbiddenForThisVotingState)?
        }

        let mut ballots_storage = BallotsStorage::instantiate(context.fork(), self.voting_id.clone());
        ballots_storage.store_ballot(
          voter,
          self.district_id.clone(),
          self.encrypted_choice.clone().into(),
          context.tx_hash(),
        ).or_else(|_| Err(Error::BallotCannotBeStored))?;

        println!("Ballot stored for voting {}, district {}", self.voting_id, self.district_id);
        Ok(())
    }
}
