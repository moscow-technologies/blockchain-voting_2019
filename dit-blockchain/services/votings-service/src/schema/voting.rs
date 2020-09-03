
use std::collections::HashMap;
use std::convert::{From, Into};
use exonum_merkledb::{IndexAccess, Entry};
use failure::Error;
use exonum_sodiumoxide::crypto::box_;

use crate::{
  enums::VotingState,
  types::{
    SealedBoxPublicKeyWrapper,
    SealedBoxSecretKeyWrapper,
  },
  proto,
};

#[derive(new, Clone, Debug, Serialize, Deserialize, ProtobufConvert)]
#[exonum(pb = "proto::CryptoSystemSettings")]
struct CryptoSystemSettingsSchema {
  pub public_key: SealedBoxPublicKeyWrapper,
  pub private_key: SealedBoxSecretKeyWrapper, // 0 value is considered None
}

#[derive(new, Clone, Debug)]
pub struct CryptoSystemSettings {
  pub public_key: box_::curve25519xsalsa20poly1305::PublicKey,
  pub private_key: Option<box_::curve25519xsalsa20poly1305::SecretKey>,
}

impl From<CryptoSystemSettingsSchema> for CryptoSystemSettings {
  fn from(schema: CryptoSystemSettingsSchema) -> Self {
    let private_key: box_::curve25519xsalsa20poly1305::SecretKey = schema.private_key.into();

    Self {
      public_key: schema.public_key.into(),
      private_key: match private_key.0 == [0u8; 32] {
        true => None,
        false => Some(private_key)
      },
    }
  }
}

impl Into<CryptoSystemSettingsSchema> for CryptoSystemSettings {
  fn into(self) -> CryptoSystemSettingsSchema {
    CryptoSystemSettingsSchema {
      public_key: self.public_key.into(),
      private_key: match self.private_key {
        Some(private_key) => private_key.into(),
        None => box_::curve25519xsalsa20poly1305::SecretKey::from_slice(&[0u8; 32]).unwrap().into(),
      },
    }
  }
}

#[derive(new, Clone, Debug, Serialize, Deserialize, ProtobufConvert)]
#[exonum(pb = "proto::BallotConfig")]
pub struct BallotConfig {
  pub district_id: u32,
  pub question: String,
  pub options: HashMap<u32, String>,
  pub min_choices: u32,
  pub max_choices: u32
}

#[derive(new, Clone, Debug, Serialize, Deserialize, ProtobufConvert)]
#[exonum(pb = "proto::Voting")]
struct VotingSchema {
  pub voting_id: String,
  pub crypto_system: CryptoSystemSettingsSchema,
  pub ballots_config: HashMap<u32, BallotConfig>,
  pub state: VotingState,
}


#[derive(Debug)]
pub struct Voting<T> {
  access: T,
  voting_id: String,
  crypto_system: CryptoSystemSettings,
  ballots_config: HashMap<u32, BallotConfig>,
  state: VotingState,
}

impl<T> AsMut<T> for Voting<T> {
  fn as_mut(&mut self) -> &mut T {
      &mut self.access
  }
}

impl<T> Voting<T>
where
    T: IndexAccess,
{
  pub fn create(
    access: T,
    voting_id: String,
    crypto_system: CryptoSystemSettings,
    mut ballots_config: HashMap<u32, BallotConfig>,
  ) -> Result<Self, Error> {
    let mut voting_storage: Entry<T, VotingSchema> = Entry::new(
      voting_storage_path(&voting_id),
      access.clone()
    );

    if voting_storage.exists() {
      return Err(format_err!("Voting already exists"));
    }

    for (_, config) in ballots_config.iter_mut() {
      if config.options.contains_key(&0) {
        return Err(format_err!("option can not be zero"));
      }

      if config.min_choices == 0 {
        config.min_choices = 1;
      }

      if config.max_choices == 0 {
        config.max_choices = 1;
      }

      if config.min_choices > config.max_choices {
        return Err(format_err!("min_choices must be less or equal max_choices"));
      }

      if config.max_choices > (config.options.len() as u32) {
        return Err(format_err!("max_choices must be less or equal options length"));
      }
    }

    let voting = Self {
      access,
      voting_id,
      crypto_system,
      ballots_config,
      state: VotingState::Registration,
    };

    voting_storage.set(voting.to_schema());

    Ok(voting)
  }

  pub fn get(access: T, voting_id: String) -> Option<Self> {
    let voting_storage: Entry<T, VotingSchema> = Entry::new(
      voting_storage_path(&voting_id),
      access.clone()
    );

    let voting_schema = voting_storage.get();
    if voting_schema.is_none() {
      return None;
    }
    let voting_schema = voting_schema.unwrap();

    Some(Self {
      access,
      voting_id: voting_schema.voting_id,
      crypto_system: voting_schema.crypto_system.into(),
      ballots_config: voting_schema.ballots_config,
      state: voting_schema.state,
    })
  }

  pub fn get_crypto_system_settings(&self) -> CryptoSystemSettings {
    self.crypto_system.clone()
  }

  pub fn get_ballots_config(&self) -> HashMap<u32, BallotConfig> {
    self.ballots_config.clone()
  }

  pub fn get_state(&self) -> VotingState {
    self.state.clone()
  }

  pub fn change_state(&mut self, new_state: VotingState) {
    self.state = new_state;
    self.update_storage();
  }

  pub fn publish_private_key(&mut self, private_key: box_::curve25519xsalsa20poly1305::SecretKey) {
    self.crypto_system.private_key = Some(private_key);
    self.update_storage();
  }

  fn update_storage(&self) {
    let mut voting_storage: Entry<T, VotingSchema> = Entry::new(
      voting_storage_path(&self.voting_id),
      self.access.clone()
    );

    voting_storage.set(self.to_schema());
  }

  fn to_schema(&self) -> VotingSchema {
    VotingSchema {
      voting_id: self.voting_id.clone(),
      crypto_system: self.crypto_system.clone().into(),
      ballots_config: self.ballots_config.clone(),
      state: self.state.clone(),
    }
  }
}

fn voting_storage_path(voting_id: &str) -> String {
  ["votings_service.", voting_id, ".voting"].concat()
}