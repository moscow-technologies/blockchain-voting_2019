
use std::convert::{From, Into};
use failure::Error;
use exonum_sodiumoxide::crypto::box_::curve25519xsalsa20poly1305::Nonce;

use crate::proto;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SealedBoxNonceWrapper(Nonce);

impl From<Nonce> for SealedBoxNonceWrapper {
  fn from(nonce: Nonce) -> Self {
    Self(nonce)
  }
}

impl Into<Nonce> for SealedBoxNonceWrapper {
  fn into(self) -> Nonce {
    self.0
  }
}

impl exonum::proto::ProtobufConvert for SealedBoxNonceWrapper {
  type ProtoStruct = proto::SealedBoxNonce;

  fn to_pb(&self) -> proto::SealedBoxNonce {
      let mut nonce = proto::SealedBoxNonce::new();
      nonce.set_data((self.0).0.to_vec());
      nonce
  }

  fn from_pb(pb: proto::SealedBoxNonce) -> Result<Self, Error> {
    let data = pb.get_data();
    let nonce = Nonce::from_slice(data)
      .ok_or_else(|| format_err!("Invalid nonce value"))?;

    Ok(Self::from(nonce))
  }
}
