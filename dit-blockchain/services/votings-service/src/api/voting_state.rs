
use exonum::{
    api::{self, ServiceApiState},
};

use crate::{
  schema::{
    Voting,
  },
  enums::VotingState,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VotingStateQuery {
  pub voting_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VotingStateView {
  pub state: String
}

pub fn get_voting_state(
  state: &ServiceApiState,
  query: VotingStateQuery
) -> api::Result<VotingStateView> {
  let snapshot = state.snapshot();
  let voting = Voting::get(&snapshot, query.voting_id)
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  let voting_state = voting.get_state();

  Ok(VotingStateView {
    state: match voting_state {
      VotingState::Registration => "Registration".to_owned(),
      VotingState::InProcess => "InProcess".to_owned(),
      VotingState::Stopped => "Stopped".to_owned(),
      VotingState::Finished => "Finished".to_owned(),
    }
  })
}