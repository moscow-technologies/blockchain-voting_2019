
use protobuf::ProtobufEnum;
use failure::Error;
use serde_repr::{Serialize_repr, Deserialize_repr};

use crate::proto;

#[derive(Serialize_repr, Deserialize_repr, Clone, Debug, PartialEq, PartialOrd)]
#[repr(u8)]
pub enum VotingState {
  Registration,
  InProcess,
  Stopped,
  Finished,
}

impl exonum::proto::ProtobufConvert for VotingState {
    type ProtoStruct = proto::VotingState;

    fn to_pb(&self) -> proto::VotingState {
        proto::VotingState::from_i32(self.clone() as i32).unwrap()
    }

    fn from_pb(pb: proto::VotingState) -> Result<Self, Error> {
        match pb.value() {
            0 => Ok(VotingState::Registration),
            1 => Ok(VotingState::InProcess),
            2 => Ok(VotingState::Stopped),
            3 => Ok(VotingState::Finished),
            _ => Err(format_err!("Illegal VotingState enum value"))
        }
    }
}
