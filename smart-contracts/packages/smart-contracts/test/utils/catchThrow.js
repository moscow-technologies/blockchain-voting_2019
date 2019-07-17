// https://ethereum.stackexchange.com/a/48629/8662

module.exports = async function tryCatch(promise, message = 'error') {
  try {
    await promise;
    throw new Error('Should not throw!');
  } catch (error) {
    const isFound = error.message.search(message) >= 0 || error.message.search('error') >= 0;
    assert.isTrue(
      isFound,
      `Expected an error have '${message}' but got '${error.message}' instead!`,
    );
  }
};
