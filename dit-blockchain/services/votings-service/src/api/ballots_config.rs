
use exonum::{
    api::{self, ServiceApiState},
};

use crate::{
  schema::{
    Voting,
    BallotConfig,
  },
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BallotsConfigQuery {
  pub voting_id: String,
}

pub fn get_ballots_config(
  state: &ServiceApiState,
  query: BallotsConfigQuery
) -> api::Result<Vec<BallotConfig>> {
  let snapshot = state.snapshot();
  let voting = Voting::get(&snapshot, query.voting_id)
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  Ok(voting.get_ballots_config().values().map(|v| v.clone()).collect())
}