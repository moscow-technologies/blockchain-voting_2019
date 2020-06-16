
use exonum_merkledb::{IndexAccess};
use exonum::blockchain::{Schema, StoredConfiguration};

use crate::{
  config::ServiceConfig,
  service::SERVICE_NAME
};


#[derive(Debug)]
pub struct ServiceData<T> {
  access: T
}

impl<T> AsMut<T> for ServiceData<T> {
  fn as_mut(&mut self) -> &mut T {
      &mut self.access
  }
}

impl<T> ServiceData<T>
where
    T: IndexAccess,
{
  pub fn instantiate(access: T) -> Self {
    ServiceData {
      access
    }
  }

  pub fn get_actual_configuration(&self) -> ServiceConfig {
      let actual_configuration = Schema::new(self.access.clone()).actual_configuration();
      Self::parse_config(&actual_configuration)
          .expect("Actual service configuration is absent")
  }
  
  fn parse_config(configuration: &StoredConfiguration) -> Option<ServiceConfig> {
      configuration
          .services
          .get(SERVICE_NAME)
          .cloned()
          .map(|value| serde_json::from_value(value).expect("Unable to parse configuration"))
  }
}