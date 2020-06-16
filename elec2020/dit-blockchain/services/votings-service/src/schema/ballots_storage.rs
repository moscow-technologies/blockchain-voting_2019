
use std::collections::HashMap;
use std::convert::{From, Into};
use failure::Error;
use exonum::crypto::{PublicKey, Hash};
use exonum_merkledb::{IndexAccess, MapIndex, ListIndex, Entry};
use exonum_sodiumoxide::crypto::box_;

use crate::{
  types::{
    SealedBoxPublicKeyWrapper,
    SealedBoxNonceWrapper,
  },
  proto,
  util::read_le_u32,
};


#[derive(new, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::EncryptedChoice")]
struct EncryptedChoiceSchema {
  pub encrypted_message: Vec<u8>,
  pub nonce: SealedBoxNonceWrapper,
  pub public_key: SealedBoxPublicKeyWrapper,
}

#[derive(new, Clone, Debug)]
pub struct EncryptedChoice {
  pub encrypted_message: Vec<u8>,
  pub nonce: box_::curve25519xsalsa20poly1305::Nonce,
  pub public_key: box_::curve25519xsalsa20poly1305::PublicKey,
}

impl From<EncryptedChoiceSchema> for EncryptedChoice {
  fn from(ec: EncryptedChoiceSchema) -> Self {
    Self {
      encrypted_message: ec.encrypted_message, 
      nonce: ec.nonce.into(),
      public_key: ec.public_key.into(),
    }
  }
}

impl Into<EncryptedChoiceSchema> for EncryptedChoice {
  fn into(self) -> EncryptedChoiceSchema {
    EncryptedChoiceSchema {
      encrypted_message: self.encrypted_message, 
      nonce: self.nonce.into(),
      public_key: self.public_key.into(),
    }
  }
}

#[derive(new, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::Ballot")]
struct BallotSchema {
  pub index: u32,
  pub voter: PublicKey,
  pub district_id: u32,
  pub encrypted_choice: EncryptedChoiceSchema,
  pub decrypted_choice: u32, // should be 0 if not decrypted
  pub store_tx_hash: Hash,
  pub decrypt_tx_hash: Hash, // should be zeroed by default
  pub invalid: bool,
}

#[derive(new, Clone, Debug)]
pub struct Ballot {
  pub index: u32,
  pub voter: PublicKey,
  pub district_id: u32,
  pub encrypted_choice: EncryptedChoice,
  #[new(value = "None")]
  pub decrypted_choice: Option<u32>,
  pub store_tx_hash: Hash,
  #[new(value = "None")]
  pub decrypt_tx_hash: Option<Hash>,
  #[new(value = "false")]
  pub invalid: bool,
}

impl From<BallotSchema> for Ballot {
  fn from(ballot: BallotSchema) -> Self {

    Self {
      index: ballot.index,
      voter: ballot.voter,
      district_id: ballot.district_id,
      encrypted_choice: ballot.encrypted_choice.into(),
      decrypted_choice: match ballot.decrypted_choice {
        0 => None,
        _ => Some(ballot.decrypted_choice),
      },
      store_tx_hash: ballot.store_tx_hash,
      decrypt_tx_hash: match ballot.decrypt_tx_hash == Hash::zero() {
        true => None,
        false => Some(ballot.decrypt_tx_hash),
      },
      invalid: ballot.invalid,
    }
  }
}

impl Into<BallotSchema> for Ballot {
  fn into(self) -> BallotSchema {
    BallotSchema {
      index: self.index,
      voter: self.voter,
      district_id: self.district_id,
      encrypted_choice: self.encrypted_choice.into(),
      decrypted_choice: match self.decrypted_choice {
        Some(decrypted_choice) => decrypted_choice,
        None => 0,
      },
      store_tx_hash: self.store_tx_hash,
      decrypt_tx_hash: match self.decrypt_tx_hash {
        Some(decrypt_tx_hash) => decrypt_tx_hash,
        None => Hash::zero(),
      },
      invalid: self.invalid,
    }
  }
}

#[derive(new, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::DecryptionStatistics")]
pub struct DecryptionStatistics {
  #[new(value = "0")]
  pub decrypted_ballots_amount: u32,
  #[new(value = "0")]
  pub invalid_ballots_amount: u32,
}

#[derive(new, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::VotingResults")]
pub struct VotingResults {
  pub district_id: u32,
  #[new(default)]
  pub tally: HashMap<u32, u32>,
}


#[derive(Debug)]
pub struct BallotsStorage<T> {
  access: T,
  voting_id: String,
}

impl<T> AsMut<T> for BallotsStorage<T> {
  fn as_mut(&mut self) -> &mut T {
      &mut self.access
  }
}

impl<T> BallotsStorage<T>
where
    T: IndexAccess,
{
  pub fn instantiate(access: T, voting_id: String) -> Self {
    Self {
      access,
      voting_id
    }
  }

  pub fn get_ballot_by_index(&self, ballot_index: u32) -> Option<Ballot> {
    let ballots_storage: ListIndex<T,BallotSchema> = ListIndex::new(
      ballots_storage_path(&self.voting_id),
      self.access.clone(),
    );

    ballots_storage.get(ballot_index as u64).map(|v| v.into())
  }

  pub fn get_ballot_by_store_tx_hash(&self, store_tx_hash: Hash) -> Option<Ballot> {
    let ballot_by_store_tx_index: MapIndex<T, Hash, u64> = MapIndex::new(
      ballot_by_store_tx_index_storage_path(&self.voting_id),
      self.access.clone(),
    );

    match ballot_by_store_tx_index.get(&store_tx_hash) {
      None => None,
      Some(ballot_index) => self.get_ballot_by_index(ballot_index as u32),
    }
  }

  pub fn get_stored_ballots_amount(&self) -> HashMap<u32, u32> {
    let stored_ballots_counter: MapIndex<T, u32, u32> = MapIndex::new(
      stored_ballots_counter_storage_path(&self.voting_id),
      self.access.clone()
    );

    stored_ballots_counter.iter()
      .fold(HashMap::new(), |mut map, (district_id, ballots_amount)| {
        map.insert(district_id, ballots_amount);
        map
      })
  }

  pub fn get_decryption_statistics(&self) -> DecryptionStatistics {
    let decrypted_ballots_counter_storage: Entry<T, DecryptionStatistics> = Entry::new(
      decrypted_ballots_counter_storage_path(&self.voting_id),
      self.access.clone(),
    );

    decrypted_ballots_counter_storage.get()
      .or(Some(DecryptionStatistics::new())).unwrap()
  }

  pub fn get_voting_results(&self) -> HashMap<u32, VotingResults> {
    let voting_results_storage: MapIndex<T, u32, VotingResults> = MapIndex::new(
      results_storage_path(&self.voting_id),
      self.access.clone(),
    );

    voting_results_storage.iter()
      .fold(HashMap::new(), |mut map, (district_id, results_for_district)| {
        map.insert(district_id, results_for_district.clone());
        map
      })
  }

  pub fn add_voter_to_voters_list(&mut self, voter: PublicKey) {
    let mut voters_list: MapIndex<T, PublicKey, bool> = MapIndex::new(
      voters_list_storage_path(&self.voting_id),
      self.access.clone(),
    );
    
    if !voters_list.contains(&voter) {
      voters_list.put(&voter, false);
    }
  }

  pub fn store_ballot(
    &mut self,
    voter: PublicKey,
    district_id: u32,
    encrypted_choice: EncryptedChoice,
    store_tx_hash: Hash,
  ) -> Result<(), Error> {
    let mut voters_list: MapIndex<T, PublicKey, bool> = MapIndex::new(
      voters_list_storage_path(&self.voting_id),
      self.access.clone(),
    );

    let voter_has_voted = voters_list.get(&voter)
      .ok_or_else(|| format_err!("Voter keypair is not in list"))?;

    if voter_has_voted {
      Err(format_err!("Voter has already voted"))?;
    }

    voters_list.put(&voter, true);

    let mut ballots_storage: ListIndex<T,BallotSchema> = ListIndex::new(
      ballots_storage_path(&self.voting_id),
      self.access.clone(),
    );
    let mut ballot_by_store_tx_index: MapIndex<T, Hash, u64> = MapIndex::new(
      ballot_by_store_tx_index_storage_path(&self.voting_id),
      self.access.clone(),
    );
    let mut stored_ballots_counter: MapIndex<T, u32, u32> = MapIndex::new(
      stored_ballots_counter_storage_path(&self.voting_id),
      self.access.clone()
    );

    let new_ballot_index = ballots_storage.len() as u32;

    let ballot = Ballot::new(
      new_ballot_index,
      voter,
      district_id.clone(),
      encrypted_choice,
      store_tx_hash,
    );

    ballot_by_store_tx_index.put(&ballot.store_tx_hash, (ballot.index as u32).into());
    ballots_storage.push(ballot.into());
    let stored_ballots_for_district = stored_ballots_counter.get(&district_id).or(Some(0)).unwrap();
    stored_ballots_counter.put(&district_id, stored_ballots_for_district + 1);
  
    Ok(())
  }

  pub fn decrypt_ballot(
    &mut self,
    ballot_index: u32,
    decryption_key: &box_::curve25519xsalsa20poly1305::SecretKey,
    decrypt_tx_hash: Hash
  ) -> Result<(), Error> {
    let mut ballots_storage: ListIndex<T, BallotSchema> = ListIndex::new(
      ballots_storage_path(&self.voting_id),
      self.access.clone(),
    );
    let mut decrypted_ballots_counter_storage: Entry<T, DecryptionStatistics> = Entry::new(
      decrypted_ballots_counter_storage_path(&self.voting_id),
      self.access.clone(),
    );

    let ballot_schema = ballots_storage.get(ballot_index as u64)
      .ok_or_else(|| format_err!("Ballot with specified index does not exist"))?;

    let mut ballot: Ballot = ballot_schema.into();

    let mut decrypted_ballots_counter = decrypted_ballots_counter_storage.get()
      .or(Some(DecryptionStatistics::new())).unwrap();

    ballot.decrypt_tx_hash = Some(decrypt_tx_hash);

    let decrypted_choice = box_::open(
      &ballot.encrypted_choice.encrypted_message,
      &ballot.encrypted_choice.nonce,
      &ballot.encrypted_choice.public_key,
      decryption_key,
    ).ok();
    
    let decrypted_choice = match decrypted_choice {
      Some(decrypted_choice) => read_le_u32(&decrypted_choice).ok(),
      None => None,
    };

    match decrypted_choice {
      Some(decrypted_choice) => {
        ballot.decrypted_choice = Some(decrypted_choice);
        decrypted_ballots_counter.decrypted_ballots_amount += 1;
      },
      None => {
        ballot.invalid = true;
        decrypted_ballots_counter.invalid_ballots_amount += 1;
      }
    }

    ballots_storage.set(ballot_index as u64, ballot.into());
    decrypted_ballots_counter_storage.set(decrypted_ballots_counter);

    Ok(())
  }

  pub fn tally_results(&mut self) {
    let ballots_storage: ListIndex<T, BallotSchema> = ListIndex::new(
      ballots_storage_path(&self.voting_id),
      self.access.clone(),
    );
    let mut voting_results_storage: MapIndex<T, u32, VotingResults> = MapIndex::new(
      results_storage_path(&self.voting_id),
      self.access.clone(),
    );

    let voting_results: HashMap<u32, VotingResults> = ballots_storage.iter()
      .fold(HashMap::new(), |mut map, ballot| {
        if ballot.invalid || ballot.decrypted_choice == 0 {
          return map;
        }

        let mut tally_for_district: VotingResults = map.get(&ballot.district_id)
          .map(|v| v.clone())
          .or(Some(VotingResults::new(ballot.district_id.clone()))).unwrap();

        let choice_counter: u32 = tally_for_district.tally.get(&ballot.decrypted_choice)
          .map(|v| v.clone())
          .or(Some(0)).unwrap();

        tally_for_district.tally.insert(ballot.decrypted_choice.clone(), choice_counter + 1);
        map.insert(ballot.district_id.clone(), tally_for_district);
        map
      });

    voting_results.iter()
      .for_each(|(option, tally)| {
        voting_results_storage.put(option, tally.clone());
      });
  }
}

fn voters_list_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".voters_list"].concat()
}

fn ballots_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".ballots_storage"].concat()
}

fn ballot_by_store_tx_index_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".ballots_storage.ballot_by_store_tx_index"].concat()
}

fn stored_ballots_counter_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".ballots_storage.stored_ballots_counter"].concat()
}

fn decrypted_ballots_counter_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".ballots_storage.decrypted_ballots_counter"].concat()
}

fn results_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".ballots_storage.results"].concat()
}