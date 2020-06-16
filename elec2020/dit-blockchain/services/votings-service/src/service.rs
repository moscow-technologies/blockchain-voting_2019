use exonum::{
    api::ServiceApiBuilder,
    blockchain::{Service, Transaction, TransactionSet},
    crypto::Hash,
    messages::RawTransaction,
};

use exonum_merkledb::{Snapshot, Fork};

use serde_json::{to_value, Value};

use crate::{
    config::ServiceConfig,
    api::{PublicApi, PrivateApi},
    transactions::VotingTransactions,
};

pub const SERVICE_ID: u16 = 1001;
pub const SERVICE_NAME : &str = "votings_service";

#[derive(Debug)]
pub struct VotingsService {
    config: ServiceConfig
}

impl VotingsService {
    pub fn new(config: ServiceConfig) -> Self {
        Self {
            config
        }
    }
}

impl Service for VotingsService {
    fn service_name(&self) -> &'static str {
        SERVICE_NAME
    }

    fn service_id(&self) -> u16 {
        SERVICE_ID
    }
    
    fn initialize(&self, _fork: &Fork) -> Value {
        to_value(self.config.clone()).unwrap()
    }

    fn tx_from_raw(&self, raw: RawTransaction) -> Result<Box<dyn Transaction>, failure::Error> {
        let tx = VotingTransactions::tx_from_raw(raw)?;
        Ok(tx.into())
    }

    fn state_hash(&self, _: &dyn Snapshot) -> Vec<Hash> {
        vec![]
    }

    fn wire_api(&self, builder: &mut ServiceApiBuilder) {
        PublicApi::wire(builder);
        PrivateApi::wire(builder);
    }
}