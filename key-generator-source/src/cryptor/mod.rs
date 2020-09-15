use exonum_sodiumoxide::crypto::box_;
use serde::{Deserialize, Serialize};
use std::convert::TryInto;
use std::error::Error;

use crate::errors::CryptorError;

#[derive(Serialize, Deserialize)]
struct EncryptedDatum(
    Vec<u8>,
    box_::curve25519xsalsa20poly1305::Nonce,
    box_::curve25519xsalsa20poly1305::PublicKey,
);

pub fn test_cryptor(
    encryption_key: &box_::curve25519xsalsa20poly1305::PublicKey,
    decryption_key: &box_::curve25519xsalsa20poly1305::SecretKey,
) -> Result<(), Box<dyn Error>> {
    let test_datums: Vec<u32> = vec![1, 21, 302, 4003, 50004];

    let encrypted_datums: Vec<EncryptedDatum> = test_datums
        .iter()
        .map(|msg| {
            let (voter_pk, voter_sk) = box_::gen_keypair();
            let nonce = box_::gen_nonce();
            let encrypted_message =
                box_::seal(&msg.to_le_bytes(), &nonce, encryption_key, &voter_sk);
            EncryptedDatum(encrypted_message, nonce, voter_pk)
        })
        .collect();

    let decrypted_datums: Result<Vec<u32>, _> = encrypted_datums
        .iter()
        .map(|encrypted_datum| {
            let EncryptedDatum(encrypted_message, nonce, voter_pk) = encrypted_datum;

            let decrypted = box_::open(encrypted_message, nonce, voter_pk, decryption_key).unwrap();
            read_le_u32(&decrypted)
        })
        .collect();

    let decrypted_datums = decrypted_datums.or_else(|_| Err(CryptorError::DecryptionTestFailed))?;

    let decryption_check = decrypted_datums
        .iter()
        .zip(test_datums.iter())
        .fold(true, |checks, (dec, msg)| checks && (dec == msg));

    if !decryption_check {
        Err(CryptorError::DecryptionTestFailed)?
    }

    Ok(())
}

fn read_le_u32(input: &[u8]) -> Result<u32, Box<dyn Error>> {
    let u32_size = 4;
    let padding = [0; 4];

    let padded_input = [input, &padding].concat();
    let (int_bytes, _) = padded_input.split_at(u32_size);
    let int_arr: [u8; 4] = int_bytes.try_into()?;

    Ok(u32::from_le_bytes(int_arr))
}
