use exonum_sodiumoxide::crypto::box_;
use hex;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::error::Error;
use std::fs::{read_to_string as read_file_to_string, File};
use std::io::prelude::*;
use std::path::Path;

use crate::errors::{InvalidArgsError, KeyCombiningError};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct CryptoSystem {
    publicKey: String,
}

pub fn encrypt(public_key_file: &str, datums_file: &str) -> Result<(), Box<dyn Error>> {
    let public_key_file = Path::new(public_key_file);
    let datums_file = Path::new(datums_file);

    if !public_key_file.is_file() {
        Err(InvalidArgsError::PublicKeyFileUnavailable)?;
    }

    if !datums_file.is_file() {
        Err(InvalidArgsError::DatumsFileUnavailable)?;
    }

    let encrypted_file_path = format!(
        "{}/encrypted_datums.csv",
        datums_file.parent().unwrap().to_str().unwrap()
    );
    let encrypted_file = Path::new(&encrypted_file_path);

    let cryptosystem: CryptoSystem =
        serde_json::from_str(read_file_to_string(public_key_file).unwrap().trim()).unwrap();

    let public_key_hex = hex::decode(cryptosystem.publicKey.as_str())
        .or_else(|_| Err(KeyCombiningError::CryptorRecreationFailed))?;

    let public_key = box_::curve25519xsalsa20poly1305::PublicKey::from_slice(&public_key_hex)
        .ok_or_else(|| KeyCombiningError::CryptorRecreationFailed)?;

    let datums: Vec<String> = read_file_to_string(datums_file)
        .unwrap()
        .trim()
        .lines()
        .map(|line| line.trim().to_owned())
        .collect();

    let encrypted_datums: Vec<String> = datums
        .into_iter()
        .map(|datum| {
            let datum = datum.trim().parse::<u32>();

            if datum.is_err() {
                return "Invalid Number".to_owned();
            }
            let datum: u32 = datum.unwrap();

            let (voter_pk, voter_sk) = box_::gen_keypair();
            let nonce = box_::gen_nonce();
            let encrypted_message =
                box_::seal(&datum.to_le_bytes(), &nonce, &public_key, &voter_sk);

            json!({
              "encryptedMessage": hex::encode(&encrypted_message),
              "nonce": hex::encode(&nonce.0),
              "publicKey": hex::encode(&voter_pk.0),
            })
            .to_string()
        })
        .collect();

    File::create(encrypted_file)
        .unwrap()
        .write_all(encrypted_datums.join("\n").as_bytes())
        .or_else(|_| Err(InvalidArgsError::DatumsFileCreationFailure))?;

    Ok(())
}
