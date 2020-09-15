use std::error;
use std::fmt;

#[derive(Debug, Clone)]
pub enum CryptorError {
    DecryptionTestFailed,
}

impl CryptorError {
    fn match_error(&self) -> &str {
        match *self {
            CryptorError::DecryptionTestFailed => "cryptoe error: decryption test failed",
        }
    }
}

impl fmt::Display for CryptorError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.match_error())
    }
}

impl error::Error for CryptorError {
    fn description(&self) -> &str {
        self.match_error()
    }
}
