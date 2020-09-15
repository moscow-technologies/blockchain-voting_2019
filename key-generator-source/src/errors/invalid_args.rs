use std::error;
use std::fmt;

#[derive(Debug, Clone)]
pub enum InvalidArgsError {
    NoCommandSpecified,
    NoDirectorySpecified,
    NoPartsAmountSpecified,
    IncorrectPartsValue,
    IncorrectThresholdValue,
    DirectoryCreationFailure,
    KeyFileCreationFailure,
    PrivateKeyDirectoryUnavailable,
    PublicKeyFileUnavailable,
    DatumsFileUnavailable,
    DatumsFileCreationFailure,
}

impl InvalidArgsError {
    fn match_error(&self) -> &str {
        match *self {
            InvalidArgsError::NoCommandSpecified =>
              "invalid arguments: specify command (use -h)",
            InvalidArgsError::NoDirectorySpecified =>
              "invalid arguments: specify keys directory",
            InvalidArgsError::NoPartsAmountSpecified =>
              "invalid arguments: specify amount of parts to split key into",
            InvalidArgsError::IncorrectPartsValue =>
              "invalid arguments: parts should be integer more than 2",
            InvalidArgsError::IncorrectThresholdValue =>
              "invalid arguments: threshold should be integer more than 2",
            InvalidArgsError::DirectoryCreationFailure => 
              "invalid arguments: failed to create keys directory - check path & your access to it",
            InvalidArgsError::KeyFileCreationFailure => 
              "invalid arguments: failed to write key file - check path to directory & your access to it",
            InvalidArgsError::PrivateKeyDirectoryUnavailable =>
              "invalid arguments: specified private key directory doesn`t exist or not accessible",
            InvalidArgsError::PublicKeyFileUnavailable =>
              "invalid arguments: specified public key file doesn`t exist or not accessible",
            InvalidArgsError::DatumsFileUnavailable =>
              "invalid arguments: specified datums file doesn`t exist or not accessible",
            InvalidArgsError::DatumsFileCreationFailure =>
              "invalid arguments: failed to create encrypted datums file - check your permissions on folder",
        }
    }
}

impl fmt::Display for InvalidArgsError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.match_error())
    }
}

impl error::Error for InvalidArgsError {
    fn description(&self) -> &str {
        self.match_error()
    }
}
