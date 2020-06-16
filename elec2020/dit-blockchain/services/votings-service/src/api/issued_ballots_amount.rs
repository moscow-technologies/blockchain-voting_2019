use std::collections::HashMap;
use exonum::{
  api::{self, ServiceApiState},
};

use crate::{
  schema::{
    Voting,
    VotersRegistry,
  },
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IssuedBallotsAmountQuery {
  pub voting_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IssuedBallotsAmountView {
  pub issued_ballots_amount: HashMap<u32, u32>
}

pub fn get_issued_ballots_amount(
  state: &ServiceApiState,
  query: IssuedBallotsAmountQuery
) -> api::Result<IssuedBallotsAmountView> {
  let snapshot = state.snapshot();

  Voting::get(&snapshot, query.voting_id.clone())
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  let voters_registry = VotersRegistry::instantiate(&snapshot, query.voting_id);
  
  Ok({
    IssuedBallotsAmountView {
      issued_ballots_amount: voters_registry.get_issued_ballots_amount(),
    }
  })
}