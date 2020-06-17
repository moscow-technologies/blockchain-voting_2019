

class ContractLogicError extends Error {
  constructor(code, message) {
    super(message);

    this.errorCode = code;
  }

  get code() {
    return this.errorCode;
  }
}

class RequestError extends Error {
  constructor(httpStatus, message) {
    super(message);

    this.httpStatus = httpStatus;
  }

  get httpStatusCode() {
    return this.httpStatus;
  }
}

module.exports = {
  ContractLogicError,
  RequestError,
};
