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
pub struct BallotByIndexQuery {
  pub voting_id: String,
  pub ballot_index: u32,
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
pub struct BallotByIndexView {
  pub index: u32,
  pub voter: PublicKey,
  pub district_id: u32,
  pub encrypted_choice: EncryptedChoiceView,
  pub decrypted_choice: Option<u32>,
  pub store_tx_hash: Hash,
  pub decrypt_tx_hash: Option<Hash>,
  pub invalid: bool,
}

impl From<Ballot> for BallotByIndexView {
  fn from(ballot: Ballot) -> Self {
    Self {
      index: ballot.index,
      voter: ballot.voter,
      district_id: ballot.district_id,
      encrypted_choice: ballot.encrypted_choice.into(),
      decrypted_choice: ballot.decrypted_choice,
      store_tx_hash: ballot.store_tx_hash,
      decrypt_tx_hash: ballot.decrypt_tx_hash,
      invalid: ballot.invalid,
    }
  }
}

pub fn get_ballot_by_index(
  state: &ServiceApiState,
  query: BallotByIndexQuery
) -> api::Result<BallotByIndexView> {
  let snapshot = state.snapshot();

  let voting = Voting::get(&snapshot, query.voting_id.clone())
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  if voting.get_state() == VotingState::Registration {
    Err(api::Error::BadRequest("Voting was not started yet".to_owned()))?
  }

  let ballots_storage = BallotsStorage::instantiate(&snapshot, query.voting_id);

  ballots_storage.get_ballot_by_index(query.ballot_index)
    .map(|v| v.into())
    .ok_or_else(|| api::Error::NotFound("Ballot not found".to_owned()))
}