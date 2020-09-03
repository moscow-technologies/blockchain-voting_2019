use exonum::crypto::PublicKey;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ServiceConfig {
    api_public_keys: Vec<PublicKey>
}

impl ServiceConfig {
    pub fn with_keys(public_keys: Vec<PublicKey>) -> Self {
        ServiceConfig {
            api_public_keys: public_keys
        }
    }

    pub fn api_public_keys(&self) -> Vec<PublicKey> {
        self.api_public_keys.clone()
    }
}