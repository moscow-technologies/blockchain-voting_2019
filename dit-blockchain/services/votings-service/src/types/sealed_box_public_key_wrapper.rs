
use std::convert::{From, Into};
use failure::Error;
use exonum_sodiumoxide::crypto::box_::curve25519xsalsa20poly1305::PublicKey;

use crate::proto;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SealedBoxPublicKeyWrapper(PublicKey);

impl From<PublicKey> for SealedBoxPublicKeyWrapper {
  fn from(pk: PublicKey) -> Self {
    Self(pk)
  }
}

impl Into<PublicKey> for SealedBoxPublicKeyWrapper {
  fn into(self) -> PublicKey {
    self.0
  }
}

impl exonum::proto::ProtobufConvert for SealedBoxPublicKeyWrapper {
  type ProtoStruct = proto::SealedBoxPublicKey;

  fn to_pb(&self) -> proto::SealedBoxPublicKey {
      let mut pk = proto::SealedBoxPublicKey::new();
      pk.set_data((self.0).0.to_vec());
      pk
  }

  fn from_pb(pb: proto::SealedBoxPublicKey) -> Result<Self, Error> {
    let data = pb.get_data();
    let pk = PublicKey::from_slice(data)
      .ok_or_else(|| format_err!("Invalid public key"))?;
  
    Ok(Self::from(pk))
  }
}
