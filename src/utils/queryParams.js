export function cleanQueryParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export function boolParam(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

export function omitBlankFields(payload = {}) {
  return cleanQueryParams(payload);
}
