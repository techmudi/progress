import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { render } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { authStorageKeys } from '../services/authStorage';
import { API_URL, server } from './server';

export const adminUser = {
  id: 1,
  name: 'Ada Manager',
  email: 'ada@example.test',
  roles: ['admin'],
  permissions: [
    'dashboard.view',
    'reports.view',
    'users.view',
    'users.create',
    'users.update',
    'users.deactivate',
    'tracks.view',
    'tracks.manage',
    'interns.view',
    'interns.manage',
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.manage',
  ],
};

export const supervisorUser = {
  ...adminUser,
  id: 2,
  name: 'Sam Supervisor',
  email: 'sam@example.test',
  roles: ['supervisor'],
};

export const internUser = {
  id: 3,
  name: 'Ivy Intern',
  email: 'ivy@example.test',
  roles: ['intern'],
  permissions: ['dashboard.view', 'tasks.view'],
};

const theme = createTheme({
  palette: {
    primary: { main: '#719430' },
    secondary: { main: '#0f172a' },
  },
});

export function storeSession(user = adminUser, token = 'test-token') {
  window.localStorage.setItem(authStorageKeys.accessToken, token);
  window.localStorage.setItem(authStorageKeys.user, JSON.stringify(user));
}

export function mockCurrentUser(user = adminUser) {
  server.use(
    http.get(`${API_URL}/auth/me`, () => HttpResponse.json({
      success: true,
      message: 'Current user fetched successfully.',
      data: { user },
    })),
  );
}

export function renderWithProviders(ui, { route = '/', withAuth = false, user = adminUser } = {}) {
  if (withAuth) {
    storeSession(user);
    mockCurrentUser(user);
  }

  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}
