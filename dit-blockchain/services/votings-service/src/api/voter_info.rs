
use std::convert::From;
use exonum::{
  api::{self, ServiceApiState},
};

use crate::{
  schema::{
    Voting,
    VotersRegistry,
    Voter,
  },
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VoterInfoQuery {
  pub voting_id: String,
  pub voter_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VoterInfoView {
  pub voter_id: String,
  pub is_participation_revoked: bool,
  pub ballot_issuing_district: Option<u32>, 
}

impl From<Voter> for VoterInfoView {
  fn from(voter: Voter) -> Self {
    Self {
      voter_id: voter.voter_id,
      is_participation_revoked: voter.is_participation_revoked,
      ballot_issuing_district: match voter.ballot_issuing_district {
        0 => None,
        district_id => Some(district_id),
      },
    }
  }
}

pub fn get_voter_info(
  state: &ServiceApiState,
  query: VoterInfoQuery
) -> api::Result<VoterInfoView> {
  let snapshot = state.snapshot();

  Voting::get(&snapshot, query.voting_id.clone())
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  let voters_registry = VotersRegistry::instantiate(&snapshot, query.voting_id);

  voters_registry.get_voter_info(query.voter_id)
    .map(|v| v.into())
    .ok_or_else(|| api::Error::NotFound("Voter not found".to_owned()))
}