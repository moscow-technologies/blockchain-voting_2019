use exonum_sodiumoxide::crypto::box_;
use hex;
use serde::{Deserialize, Serialize};
use serde_json::{json, to_string_pretty};
use std::error::Error;

use crate::{cryptor::test_cryptor, errors::CryptorError};

#[derive(Serialize, Deserialize)]
struct EncryptedData {
    a: String,
    b: String,
}

pub fn generate_cryptosystem() -> Result<(), Box<dyn Error>> {
    let (public_key, private_key) = box_::gen_keypair();

    if test_cryptor(&public_key, &private_key).is_err() {
        Err(CryptorError::DecryptionTestFailed)?;
    }

    let public_key_as_string = hex::encode(&public_key.0);
    let private_key_as_string = hex::encode(&private_key.0);

    let cryptosystem_json = json!({
      "publicKey": public_key_as_string,
      "privateKey": private_key_as_string,
    });
    let cryptosystem_json = to_string_pretty(&cryptosystem_json).unwrap();

    println!("{}", cryptosystem_json);

    Ok(())
}
