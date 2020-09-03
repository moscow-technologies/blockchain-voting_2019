#![allow(bare_trait_objects)]
#![allow(renamed_and_removed_lints)]

pub use self::types::{
  BigUint,
  SealedBoxPublicKey,
  SealedBoxSecretKey,
  SealedBoxNonce,
};

pub use self::enums::{
  VotingState,
};

pub use self::schema::{
  CryptoSystemSettings,
  BallotConfig,
  Voting,
  Voter,
  Choices,
  EncryptedChoice,
  Ballot,
  DecryptionStatistics,
  VotingResults,
};

pub use self::transactions::{
  TxCreateVoting, TxCryptoSystemSettings, TxBallotConfig,
  TxRegisterVoters,
  TxStopRegistration,
  TxRevokeVoterParticipation,
  TxIssueBallot,
  TxAddVoterKey,
  TxStoreBallot, TxEncryptedChoice,
  TxStopVoting,
  TxPublishDecryptionKey,
  TxDecryptBallot,
  TxFinalizeVoting,
};

include!(concat!(env!("OUT_DIR"), "/protobuf_mod.rs"));

use exonum::proto::schema::*;
