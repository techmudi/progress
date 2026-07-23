function normalizeApiBaseUrl(value) {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    throw new Error('Missing VITE_API_BASE_URL. Set it to the Laravel API , for example http://progress.test/api/v1.');
  }

  return trimmed.replace(/\/+$/, '');
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);
export { normalizeApiBaseUrl };
