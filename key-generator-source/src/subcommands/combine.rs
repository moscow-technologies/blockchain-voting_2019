use exonum_sodiumoxide::crypto::box_;
use hex;
use rusty_secrets::sss::recover_secret;
use serde::{Deserialize, Serialize};
use serde_json::{json, to_string_pretty};
use std::error::Error;
use std::fs::{read_dir, read_to_string as read_file_to_string, File};
use std::io::prelude::*;
use std::path::Path;
use std::result::Result;

use crate::{
    cryptor::test_cryptor,
    errors::{InvalidArgsError, KeyCombiningError},
};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct KeyPart {
    publicKey: String,
    privateKeyPart: String,
}

fn write_private_key_file(
    private_key_data: &String,
    private_key_dir: &str,
) -> Result<(), Box<dyn Error>> {
    let mut private_key_file = File::create(format!("{}/private-key.json", private_key_dir))
        .or_else(|_| Err(InvalidArgsError::KeyFileCreationFailure))?;

    private_key_file
        .write_all(private_key_data.as_bytes())
        .or_else(|_| Err(InvalidArgsError::KeyFileCreationFailure))?;

    Ok(())
}

pub fn combine_key(dir: &str) -> Result<(), Box<dyn Error>> {
    let private_key_dir = Path::new(dir);
    if !private_key_dir.is_dir() {
        Err(InvalidArgsError::PrivateKeyDirectoryUnavailable)?;
    }

    let key_parts_files = read_dir(private_key_dir);
    if key_parts_files.is_err() {
        Err(InvalidArgsError::PrivateKeyDirectoryUnavailable)?;
    }

    let (key_parts, errors): (Vec<Result<String, _>>, Vec<_>) = key_parts_files
        .unwrap()
        .map(|file| {
            if file.is_err() {
                return Err("File enumeration failed");
            }

            let file_path = file.unwrap().path();

            let file_name = file_path.file_name();
            if file_name.is_none() {
                return Err("File name extraction failed");
            }
            let file_name = file_name.unwrap().to_str().unwrap();

            if !file_name.contains("of-private-key.json") {
                return Err("Not private key part file");
            }

            let file_contents = read_file_to_string(file_path);
            if file_contents.is_err() {
                return Err("File reading failed");
            }

            Ok(file_contents.unwrap().trim().to_owned())
        })
        .partition(Result::is_ok);

    if key_parts.len() < 2 {
        println!("{:?}", errors);
        Err(KeyCombiningError::KeyPartsReadingFailure)?;
    }

    let (key_parts, errors): (Vec<Result<KeyPart, _>>, Vec<_>) = key_parts
        .into_iter()
        .map(|part| {
            let key_part: Result<KeyPart, serde_json::Error> =
                serde_json::from_str(part.unwrap().as_str());
            if key_part.is_err() {
                return Err("File parsing failed");
            }

            Ok(key_part.unwrap())
        })
        .partition(Result::is_ok);

    if errors.len() > 0 {
        Err(KeyCombiningError::KeyPartsParsingFailure)?;
    }

    let key_parts: Vec<KeyPart> = key_parts.into_iter().map(|part| part.unwrap()).collect();

    let public_key_hex = hex::decode(&key_parts[0].publicKey.as_str())
        .or_else(|_| Err(KeyCombiningError::CryptorRecreationFailed))?;

    let public_key = box_::curve25519xsalsa20poly1305::PublicKey::from_slice(&public_key_hex)
        .ok_or_else(|| KeyCombiningError::CryptorRecreationFailed)?;

    let key_parts: Vec<String> = key_parts
        .into_iter()
        .map(|part| part.privateKeyPart)
        .collect();

    let private_key_bytes =
        recover_secret(&key_parts, true).or_else(|_| Err(KeyCombiningError::KeyRecoveryFailed))?;

    let private_key = box_::curve25519xsalsa20poly1305::SecretKey::from_slice(&private_key_bytes)
        .ok_or_else(|| KeyCombiningError::KeyRecoveryFailed)?;

    test_cryptor(&public_key, &private_key)?;

    let private_key_as_string = hex::encode(&private_key.0);

    let private_key_json = json!({
      "privateKey": private_key_as_string,
    });
    let private_key_json = to_string_pretty(&private_key_json)?;

    write_private_key_file(&private_key_json, dir)?;

    println!("recreated key: {}", private_key_as_string);

    Ok(())
}
