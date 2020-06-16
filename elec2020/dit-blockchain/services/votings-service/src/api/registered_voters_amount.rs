
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
pub struct RegisteredVotersAmountQuery {
  pub voting_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegisteredVotersAmountView {
  pub registered_voters_amount: u32
}

pub fn get_registered_voters_amount(
  state: &ServiceApiState,
  query: RegisteredVotersAmountQuery
) -> api::Result<RegisteredVotersAmountView> {
  let snapshot = state.snapshot();

  Voting::get(&snapshot, query.voting_id.clone())
    .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

  let voters_registry = VotersRegistry::instantiate(&snapshot, query.voting_id);
  
  Ok({
    RegisteredVotersAmountView {
      registered_voters_amount: voters_registry.get_voters_amount(),
    }
  })
}