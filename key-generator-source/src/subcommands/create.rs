use exonum_sodiumoxide::crypto::box_;
use hex;
use rusty_secrets::sss::{recover_secret, split_secret};
use serde_json::{json, to_string_pretty};
use std::error::Error;
use std::fs::{DirBuilder, File};
use std::io::prelude::*;
use std::path::Path;

use crate::{
    cryptor::test_cryptor,
    errors::{InvalidArgsError, KeySplittingError},
};

pub fn create_keys(dir: &str, split_parts: u8, split_threshold: u8) -> Result<(), Box<dyn Error>> {
    println!("generating encryption keys...");

    let (public_key, private_key) = box_::gen_keypair();

    println!("keys generated, testing decryption...");

    test_cryptor(&public_key, &private_key)?;

    println!("splitting key...");

    let key_parts = split_secret(split_threshold, split_parts, &private_key.0, true).unwrap();

    let recovered_key_bytes: Vec<u8> =
        recover_secret(&key_parts, true).or_else(|_| Err(KeySplittingError::KeySplittingFailed))?;

    let recovered_key =
        box_::curve25519xsalsa20poly1305::SecretKey::from_slice(&recovered_key_bytes)
            .ok_or_else(|| KeySplittingError::KeySplittingFailed)?;

    if recovered_key != private_key {
        Err(KeySplittingError::KeySplittingFailed)?;
    }

    let public_key_as_string = hex::encode(&public_key.0);

    let cryptosystem_json = json!({
      "publicKey": public_key_as_string,
    });
    let cryptosystem_json = to_string_pretty(&cryptosystem_json)?;

    write_public_key_file(&cryptosystem_json, dir)?;

    println!("cryptosystem:\n{}", cryptosystem_json);

    let key_parts_json = key_parts
        .into_iter()
        .map(|part| {
            to_string_pretty(&json!({
              "publicKey": public_key_as_string,
              "privateKeyPart": part,
            }))
            .unwrap()
        })
        .collect();

    write_private_key_parts_files(&key_parts_json, dir)?;

    Ok(())
}

fn write_public_key_file(public_key_data: &String, dir: &str) -> Result<(), Box<dyn Error>> {
    DirBuilder::new()
        .recursive(true)
        .create(Path::new(&format!("{}/public", dir)))
        .or_else(|_| Err(InvalidArgsError::DirectoryCreationFailure))?;

    let mut public_key_file = File::create(format!("{}/public/public-key.json", dir))
        .or_else(|_| Err(KeySplittingError::PubKeyFileWriteError))?;

    public_key_file
        .write_all(public_key_data.as_bytes())
        .or_else(|_| Err(KeySplittingError::PubKeyFileWriteError))?;

    Ok(())
}

fn write_private_key_parts_files(
    private_key_parts: &Vec<String>,
    dir: &str,
) -> Result<(), Box<dyn Error>> {
    let private_key_dir = format!("{}/private", dir);
    let private_key_dir_path = Path::new(&private_key_dir);

    DirBuilder::new()
        .recursive(true)
        .create(private_key_dir_path)
        .or_else(|_| Err(InvalidArgsError::DirectoryCreationFailure))?;

    let private_key_dir_path = private_key_dir_path.to_str().unwrap();

    let (_, errors): (Vec<_>, Vec<_>) = private_key_parts
        .into_iter()
        .enumerate()
        .map(|(index, part)| {
            let key_file = File::create(Path::new(&format!(
                "{}/part-{}-of-private-key.json",
                private_key_dir_path, index
            )));
            if key_file.is_err() {
                return Err(key_file.unwrap_err());
            }
            let mut key_file = key_file.unwrap();

            let write_result = key_file.write_all(part.as_bytes());

            if write_result.is_err() {
                return Err(write_result.unwrap_err());
            }

            Ok(())
        })
        .partition(Result::is_ok);

    if errors.len() > 0 {
        return Err(KeySplittingError::KeyPartWriteError.into());
    }

    Ok(())
}
