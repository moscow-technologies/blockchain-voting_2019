
use std::convert::{From, Into};
use failure::Error;
use exonum_sodiumoxide::crypto::box_::curve25519xsalsa20poly1305::SecretKey;

use crate::proto;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SealedBoxSecretKeyWrapper(SecretKey);

impl From<SecretKey> for SealedBoxSecretKeyWrapper {
  fn from(sk: SecretKey) -> Self {
    Self(sk)
  }
}

impl Into<SecretKey> for SealedBoxSecretKeyWrapper {
  fn into(self) -> SecretKey {
    self.0
  }
}

impl exonum::proto::ProtobufConvert for SealedBoxSecretKeyWrapper {
  type ProtoStruct = proto::SealedBoxSecretKey;

  fn to_pb(&self) -> proto::SealedBoxSecretKey {
      let mut sk = proto::SealedBoxSecretKey::new();
      sk.set_data((self.0).0.to_vec());
      sk
  }

  fn from_pb(pb: proto::SealedBoxSecretKey) -> Result<Self, Error> {
    let data = pb.get_data();
    let sk = SecretKey::from_slice(data)
      .ok_or_else(|| format_err!("Invalid secret key"))?;

    Ok(Self::from(sk))
  }
}
