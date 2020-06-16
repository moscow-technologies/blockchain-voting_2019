
use exonum_merkledb::{IndexAccess, ListIndex};


#[derive(Debug)]
pub struct VotingsRegistry<T> {
  access: T
}

impl<T> AsMut<T> for VotingsRegistry<T> {
  fn as_mut(&mut self) -> &mut T {
      &mut self.access
  }
}

impl<T> VotingsRegistry<T>
where
    T: IndexAccess,
{
  pub fn instantiate(access: T) -> Self {
    VotingsRegistry {
      access
    }
  }

  pub fn get_votings_ids(&self) -> Vec<String> {
    ListIndex::new(votings_registry_storage_path(), self.access.clone())
      .iter().collect()
  }

  pub fn register_voting(&mut self, voting_id: String) {
    ListIndex::new(votings_registry_storage_path(), self.access.clone())
      .push(voting_id);
  }
}

fn votings_registry_storage_path() -> String {
  "votings_registry.list".to_owned()
}