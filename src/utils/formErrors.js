export function firstFieldError(errors, field) {
  const value = errors?.[field];

  if (Array.isArray(value)) return value[0] || '';
  if (typeof value === 'string') return value;

  return '';
}

export function hasFieldError(errors, field) {
  return Boolean(firstFieldError(errors, field));
}

export function validationSummary(errors = {}) {
  const messages = Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean);

  if (messages.length === 0) return '';
  if (messages.length === 1) return messages[0];

  return `${messages[0]} (${messages.length} validation issues found.)`;
}

export function fieldsFromApiError(error) {
  return error?.type === 'validation' ? error.errors || {} : {};
}

export function generalMessageFromApiError(error, fallback = 'The request could not be completed.') {
  if (error?.type === 'validation') {
    return validationSummary(error.errors) || error.message || fallback;
  }

  return error?.message || fallback;
}
