import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Navbar from './Navbar';
import { getAccessToken } from '../../services/authStorage';
import { API_URL, server } from '../../test/server';
import { adminUser, renderWithProviders } from '../../test/testUtils';

function NavbarRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navbar />} />
      <Route path="/login" element={<div>Login Target</div>} />
    </Routes>
  );
}

describe('Navbar', () => {
  it('shows the signed-in user, removes notifications, and logs out from the account menu', async () => {
    let logoutCalled = false;
    server.use(
      http.post(`${API_URL}/auth/logout`, () => {
        logoutCalled = true;
        return HttpResponse.json({ success: true, message: 'Logged out.' });
      }),
    );

    renderWithProviders(<NavbarRoutes />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('Ada Manager')).toBeInTheDocument();
    expect(screen.queryByLabelText(/notification/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/open account menu/i));
    await userEvent.click(screen.getByRole('menuitem', { name: /logout/i }));

    expect(await screen.findByText('Login Target')).toBeInTheDocument();
    await waitFor(() => expect(logoutCalled).toBe(true));
    expect(getAccessToken()).toBeNull();
  });
});
