extern crate clap;
extern crate rusty_secrets;
extern crate serde;
extern crate serde_json;

use clap::{App, Arg, SubCommand};
use std::error::Error;
use std::process;
use std::result::Result;

mod cryptor;
mod errors;
mod subcommands;

use errors::InvalidArgsError;
use subcommands::{combine_key, create_keys, encrypt, generate_cryptosystem};

fn run() -> Result<(), Box<dyn Error>> {
    let matches = App::new("Key generator app")
        .about("Generates cryptosystem")
        .subcommand(
            SubCommand::with_name("create")
                .about("create and partition key")
                .arg(
                    Arg::with_name("parts")
                        .short("p")
                        .takes_value(true)
                        .required(true)
                        .help("key parts amount"),
                )
                .arg(
                    Arg::with_name("threshold")
                        .short("t")
                        .takes_value(true)
                        .help("parts necessary to combine key"),
                )
                .arg(
                    Arg::with_name("dir")
                        .short("d")
                        .required(true)
                        .takes_value(true)
                        .help("directory to save key parts"),
                ),
        )
        .subcommand(
            SubCommand::with_name("combine")
                .about("combine private key from parts")
                .arg(
                    Arg::with_name("dir")
                        .short("d")
                        .required(true)
                        .takes_value(true)
                        .help("directory where key parts are located"),
                ),
        )
        .subcommand(
            SubCommand::with_name("generate-system")
                .about("generate cryptosystem and return to stdout"),
        )
        .subcommand(
            SubCommand::with_name("encrypt")
                .about("Encrypt file with numbers (u32)")
                .arg(
                    Arg::with_name("public-key")
                        .short("p")
                        .required(true)
                        .takes_value(true)
                        .help("public key file"),
                )
                .arg(
                    Arg::with_name("datums")
                        .short("d")
                        .required(true)
                        .takes_value(true)
                        .help("datums file (each datum on new line)"),
                ),
        )
        .get_matches();

    match matches.subcommand() {
        ("create", Some(matches)) => {
            let parts = matches.value_of("parts");
            if parts.is_none() {
                return Err(InvalidArgsError::NoPartsAmountSpecified.into());
            }
            let parts = parts.unwrap().parse::<u8>();
            if parts.is_err() {
                return Err(InvalidArgsError::IncorrectPartsValue.into());
            }
            let parts = parts.unwrap();
            if parts < 2 {
                return Err(InvalidArgsError::IncorrectPartsValue.into());
            }

            let threshold = matches.value_of("threshold").unwrap_or("0");
            let threshold = threshold.parse::<u8>();
            if threshold.is_err() {
                return Err(InvalidArgsError::IncorrectThresholdValue.into());
            }
            let mut threshold = threshold.unwrap();
            if threshold < 2 || threshold > parts {
                threshold = parts;
            }

            let dir = matches.value_of("dir");
            if dir.is_none() {
                return Err(InvalidArgsError::NoDirectorySpecified.into());
            }
            let dir = dir.unwrap();

            return create_keys(dir, parts, threshold);
        }
        ("combine", Some(matches)) => {
            let dir = matches.value_of("dir");
            if dir.is_none() {
                return Err(InvalidArgsError::NoDirectorySpecified.into());
            }
            let dir = dir.unwrap();

            return combine_key(dir);
        }
        ("generate-system", Some(_)) => {
            return generate_cryptosystem();
        }
        ("encrypt", Some(matches)) => {
            let public_key_file = matches.value_of("public-key");
            if public_key_file.is_none() {
                return Err(InvalidArgsError::PublicKeyFileUnavailable.into());
            }
            let public_key_file = public_key_file.unwrap();

            let datums_file = matches.value_of("datums");
            if datums_file.is_none() {
                return Err(InvalidArgsError::DatumsFileUnavailable.into());
            }
            let datums_file = datums_file.unwrap();

            return encrypt(public_key_file, datums_file);
        }
        _ => Err(InvalidArgsError::NoCommandSpecified.into()),
    }
}

fn main() {
    if let Err(err) = run() {
        eprintln!("Application error: {}", err);
        process::exit(1);
    }
}
