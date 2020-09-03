use exonum::helpers::fabric::NodeBuilder;
use dit_votings_service;

fn main() {
    exonum::crypto::init();
    exonum::helpers::init_logger().unwrap();

    println!("Starting DIT voting node");

    NodeBuilder::new()
        .with_service(Box::new(dit_votings_service::factory::VotingsServiceFactory))
        .run();
}
