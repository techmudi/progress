import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server, API_URL } from './server';
import { clearStoredSession } from '../services/authStorage';
import { resetUnauthorizedNotification, setUnauthorizedHandler } from '../services/sessionEvents';

vi.stubEnv('VITE_API_BASE_URL', API_URL);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  setUnauthorizedHandler(null);
  resetUnauthorizedNotification();
  clearStoredSession();
  cleanup();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});
