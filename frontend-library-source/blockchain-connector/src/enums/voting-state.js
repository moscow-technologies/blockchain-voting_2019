/**
 * VotingState enum
 * @readonly
 * @enum {number}
 */
const VotingState = {
  Registration: 0,
  InProcess: 1,
  Stopped: 2,
  Finished: 3,
};

module.exports = Object.freeze(VotingState);
