/**
 * DomainError
 *
 * Custom error class to extend with specific codes and messages
 *
 * Shamelessly stolen from https://rclayton.silvrback.com/custom-errors-in-node-js
 * All kudos to the author: Richard Clayton
 */
class DomainError extends Error {
  constructor(msg, status) {
    super(msg);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    this.status = status;
    this.detial = msg;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    // Ssee Node.js reference.
    Error.captureStackTrace(this, this.constructor);
  }
}

class InternalServerError extends DomainError {
  constructor(msg) {
    super(msg, 500);
  }
}
class BadGateway extends DomainError {
  constructor(msg) {
    super(msg, 502);
  }
}

class ResourceNotFoundError extends DomainError {
  constructor(msg) {
    super(msg, 404);
  }
}

class BadRequestError extends DomainError {
  constructor(msg) {
    super(msg, 400);
  }
}

class UnauthorizedError extends DomainError {
  constructor(msg) {
    super(msg, 401);
  }
}

class ValidationError extends DomainError {
  constructor(msg) {
    super(msg, 422);
  }
}

const throwCustomDomainError = statusCode => {
  switch (statusCode) {
    case 400:
      throw new BadRequestError(
        'The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).'
      );

    case 401:
      throw new UnauthorizedError(
        'The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).'
      );

    case 404:
      throw new ResourceNotFoundError(
        'The origin server did not find a current representation for the target resource or is not willing to disclose that one exists.'
      );

    case 422:
      throw new ValidationError(
        'The server understands the content type of the request entity, and the syntax of the request entity is correct but was unable to process the contained instructions.'
      );

    case 502:
      throw new BadGateway(
        'The server was acting as a gateway or proxy and received an invalid response from the upstream server.'
      );

    default:
      throw new InternalServerError(
        'The server encountered an unexpected condition that prevented it from fulfilling the request.'
      );
  }
};

module.exports = {
  throwCustomDomainError,
  domainErrors: {
    InternalServerError,
    ValidationError,
    ResourceNotFoundError,
  },
};
