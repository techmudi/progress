import { httpClient } from './httpClient';

const DEVICE_NAME = 'management-dashboard';

export async function login(credentials) {
  const response = await httpClient.post('/auth/login', {
    email: credentials.email.trim(),
    password: credentials.password,
    device_name: DEVICE_NAME,
  });

  return {
    token: response.data?.token || null,
    tokenType: response.data?.token_type || 'Bearer',
    user: response.data?.user || null,
    message: response.message,
  };
}

export async function getCurrentUser(options = {}) {
  const response = await httpClient.get('/auth/me', { signal: options.signal });

  return {
    user: response.data?.user || null,
    message: response.message,
  };
}

export async function logout() {
  return httpClient.post('/auth/logout');
}
