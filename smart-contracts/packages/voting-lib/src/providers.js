const {
  providers: { JsonRpcProvider, IpcProvider },
} = require('ethers');

const newIpcProvider = path => new IpcProvider(path);

const newJsonRpcProvider = path => new JsonRpcProvider(path);

module.exports = {
  newIpcProvider,
  newJsonRpcProvider,
};
