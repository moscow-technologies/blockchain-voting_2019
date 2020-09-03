use std::convert::From;
use exonum::{
  api::{self, ServiceApiState},
  crypto::{Hash, PublicKey},
};
use hex;

use crate::{
  schema::{
    Voting,
    BallotsStorage,
    Ballot,
    EncryptedChoice,
  },
  enums::VotingState,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InvalidBallotsQuery {
  pub voting_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EncryptedChoiceView {
  pub message: String,
  pub nonce: String,
  pub public_key: String,
}

impl From<EncryptedChoice> for EncryptedChoiceView {
  fn from(enc_choice: EncryptedChoice) -> Self {
    Self {
      message: hex::encode(&enc_choice.encrypted_message),
      nonce: hex::encode(&enc_choice.nonce.0),
      public_key: hex::encode(&enc_choice.public_key.0),
    }
  }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InvalidBallotView {
  pub index: u32,
  pub voter: PublicKey,
  pub district_id: u32,
  pub encrypted_choice: EncryptedChoiceView,
  pub store_tx_hash: Hash,
  pub decrypt_tx_hash: Option<Hash>,
  pub invalid: bool,
}

impl From<Ballot> for InvalidBallotView {
  fn from(ballot: Ballot) -> Self {
    Self {
      index: ballot.index,
      voter: ballot.voter,
      district_id: ballot.district_id,
      encrypted_choice: ballot.encrypted_choice.into(),
      store_tx_hash: ballot.store_tx_hash,
      decrypt_tx_hash: ballot.decrypt_tx_hash,
      invalid: ballot.invalid,
    }
  }
}

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct InvalidBallotsView {
  pub ballots: Vec<InvalidBallotView>,
}

pub fn get_invalid_ballots(
  state: &ServiceApiState,
  query: InvalidBallotsQuery
) -> api::Result<InvalidBallotsView> {
  let snapshot = state.snapshot();

  let voting = Voting::get(&snapshot, query.voting_id.clone())
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  if voting.get_state() == VotingState::Registration {
    Err(api::Error::BadRequest("Voting was not started yet".to_owned()))?
  }

  let ballots_storage = BallotsStorage::instantiate(&snapshot, query.voting_id);

  let ballots = ballots_storage.get_invalid_ballots()
    .iter()
    .map(|v| v.clone().into())
    .collect();

  let view = InvalidBallotsView::new(ballots);

  Ok(view)
}