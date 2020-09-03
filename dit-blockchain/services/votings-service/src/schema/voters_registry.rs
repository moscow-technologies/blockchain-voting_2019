
use std::collections::HashMap;
use exonum_merkledb::{IndexAccess, MapIndex, Entry};
use failure::Error;

use crate::proto;


#[derive(new, Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::Voter")]
pub struct Voter {
  pub voter_id: String,
  pub is_participation_revoked: bool,
  pub ballot_issuing_district: u32, // 0 means ballot was not issued, district id cannot be 0
}

impl Voter {
  pub fn create(voter_id: String) -> Self {
    Self {
      voter_id,
      is_participation_revoked: false,
      ballot_issuing_district: 0,
    }
  }
}

#[derive(Debug)]
pub struct VotersRegistry<T> {
  access: T,
  voting_id: String
}

impl<T> AsMut<T> for VotersRegistry<T> {
  fn as_mut(&mut self) -> &mut T {
      &mut self.access
  }
}

impl<T> VotersRegistry<T>
where
    T: IndexAccess,
{
  pub fn instantiate(access: T, voting_id: String) -> Self {
    Self {
      access,
      voting_id
    }
  }

  pub fn get_voters_amount(&self) -> u32 {
    let voters_amount_storage = Entry::new(
      voters_amount_storage_path(&self.voting_id),
      self.access.clone()
    );

    voters_amount_storage.get().or(Some(0)).unwrap()
  }

  pub fn get_issued_ballots_amount(&self) -> HashMap<u32, u32> {
    let mut issued_ballots_by_district = HashMap::new();

    let issued_ballots_counter: MapIndex<T, u32, u32> = MapIndex::new(
      issued_ballots_counter_storage_path(&self.voting_id),
      self.access.clone()
    );

    issued_ballots_counter.iter().for_each(|(district_id, ballots_amount)| {
      issued_ballots_by_district.insert(district_id, ballots_amount);
    });

    issued_ballots_by_district
  }

  pub fn does_voter_exist(&self, voter_id: String) -> bool {
    let voters_list_storage: MapIndex<T, String, Voter> = MapIndex::new(
      voters_list_storage_path(&self.voting_id),
      self.access.clone()
    );
    
    voters_list_storage.contains(&voter_id)
  }

  pub fn get_voter_info(&self, voter_id: String) -> Option<Voter> {
    let voters_list_storage: MapIndex<T, String, Voter> = MapIndex::new(
      voters_list_storage_path(&self.voting_id),
      self.access.clone()
    );
    
    voters_list_storage.get(&voter_id)
  }

  pub fn register_voters(&mut self, voters_ids: Vec<String>) {
    let mut voters_list_storage: MapIndex<T, String, Voter> = MapIndex::new(
      voters_list_storage_path(&self.voting_id),
      self.access.clone()
    );

    let mut new_unique_voters: u32 = 0;
    
    voters_ids.iter().for_each(|voter_id| {
      if !voters_list_storage.contains(voter_id) {
        voters_list_storage.put(&voter_id, Voter::create(voter_id.clone()));
        new_unique_voters += 1;
      }
    });

    let mut voters_amount_storage = Entry::new(
      voters_amount_storage_path(&self.voting_id),
      self.access.clone()
    );

    let new_voters_amount = match voters_amount_storage.get() {
      Some(current_voters_amount) => current_voters_amount + new_unique_voters,
      None => new_unique_voters,
    };

    voters_amount_storage.set(new_voters_amount);
  }
  
  pub fn issue_ballot(&mut self, voter_id: String, district_id: u32) -> Result<(), Error> {
    if district_id == 0 {
      Err(format_err!("District ID cannot be zero"))?;
    }

    let mut voters_list_storage: MapIndex<T, String, Voter> = MapIndex::new(
      voters_list_storage_path(&self.voting_id),
      self.access.clone()
    );

    let mut voter = voters_list_storage.get(&voter_id)
      .ok_or_else(|| format_err!("Voter does not exist"))?;

    if voter.is_participation_revoked {
      Err(format_err!("Participation for voter was revoked"))?;
    }
    
    if voter.ballot_issuing_district != 0 {
      Err(format_err!("Ballot for voter was already issued"))?;
    }

    voter.ballot_issuing_district = district_id;
    voters_list_storage.put(&voter_id, voter);

    let mut issued_ballots_counter: MapIndex<T, u32, u32> = MapIndex::new(
      issued_ballots_counter_storage_path(&self.voting_id),
      self.access.clone()
    );

    let issued_ballots_for_district = issued_ballots_counter.get(&district_id).or(Some(0)).unwrap();
    issued_ballots_counter.put(&district_id, issued_ballots_for_district + 1);

    Ok(())
  }

  pub fn revoke_participation(&mut self, voter_id: String) -> Result<(), Error> {
    let mut voters_list_storage: MapIndex<T, String, Voter> = MapIndex::new(
      voters_list_storage_path(&self.voting_id),
      self.access.clone()
    );

    let mut voter = voters_list_storage.get(&voter_id)
      .ok_or_else(|| format_err!("Voter does not exist"))?;

    if voter.ballot_issuing_district != 0 {
      Err(format_err!("Ballot for voter was already issued"))?;
    }

    voter.is_participation_revoked = true;
    voters_list_storage.put(&voter_id, voter);

    Ok(())
  }
}

fn voters_list_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".voters_registry.voters_list"].concat()
}

fn voters_amount_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".voters_registry.voters_amount"].concat()
}

fn issued_ballots_counter_storage_path(voting_id: &str) -> String {
  ["votings_registry.", voting_id, ".voters_registry.issued_ballots"].concat()
}