use exonum::api::{self, ServiceApiState};
use std::collections::HashMap;

use crate::schema::{BallotsStorage, Voting};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StoredBallotsAmountQuery {
    pub voting_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StoredBallotsAmountView {
    pub stored_ballots_amount: HashMap<u32, u32>,
}

pub fn get_stored_ballots_amount(
    state: &ServiceApiState,
    query: StoredBallotsAmountQuery,
) -> api::Result<StoredBallotsAmountView> {
    let snapshot = state.snapshot();

    Voting::get(&snapshot, query.voting_id.clone())
        .ok_or_else(|| api::Error::NotFound("Voting not found".to_owned()))?;

    let ballots_storage = BallotsStorage::instantiate(&snapshot, query.voting_id);

    Ok({
        StoredBallotsAmountView {
            stored_ballots_amount: ballots_storage.get_stored_ballots_amount(),
        }
    })
}
