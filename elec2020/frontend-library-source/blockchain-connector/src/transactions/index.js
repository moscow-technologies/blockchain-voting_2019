const createVoting = require('./createVoting');
const registerVoters = require('./registerVoters');
const stopRegistration = require('./stopRegistration');
const revokeVoterParticipation = require('./revokeVoterParticipation');
const issueBallot = require('./issueBallot');
const addVoterKey = require('./addVoterKey');
const storeBallot = require('./storeBallot');
const stopVoting = require('./stopVoting');
const publishDecryptionKey = require('./publishDecryptionKey');
const decryptBallot = require('./decryptBallot');
const finalizeVoting = require('./finalizeVoting');

module.exports = {
  createVoting,
  registerVoters,
  stopRegistration,
  revokeVoterParticipation,
  issueBallot,
  addVoterKey,
  storeBallot,
  stopVoting,
  publishDecryptionKey,
  decryptBallot,
  finalizeVoting,
};
