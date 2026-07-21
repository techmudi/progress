import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Login from './Login';
import { API_URL, server } from '../../test/server';
import { adminUser, internUser, renderWithProviders } from '../../test/testUtils';

function LoginRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<div>Dashboard Target</div>} />
      <Route path="/access-unavailable" element={<div>Access Target</div>} />
    </Routes>
  );
}

describe('Login', () => {
  it('posts credentials with device_name and routes management users to the dashboard', async () => {
    let loginBody = null;
    server.use(
      http.post(`${API_URL}/auth/login`, async ({ request }) => {
        loginBody = await request.json();

        return HttpResponse.json({
          success: true,
          message: 'Authenticated successfully.',
          data: {
            token: 'admin-token',
            token_type: 'Bearer',
            user: adminUser,
          },
        });
      }),
    );

    renderWithProviders(<LoginRoutes />, { route: '/login' });

    await userEvent.type(screen.getByLabelText(/email/i), '  ada@example.test ');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Dashboard Target')).toBeInTheDocument();
    expect(loginBody).toEqual({
      email: 'ada@example.test',
      password: 'secret',
      device_name: 'management-dashboard',
    });
  });

  it('routes authenticated non-management users to the access-unavailable page', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () => HttpResponse.json({
        success: true,
        message: 'Authenticated successfully.',
        data: {
          token: 'intern-token',
          token_type: 'Bearer',
          user: internUser,
        },
      })),
    );

    renderWithProviders(<LoginRoutes />, { route: '/login' });

    await userEvent.type(screen.getByLabelText(/email/i), 'ivy@example.test');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Access Target')).toBeInTheDocument();
  });

  it('renders field errors for backend validation failures', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () => HttpResponse.json({
        success: false,
        message: 'The given data was invalid.',
        errors: {
          email: ['The email field is required.'],
          password: ['The password field is required.'],
        },
      }, { status: 422 })),
    );

    renderWithProviders(<LoginRoutes />, { route: '/login' });

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('The email field is required.')).toBeInTheDocument();
    expect(screen.getByText('The password field is required.')).toBeInTheDocument();
  });

  it('renders credential failures as a general error', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () => HttpResponse.json({
        success: false,
        message: 'The provided credentials are incorrect.',
        errors: {
          email: ['The provided credentials are incorrect.'],
        },
      }, { status: 422 })),
    );

    renderWithProviders(<LoginRoutes />, { route: '/login' });

    await userEvent.type(screen.getByLabelText(/email/i), 'ada@example.test');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The provided credentials are incorrect.');
    expect(screen.queryByText('The provided credentials are incorrect.', { selector: '.MuiFormHelperText-root' })).not.toBeInTheDocument();
  });
});
