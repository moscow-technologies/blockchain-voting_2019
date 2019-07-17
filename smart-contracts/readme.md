# Smart contracts & javascript bindings
Contents of ./packages folder are:

- `common-deps` - just dependencies common for packages
- `crypto-lib` - library implementing encryption system based on El-Gamal
- `smart-contracts` - smart contracts code & compiled abi & binaries
- `voting-lib` - javascript bindings for smart contacts based on ethers.js

## Building
First run `npm install` to install lerna, then run `./node_modules/.bin/lerna bootstrap`
to install packages dependencies.

For compiling contracts run `npm run compile` in ./packages/smart-contracts folder.

For running tests you should have parity running with json-rpc interface enabled on port 8545.
