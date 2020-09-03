class RequestError extends Error {
  constructor(httpStatus, message) {
    super(message);

    this.httpStatus = httpStatus;
  }

  get httpStatusCode() {
    return this.httpStatus;
  }
}

module.exports = RequestError;
