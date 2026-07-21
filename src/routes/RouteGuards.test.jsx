import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { GuestRoute, ProtectedRoute } from './RouteGuards';
import { adminUser, internUser, renderWithProviders } from '../test/testUtils';

function GuardRoutes({ protectedElement = <div>Dashboard Page</div> }) {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><div>Login Page</div></GuestRoute>} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute roles={['admin', 'supervisor']} permissions={['dashboard.view']}>
            {protectedElement}
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}

describe('route guards', () => {
  it('redirects unauthenticated users to login', async () => {
    renderWithProviders(<GuardRoutes />, { route: '/dashboard' });

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('allows management users with dashboard permission', async () => {
    renderWithProviders(<GuardRoutes />, { route: '/dashboard', withAuth: true, user: adminUser });

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('blocks non-management users even when they have a dashboard-like permission', async () => {
    renderWithProviders(<GuardRoutes />, { route: '/dashboard', withAuth: true, user: internUser });

    expect(await screen.findByText('Access unavailable')).toBeInTheDocument();
  });

  it('moves authenticated management users away from the login page', async () => {
    renderWithProviders(<GuardRoutes />, { route: '/login', withAuth: true, user: adminUser });

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });
});
