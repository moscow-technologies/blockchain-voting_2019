use std::error;
use std::fmt;

#[derive(Debug, Clone)]
pub enum KeyCombiningError {
    KeyPartsReadingFailure,
    KeyPartsParsingFailure,
    KeyRecoveryFailed,
    CryptorRecreationFailed,
}

impl KeyCombiningError {
    fn match_error(&self) -> &str {
        match *self {
            KeyCombiningError::KeyPartsReadingFailure => {
                "key combining error: failed to read key parts files"
            }
            KeyCombiningError::KeyPartsParsingFailure => {
                "key combining error: failed to parse key parts files"
            }
            KeyCombiningError::KeyRecoveryFailed => "key combining error: failed to recover key",
            KeyCombiningError::CryptorRecreationFailed => {
                "key combining error: failed to recreate cryptor"
            }
        }
    }
}

impl fmt::Display for KeyCombiningError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.match_error())
    }
}

impl error::Error for KeyCombiningError {
    fn description(&self) -> &str {
        self.match_error()
    }
}
