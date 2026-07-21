import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { httpClient } from './httpClient';
import { normalizeAxiosError } from './apiError';
import { getAccessToken, setAccessToken, setStoredUser } from './authStorage';
import { resetUnauthorizedNotification, setUnauthorizedHandler } from './sessionEvents';
import { API_URL, server } from '../test/server';
import { adminUser } from '../test/testUtils';

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const filePath = path.join(dir, entry);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      if (entry === 'test') return [];
      return sourceFiles(filePath);
    }

    if (!/\.(js|jsx|ts|tsx)$/.test(entry)) return [];
    return [filePath];
  });
}

describe('httpClient', () => {
  it('adds the bearer token, cleans empty params, and normalizes paginated responses', async () => {
    setAccessToken('secret-token');
    let requestDetails = null;

    server.use(
      http.get(`${API_URL}/tasks`, ({ request }) => {
        const url = new URL(request.url);
        requestDetails = {
          authorization: request.headers.get('authorization'),
          params: url.searchParams,
        };

        return HttpResponse.json({
          success: true,
          message: 'Tasks fetched successfully.',
          data: [{ id: 1, title: 'Write update' }],
          meta: { total: 1 },
          links: { next: null },
        });
      }),
    );

    const response = await httpClient.get('/tasks', {
      params: {
        status: 'active',
        search: '',
        project_id: null,
        assignee_id: undefined,
      },
    });

    expect(requestDetails.authorization).toBe('Bearer secret-token');
    expect(requestDetails.params.get('status')).toBe('active');
    expect(requestDetails.params.has('search')).toBe(false);
    expect(requestDetails.params.has('project_id')).toBe(false);
    expect(response.data).toEqual([{ id: 1, title: 'Write update' }]);
    expect(response.meta).toEqual({ total: 1 });
    expect(response.links).toEqual({ next: null });
    expect(response.message).toBe('Tasks fetched successfully.');
  });

  it('clears stored auth and notifies once after a non-login 401', async () => {
    setAccessToken('expired-token');
    setStoredUser(adminUser);
    let unauthorizedCount = 0;
    setUnauthorizedHandler(() => {
      unauthorizedCount += 1;
    });

    server.use(
      http.get(`${API_URL}/auth/me`, () => HttpResponse.json({
        success: false,
        message: 'Unauthenticated.',
      }, { status: 401 })),
    );

    await expect(httpClient.get('/auth/me')).rejects.toMatchObject({
      type: 'unauthenticated',
      status: 401,
      message: 'Unauthenticated.',
    });
    await expect(httpClient.get('/auth/me')).rejects.toMatchObject({ type: 'unauthenticated' });

    expect(getAccessToken()).toBeNull();
    expect(unauthorizedCount).toBe(1);
    resetUnauthorizedNotification();
  });

  it('does not clear the token after a 403', async () => {
    setAccessToken('still-valid');

    server.use(
      http.get(`${API_URL}/reports/project-progress`, () => HttpResponse.json({
        success: false,
        message: 'This token cannot read reports.',
      }, { status: 403 })),
    );

    await expect(httpClient.get('/reports/project-progress')).rejects.toMatchObject({
      type: 'forbidden',
      status: 403,
      message: 'This token cannot read reports.',
    });
    expect(getAccessToken()).toBe('still-valid');
  });

  it('normalizes 409 and 422 backend errors with messages and field errors', async () => {
    server.use(
      http.post(`${API_URL}/tasks/1/status`, () => HttpResponse.json({
        success: false,
        message: 'The request conflicts with the current workflow state.',
      }, { status: 409 })),
      http.post(`${API_URL}/auth/login`, () => HttpResponse.json({
        success: false,
        message: 'The given data was invalid.',
        errors: { email: ['The email field is required.'] },
      }, { status: 422 })),
    );

    await expect(httpClient.post('/tasks/1/status')).rejects.toMatchObject({
      type: 'conflict',
      status: 409,
    });
    await expect(httpClient.post('/auth/login')).rejects.toMatchObject({
      type: 'validation',
      status: 422,
      errors: { email: ['The email field is required.'] },
    });
  });

  it('normalizes network failures and timeout errors', async () => {
    server.use(
      http.get(`${API_URL}/network-down`, () => HttpResponse.error()),
    );

    await expect(httpClient.get('/network-down')).rejects.toMatchObject({
      type: 'network',
    });

    expect(normalizeAxiosError({ code: 'ECONNABORTED' })).toMatchObject({
      type: 'timeout',
      message: 'The server took too long to respond. Please try again.',
    });
  });

  it('keeps direct axios imports inside the shared HTTP service only', () => {
    const testFile = fileURLToPath(import.meta.url);
    const srcDir = path.resolve(path.dirname(testFile), '..');
    const allowedFile = path.resolve(srcDir, 'services/httpClient.js');
    const offenders = sourceFiles(srcDir)
      .filter((filePath) => path.resolve(filePath) !== allowedFile)
      .filter((filePath) => /from ['"]axios['"]|require\(['"]axios['"]\)|axios\./.test(readFileSync(filePath, 'utf8')))
      .map((filePath) => path.relative(srcDir, filePath));

    expect(offenders).toEqual([]);
  });
});
