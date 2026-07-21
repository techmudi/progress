export class ApiError extends Error {
  constructor({ status = null, message, errors = null, type = 'unknown', requestId = null, cause = null } = {}) {
    super(message || 'Something went wrong.');
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.type = type;
    this.requestId = requestId;
    this.cause = cause;
  }
}

const STATUS_TYPE = {
  401: 'unauthenticated',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'validation',
  429: 'rate_limited',
};

const STATUS_MESSAGE = {
  401: 'Your session has expired. Please sign in again.',
  403: 'You are not allowed to perform this action.',
  404: 'The requested resource could not be found.',
  409: 'The request conflicts with the current workflow state.',
  422: 'Please correct the highlighted fields.',
  429: 'Too many attempts. Please try again shortly.',
};

function requestIdFromHeaders(headers = {}) {
  return headers['x-request-id'] || headers['X-Request-ID'] || null;
}

export function errorTypeFromStatus(status) {
  if (STATUS_TYPE[status]) return STATUS_TYPE[status];
  if (status >= 500) return 'server';
  return 'unknown';
}

export function normalizeAxiosError(error) {
  if (error?.code === 'ERR_CANCELED') {
    return new ApiError({
      type: 'cancelled',
      message: 'The request was cancelled.',
      cause: error,
    });
  }

  if (error?.code === 'ECONNABORTED') {
    return new ApiError({
      type: 'timeout',
      message: 'The server took too long to respond. Please try again.',
      cause: error,
    });
  }

  const response = error?.response;

  if (!response) {
    return new ApiError({
      type: 'network',
      message: 'Unable to reach the server. Check your connection and try again.',
      cause: error,
    });
  }

  const status = response.status;
  const body = response.data && typeof response.data === 'object' ? response.data : {};
  const backendMessage = typeof body.message === 'string' ? body.message : null;
  const message = backendMessage || STATUS_MESSAGE[status] || 'The request could not be completed.';

  return new ApiError({
    status,
    message,
    errors: body.errors || null,
    type: errorTypeFromStatus(status),
    requestId: requestIdFromHeaders(response.headers),
    cause: error,
  });
}
