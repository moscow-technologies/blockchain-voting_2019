use exonum::helpers::fabric::{Argument, Context};

use failure::format_err;
use hex::{FromHex, FromHexError};
use serde;
use serde::de::DeserializeOwned;
use serde_derive::{Deserialize, Serialize};
use toml;

use std::collections::BTreeMap;
use std::str::FromStr;

use exonum::crypto;

#[derive(Clone, Serialize, Deserialize)]
pub struct Hash(pub crypto::Hash);

impl FromStr for Hash {
    type Err = FromHexError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        crypto::Hash::from_hex(s).map(Hash)
    }
}

pub trait TypedArgument {
    type ParsedType: FromStr;
    type OutputType: serde::Serialize + DeserializeOwned + Clone + Send + Sync;

    fn name(&self) -> String;

    fn to_argument(&self) -> Argument;

    fn input_value(&self, context: &Context) -> Result<Self::OutputType, failure::Error>;

    fn input_value_to_toml(
        &self,
        context: &Context,
    ) -> Result<(String, toml::Value), failure::Error> {
        let value = toml::Value::try_from(self.input_value(context)?)?;
        Ok((self.name(), value))
    }

    fn output_value(
        &self,
        values: &BTreeMap<String, toml::Value>,
    ) -> Result<Self::OutputType, failure::Error>;
}

#[derive(Debug)]
pub struct NamedArgumentRequired<T>
where
    T: FromStr + serde::Serialize + DeserializeOwned + Clone + Send + Sync,
    <T as FromStr>::Err: ::std::error::Error + Send + Sync + 'static,
{
    pub name: &'static str,
    pub short_key: Option<&'static str>,
    pub long_key: &'static str,
    pub help: &'static str,
    pub default: Option<T>,
}

impl<T> TypedArgument for NamedArgumentRequired<T>
where
    T: FromStr + serde::Serialize + DeserializeOwned + Clone + Send + Sync,
    <T as FromStr>::Err: ::std::error::Error + Send + Sync + 'static,
{
    type ParsedType = T;
    type OutputType = T;

    fn name(&self) -> String {
        self.name.to_owned()
    }

    fn to_argument(&self) -> Argument {
        Argument::new_named(
            self.name,
            self.default.is_none(),
            self.help,
            self.short_key,
            self.long_key,
            false,
        )
    }

    fn input_value(&self, context: &Context) -> Result<Self::OutputType, failure::Error> {
        context
            .arg::<Self::ParsedType>(self.name)
            .ok()
            .or_else(|| self.default.clone())
            .ok_or_else(|| format_err!("Expected proper `{}` in arguments", self.long_key))
    }

    fn output_value(
        &self,
        values: &BTreeMap<String, toml::Value>,
    ) -> Result<Self::OutputType, failure::Error> {
        values
            .get(self.name)
            .ok_or_else(|| format_err!("Expected `{}` config file", self.name))?
            .clone()
            .try_into()
            .map_err(From::from)
    }
}
