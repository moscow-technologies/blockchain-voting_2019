use std::error;
use std::fmt;

#[derive(Debug, Clone)]
pub enum KeySplittingError {
    KeySplittingFailed,
    PubKeyFileWriteError,
    KeyPartWriteError,
}

impl KeySplittingError {
    fn match_error(&self) -> &str {
        match *self {
            KeySplittingError::KeySplittingFailed => {
                "key splitting error: failed to split key, try to generate new one"
            }
            KeySplittingError::PubKeyFileWriteError => {
                "key splitting error: failed to write public key"
            }
            KeySplittingError::KeyPartWriteError => "key splitting error: failed to write key part",
        }
    }
}

impl fmt::Display for KeySplittingError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.match_error())
    }
}

impl error::Error for KeySplittingError {
    fn description(&self) -> &str {
        self.match_error()
    }
}
