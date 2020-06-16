
use std::collections::HashMap;
use std::convert::From;
use exonum::{
  api::{self, ServiceApiState},
};

use crate::{
  schema::{
    Voting,
    BallotsStorage,
    VotingResults,
  },
  enums::VotingState,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VotingResultsQuery {
  pub voting_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VotingResultsView {
  pub district_id: u32,
  pub tally: HashMap<u32, u32>,
}

impl From<VotingResults> for VotingResultsView {
  fn from(results: VotingResults) -> Self {
    Self {
      district_id: results.district_id,
      tally: results.tally,
    }
  }
}

pub fn get_voting_results(
  state: &ServiceApiState,
  query: VotingResultsQuery
) -> api::Result<HashMap<u32, VotingResultsView>> {
  let snapshot = state.snapshot();

  let voting = Voting::get(&snapshot, query.voting_id.clone())
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  if voting.get_state() < VotingState::Finished {
    Err(api::Error::NotFound("Voting is not finished yet".to_owned()))?
  }

  let ballots_storage = BallotsStorage::instantiate(&snapshot, query.voting_id);
  let voting_results = ballots_storage.get_voting_results();

  Ok(voting_results.iter()
    .fold(HashMap::new(), |mut map, (&district_id, results)| {
      map.insert(district_id, results.clone().into());
      map
    })
  )
}