module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      accounts: 10,
    },
    coverage: {
      host: '127.0.0.1',
      port: 8555,
      network_id: '*',
      gas: 0xfffffffffff,
      gasPrice: 0x01,
      accounts: 10,
    },
  },
  mocha: {
    timeout: 90000,
    slow: 10000,
  },
  compilers: {
    solc: {
      version: '0.5.4',
      docker: true,
      settings: {
        optimizer: {
          enabled: false,
          runs: 20000,
        },
        evmVersion: 'byzantium',
      },
    },
  },
};
