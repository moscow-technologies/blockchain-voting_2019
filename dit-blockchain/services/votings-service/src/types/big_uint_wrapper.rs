
use std::convert::{From, Into};
use failure::Error;
use num_bigint::{BigUint};

use crate::proto;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BigUintWrapper(BigUint);

impl From<BigUint> for BigUintWrapper {
  fn from(num: BigUint) -> Self {
    Self(num)
  }
}

impl Into<BigUint> for BigUintWrapper {
  fn into(self) -> BigUint {
    self.0
  }
}

impl exonum::proto::ProtobufConvert for BigUintWrapper {
  type ProtoStruct = proto::BigUint;

  fn to_pb(&self) -> proto::BigUint {
      let mut biguint = proto::BigUint::new();
      biguint.set_data(self.0.to_bytes_be());
      biguint
  }

  fn from_pb(pb: proto::BigUint) -> Result<Self, Error> {
    let data = pb.get_data();
    let biguint = BigUint::from_bytes_be(data);
    Ok(Self::from(biguint))
  }
}
