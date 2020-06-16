
use exonum::{
    blockchain::{ExecutionResult, Transaction, TransactionContext},
};
use exonum_sodiumoxide::crypto::box_;
use hex;

use crate::{
    errors::Error,
    schema::{
      ServiceData,
      Voting,
    },
    enums::VotingState,
    types::{
      SealedBoxSecretKeyWrapper,
    },
    proto,
    util::read_le_u32,
};

#[derive(Serialize, Deserialize, Clone, Debug, ProtobufConvert)]
#[exonum(pb = "proto::TxPublishDecryptionKey")]
pub struct TxPublishDecryptionKey {
  pub voting_id: String,
  pub private_key: SealedBoxSecretKeyWrapper,
  pub seed: u64,
}

struct EncryptedDatum (
  Vec<u8>,
  box_::curve25519xsalsa20poly1305::Nonce,
  box_::curve25519xsalsa20poly1305::PublicKey
);

impl Transaction for TxPublishDecryptionKey {
    fn execute(&self, context: TransactionContext) -> ExecutionResult {
        let author = context.author();

        let service_data = ServiceData::instantiate(context.fork());
        let api_public_keys = service_data.get_actual_configuration().api_public_keys();

        if !api_public_keys.contains(&author) {
          Err(Error::AuthorNotAuthorized)?
        }

        let mut voting = Voting::get(context.fork(), self.voting_id.clone())
          .ok_or_else(|| Error::VotingDoesNotExist)?;

        if voting.get_state() != VotingState::Stopped {
          Err(Error::ForbiddenForThisVotingState)?
        }

        let cryptosystem_settings = voting.get_crypto_system_settings();
        if cryptosystem_settings.private_key.is_some() {
          Err(Error::DecryptionKeyIsAlreadyPublished)?;
        }

        let encryption_key = cryptosystem_settings.public_key.clone();
        let decryption_key: box_::curve25519xsalsa20poly1305::SecretKey = self.private_key.clone().into();
        println!("Decryption key: {}", hex::encode(&decryption_key.0));

        test_decryption_key(&encryption_key, &decryption_key)?;

        voting.publish_private_key(decryption_key);

        println!("Decryption key published for voting {}", self.voting_id);
        Ok(())
    }
}


fn test_decryption_key(
  encryption_key: &box_::curve25519xsalsa20poly1305::PublicKey,
  decryption_key: &box_::curve25519xsalsa20poly1305::SecretKey,
) -> Result<(), Error> {
  let test_datums: Vec<u32> = vec![1, 2, 3, 4, 5];

  let encrypted_datums: Vec<EncryptedDatum> = test_datums.iter()
    .map(|msg| {
      let (voter_pk, voter_sk) = box_::gen_keypair();
      let nonce = box_::gen_nonce();
      let encrypted_message = box_::seal(&msg.to_le_bytes(), &nonce, encryption_key, &voter_sk);
      EncryptedDatum(encrypted_message, nonce, voter_pk)
    })
    .collect();

  let decrypted_datums: Result<Vec<u32>, _> = encrypted_datums.iter()
    .map(|encrypted_datum| {
      let EncryptedDatum(encrypted_message, nonce, voter_pk) = encrypted_datum;
    
      let decrypted = box_::open(encrypted_message, nonce, voter_pk, decryption_key).unwrap();
      read_le_u32(&decrypted)
    })
    .collect();

  let decrypted_datums = decrypted_datums
    .or_else(|_| Err(Error::IncorrectPrivateKey))?;

  let decryption_check = decrypted_datums.iter().zip(test_datums.iter())
    .fold(true, |checks, (dec, msg)| {
      checks && (dec == msg)
    });

  if !decryption_check {
    Err(Error::IncorrectPrivateKey)?
  }

  Ok(())
}
