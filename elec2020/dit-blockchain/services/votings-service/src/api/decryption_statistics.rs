use std::convert::From;
use exonum::{
  api::{self, ServiceApiState},
};

use crate::{
  schema::{
    Voting,
    BallotsStorage,
    DecryptionStatistics,
  },
  enums::VotingState,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DecryptionStatisticsQuery {
  pub voting_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DecryptionStatisticsView {
  pub decrypted_ballots_amount: u32,
  pub invalid_ballots_amount: u32,
}

impl From<DecryptionStatistics> for DecryptionStatisticsView {
  fn from(stats: DecryptionStatistics) -> Self {
    Self {
      decrypted_ballots_amount: stats.decrypted_ballots_amount,
      invalid_ballots_amount: stats.invalid_ballots_amount,
    }
  }
}

pub fn get_decryption_statistics(
  state: &ServiceApiState,
  query: DecryptionStatisticsQuery
) -> api::Result<DecryptionStatisticsView> {
  let snapshot = state.snapshot();

  let voting = Voting::get(&snapshot, query.voting_id.clone())
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  if voting.get_state() < VotingState::Stopped {
    Err(api::Error::NotFound("Voting is still in process".to_owned()))?
  }

  let ballots_storage = BallotsStorage::instantiate(&snapshot, query.voting_id);
  
  Ok(ballots_storage.get_decryption_statistics().into())
}