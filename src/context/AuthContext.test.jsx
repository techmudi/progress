import { StrictMode, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Button } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { AuthProvider, useAuth } from './AuthContext';
import { getAccessToken, getStoredUser } from '../services/authStorage';
import { API_URL, server } from '../test/server';
import { adminUser, mockCurrentUser, renderWithProviders, storeSession } from '../test/testUtils';

function AuthProbe() {
  const auth = useAuth();
  const [error, setError] = useState('');

  return (
    <div>
      <div data-testid="status">
        {auth.isRestoringSession ? 'restoring' : auth.isAuthenticated ? auth.user.name : 'signed out'}
      </div>
      <button
        type="button"
        onClick={() => auth.login({ email: ' ada@example.test ', password: 'secret' }).catch((caught) => setError(caught.message))}
      >
        Login
      </button>
      <Button onClick={auth.logout}>Logout</Button>
      {error && <div role="alert">{error}</div>}
    </div>
  );
}

describe('AuthProvider', () => {
  it('logs in successfully, stores the token, and exposes the authenticated user', async () => {
    let loginBody = null;

    server.use(
      http.post(`${API_URL}/auth/login`, async ({ request }) => {
        loginBody = await request.json();

        return HttpResponse.json({
          success: true,
          message: 'Authenticated successfully.',
          data: {
            token: 'new-token',
            token_type: 'Bearer',
            user: adminUser,
          },
        });
      }),
    );

    renderWithProviders(<AuthProbe />);

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signed out'));
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Ada Manager')).toBeInTheDocument();
    expect(loginBody).toEqual({
      email: 'ada@example.test',
      password: 'secret',
      device_name: 'management-dashboard',
    });
    expect(getAccessToken()).toBe('new-token');
    expect(getStoredUser()).toMatchObject({ id: adminUser.id, name: adminUser.name });
  });

  it('restores a valid session from local storage', async () => {
    const freshUser = { ...adminUser, name: 'Fresh Manager' };
    storeSession({ ...adminUser, name: 'Cached Manager' });
    mockCurrentUser(freshUser);

    renderWithProviders(<AuthProbe />);

    expect(await screen.findByText('Fresh Manager')).toBeInTheDocument();
    expect(getStoredUser()).toMatchObject({ name: 'Fresh Manager' });
  });

  it('finishes session restore when React StrictMode remounts effects in development', async () => {
    const freshUser = { ...adminUser, name: 'Strict Manager' };
    storeSession({ ...adminUser, name: 'Cached Manager' });

    server.use(
      http.get(`${API_URL}/auth/me`, async () => {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 25);
        });

        return HttpResponse.json({
          success: true,
          message: 'Current user fetched successfully.',
          data: { user: freshUser },
        });
      }),
    );

    render(
      <StrictMode>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </StrictMode>,
    );

    expect(await screen.findByText('Strict Manager')).toBeInTheDocument();
    expect(getStoredUser()).toMatchObject({ name: 'Strict Manager' });
  });

  it('clears storage when session restore receives a 401', async () => {
    storeSession(adminUser, 'expired-token');
    server.use(
      http.get(`${API_URL}/auth/me`, () => HttpResponse.json({
        success: false,
        message: 'Unauthenticated.',
      }, { status: 401 })),
    );

    renderWithProviders(<AuthProbe />);

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signed out'));
    expect(getAccessToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('logs out remotely and clears the local session', async () => {
    let logoutCalled = false;
    storeSession(adminUser);
    mockCurrentUser(adminUser);
    server.use(
      http.post(`${API_URL}/auth/logout`, () => {
        logoutCalled = true;
        return HttpResponse.json({ success: true, message: 'Logged out.' });
      }),
    );

    renderWithProviders(<AuthProbe />);

    expect(await screen.findByText('Ada Manager')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signed out'));
    expect(logoutCalled).toBe(true);
    expect(getAccessToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
