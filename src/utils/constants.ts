export const BASE_URL = '/api/users';

export const PORT = process.env.PORT || 4000;

export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  NOT_SUPPORTED = 501,
}

export enum ErrorMessages {
  UNSUPPORTED_METHOD = 'HTTP method is not supported',
  SERVER_ERROR = 'Internal Server Error',
}
