// Workaround for `failure` see https://github.com/rust-lang-nursery/failure/issues/223 and
// ECR-1771 for the details.
#![allow(bare_trait_objects)]

use exonum::blockchain::ExecutionError;

/// Error codes emitted by transactions during execution.
#[derive(Debug, Fail)]
#[repr(u8)]
pub enum Error {
    #[fail(display = "Transaction author is not authorised to perform operation")]
    AuthorNotAuthorized = 0,

    #[fail(display = "Failed to create voting")]
    FailedToCreateVoting = 1,

    #[fail(display = "Specified voting does not exist")]
    VotingDoesNotExist = 2,

    #[fail(display = "Requested operation is forbidden for current voting state")]
    ForbiddenForThisVotingState = 3,

    #[fail(display = "Participation for specified voter cannot be revoked")]
    ParticipationCannotBeRevoked = 4,

    #[fail(display = "Ballot cannot be issued")]
    BallotCannotBeIssued = 5,

    #[fail(display = "Ballot cannot be stored")]
    BallotCannotBeStored = 6,

    #[fail(display = "Decryption key is already published")]
    DecryptionKeyIsAlreadyPublished = 7,

    #[fail(display = "Decryption key is not published")]
    DecryptionKeyIsNotPublished = 8,

    #[fail(display = "Ballot cannot be decrypted")]
    BallotCannotBeDecrypted = 9,

    #[fail(display = "Incorrect private key")]
    IncorrectPrivateKey = 10,

    #[fail(display = "Decryption is not finished")]
    DecryptionIsNotFinished = 11,

    #[fail(display = "Ballot does not exist")]
    BallotDoesNotExist = 12,
}

impl From<Error> for ExecutionError {
    fn from(value: Error) -> ExecutionError {
        let description = format!("{}", value);
        ExecutionError::with_description(value as u8, description)
    }
}