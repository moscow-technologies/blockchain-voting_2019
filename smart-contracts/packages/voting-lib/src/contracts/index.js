const LockableTransactionAuthorizer = require('./lockableTransactionAuthorizer');

const VotersRegistry = require('./votersRegistry');
const BallotsRegistry = require('./ballotsRegistry');

const Ownable = require('./ownable');

module.exports = {
  LockableTransactionAuthorizer,

  VotersRegistry,
  BallotsRegistry,

  Ownable,
};
