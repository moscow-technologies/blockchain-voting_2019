use exonum::blockchain::Service;
use exonum::crypto::PublicKey;
use exonum::helpers::fabric::{
    self, keys, Argument, Command, CommandExtension, CommandName, Context, ServiceFactory,
};
use exonum::node::NodeConfig;

use toml;

use std::collections::{BTreeMap};
use std::path::PathBuf;

use crate::{
    config::ServiceConfig,
    service::{SERVICE_NAME, VotingsService},
};

mod args;

use args::{NamedArgumentRequired, TypedArgument};

const API_PUBLIC_KEY: NamedArgumentRequired<String> = NamedArgumentRequired {
    name: "api_public_key",
    short_key: None,
    long_key: "api-public-key",
    help: "API public key.",
    default: None,
};

struct GenerateCommonConfig;

impl CommandExtension for GenerateCommonConfig {
    fn args(&self) -> Vec<Argument> {
        vec![
            API_PUBLIC_KEY.to_argument(),
        ]
    }

    fn execute(&self, mut context: Context) -> Result<Context, failure::Error> {
        let mut values: BTreeMap<String, toml::Value> = context
            .get(keys::SERVICES_CONFIG)
            .expect("Expected services_config in context.");

        let api_public_key = API_PUBLIC_KEY.input_value(&context)?;
        let api_public_key_hex = hex::decode(api_public_key).unwrap();
        let api_public_key = PublicKey::from_slice(api_public_key_hex.as_slice()).unwrap();

        values.extend(
            vec![
                (
                    "api_public_key".to_owned(),
                    toml::Value::try_from(api_public_key)?,
                ),
            ]
            .into_iter(),
        );

        context.set(keys::SERVICES_CONFIG, values);
        Ok(context)
    }
}

struct GenerateNodeConfig;

impl CommandExtension for GenerateNodeConfig {
    fn args(&self) -> Vec<Argument> {
        vec![]
    }

    fn execute(&self, mut context: Context) -> Result<Context, failure::Error> {
        let services_public_config: BTreeMap<String, toml::Value> = context
            .get(keys::SERVICES_PUBLIC_CONFIGS)
            .unwrap_or_default();

        context.set(keys::SERVICES_PUBLIC_CONFIGS, services_public_config);
        Ok(context)
    }
}

struct Finalize;

impl CommandExtension for Finalize {
    fn args(&self) -> Vec<Argument> {
        vec![]
    }

    fn execute(&self, mut context: Context) -> Result<Context, failure::Error> {
        let mut node_config: NodeConfig<PathBuf> = context.get(keys::NODE_CONFIG)?;
        let common_config = context.get(keys::COMMON_CONFIG)?;

        // Public part.
        let api_public_key = API_PUBLIC_KEY.output_value(&common_config.services_config)?;
        let api_public_key_hex = hex::decode(api_public_key).unwrap();
        let api_public_key = PublicKey::from_slice(api_public_key_hex.as_slice()).unwrap();

        // Creates global configuration.
        let  global_config = ServiceConfig::with_keys(vec![api_public_key]);

        node_config.services_configs.insert(
            SERVICE_NAME.to_owned(),
            toml::Value::try_from(global_config)?,
        );
    
        context.set(keys::NODE_CONFIG, node_config);
        Ok(context)
    }
}

#[derive(Debug, Copy, Clone)]
pub struct VotingsServiceFactory;

impl ServiceFactory for VotingsServiceFactory {
    fn service_name(&self) -> &str {
        SERVICE_NAME
    }

    fn command(&mut self, command: CommandName) -> Option<Box<dyn CommandExtension>> {
        Some(match command {
            v if v == fabric::GenerateCommonConfig.name() => Box::new(GenerateCommonConfig),
            v if v == fabric::GenerateNodeConfig.name() => Box::new(GenerateNodeConfig),
            v if v == fabric::Finalize.name() => Box::new(Finalize),
            _ => return None,
        })
    }

    fn make_service(&mut self, context: &Context) -> Box<dyn Service> {
        let node_config = context.get(keys::NODE_CONFIG).unwrap();
        let global_config: ServiceConfig = node_config
            .services_configs
            .get(SERVICE_NAME)
            .expect("Alias service config not found")
            .clone()
            .try_into()
            .unwrap();

        let service = VotingsService::new(global_config);
        Box::new(service)
    }
}