use exonum::api::ServiceApiBuilder;

mod ballot_by_index;
mod ballot_by_store_tx_hash;
mod ballots_config;
mod crypto_system_settings;
mod decryption_statistics;
mod invalid_ballots;
mod issued_ballots_amount;
mod registered_voters_amount;
mod stored_ballots_amount;
mod voter_info;
mod voting_results;
mod voting_state;

use ballot_by_index::get_ballot_by_index;
use ballot_by_store_tx_hash::get_ballot_by_store_tx_hash;
use ballots_config::get_ballots_config;
use crypto_system_settings::get_crypto_system_settings;
use decryption_statistics::get_decryption_statistics;
use invalid_ballots::get_invalid_ballots;
use issued_ballots_amount::get_issued_ballots_amount;
use registered_voters_amount::get_registered_voters_amount;
use stored_ballots_amount::get_stored_ballots_amount;
use voter_info::get_voter_info;
use voting_results::get_voting_results;
use voting_state::get_voting_state;

#[derive(Debug, Clone, Copy)]
pub struct PublicApi;

#[derive(Debug, Clone, Copy)]
pub struct PrivateApi;

impl PublicApi {
    pub fn wire(builder: &mut ServiceApiBuilder) {
        builder
            .public_scope()
            .endpoint("v1/crypto-system-settings", get_crypto_system_settings)
            .endpoint("v1/ballots-config", get_ballots_config)
            .endpoint("v1/voting-state", get_voting_state)
            .endpoint("v1/registered-voters-amount", get_registered_voters_amount)
            .endpoint("v1/voter-info", get_voter_info)
            .endpoint("v1/issued-ballots-amount", get_issued_ballots_amount)
            .endpoint("v1/stored-ballots-amount", get_stored_ballots_amount)
            .endpoint("v1/ballot-by-store-tx-hash", get_ballot_by_store_tx_hash)
            .endpoint("v1/ballot-by-index", get_ballot_by_index)
            .endpoint("v1/invalid-ballots", get_invalid_ballots)
            .endpoint("v1/decryption-statistics", get_decryption_statistics)
            .endpoint("v1/voting-results", get_voting_results);
    }
}

impl PrivateApi {
    pub fn wire(builder: &mut ServiceApiBuilder) {
        builder.private_scope();
    }
}
