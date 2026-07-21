import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { clearStoredSession, getAccessToken } from './authStorage';
import { normalizeAxiosError } from './apiError';
import { notifyUnauthorized } from './sessionEvents';

export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

function isBlobResponse(response) {
  return response.config.responseType === 'blob' || response.data instanceof Blob;
}

function normalizeSuccessResponse(response) {
  if (response.status === 204 || response.data === '') {
    return {
      data: null,
      message: null,
      meta: null,
      links: null,
      headers: response.headers,
      status: response.status,
    };
  }

  if (isBlobResponse(response)) {
    return {
      data: response.data,
      message: null,
      meta: null,
      links: null,
      headers: response.headers,
      status: response.status,
    };
  }

  const body = response.data || {};

  return {
    data: Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body,
    message: body.message || null,
    meta: body.meta || null,
    links: body.links || null,
    filters: body.filters || null,
    generatedAt: body.generated_at || null,
    report: body.report || null,
    summary: body.summary || null,
    contractVersion: body.contract_version || null,
    headers: response.headers,
    status: response.status,
  };
}

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
  paramsSerializer: {
    serialize: (params) => new URLSearchParams(cleanParams(params)).toString(),
  },
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.params) {
    config.params = cleanParams(config.params);
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => normalizeSuccessResponse(response),
  (error) => {
    const normalizedError = normalizeAxiosError(error);
    const requestUrl = error?.config?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (normalizedError.type === 'unauthenticated' && !isLoginRequest && getAccessToken()) {
      clearStoredSession();
      notifyUnauthorized(normalizedError);
    }

    return Promise.reject(normalizedError);
  },
);

export { httpClient };
