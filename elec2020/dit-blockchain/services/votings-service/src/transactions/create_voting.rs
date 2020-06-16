use std::collections::HashMap;
use std::convert::{Into};

use exonum::{
    blockchain::{ExecutionResult, Transaction, TransactionContext},
};

use crate::{
    errors::Error,
    schema::{
      ServiceData,
      CryptoSystemSettings,
      BallotConfig,
      Voting,
      VotingsRegistry,
    },
    types::{
      SealedBoxPublicKeyWrapper,
    },
    proto,
};

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxCryptoSystemSettings")]
pub struct TxCryptoSystemSettings {
  pub public_key: SealedBoxPublicKeyWrapper,
}

impl Into<CryptoSystemSettings> for TxCryptoSystemSettings {
  fn into(self) -> CryptoSystemSettings {
    CryptoSystemSettings {
      public_key: self.public_key.into(),
      private_key: None,
    }
  }
}

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxBallotConfig")]
pub struct TxBallotConfig {
  pub district_id: u32,
  pub question: String,
  pub options: HashMap<u32, String>
}

impl Into<BallotConfig> for TxBallotConfig {
  fn into(self) -> BallotConfig {
    BallotConfig {
      district_id: self.district_id,
      question: self.question,
      options: self.options,
    }
  }
}

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxCreateVoting")]
pub struct TxCreateVoting {
  pub crypto_system: TxCryptoSystemSettings,
  pub ballots_config: Vec<TxBallotConfig>,
}

impl Transaction for TxCreateVoting {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let author = context.author();

        let service_data = ServiceData::instantiate(context.fork());
        let api_public_keys = service_data.get_actual_configuration().api_public_keys();

        if !api_public_keys.contains(&author) {
          Err(Error::AuthorNotAuthorized)?
        }

        let voting_id = context.tx_hash().to_hex();


        Voting::create(
          context.fork(),
          voting_id.clone(),
          self.crypto_system.clone().into(),
          self.ballots_config.iter().fold(HashMap::new(), |mut map, config| {
            let district_id = config.district_id.clone();
            map.insert(district_id, config.clone().into());
            map
          }),
        ).or_else(|_| Err(Error::FailedToCreateVoting))?;

        let mut votings_registry = VotingsRegistry::instantiate(context.fork());
        votings_registry.register_voting(voting_id.clone());

        println!("Voting created with ID {}", voting_id);
        Ok(())
    }
}
