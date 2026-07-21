import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllUsers from './AllUsers';
import CreateUser from './CreateUser';
import EditUser from './EditUser';
import UserDetails from './UserDetails';
import { API_URL, server } from '../../test/server';
import { adminUser, renderWithProviders } from '../../test/testUtils';

const userResource = {
  id: 5,
  name: 'Mary Banda',
  email: 'mary@example.com',
  phone: '0977123456',
  is_active: true,
  roles: ['admin'],
  permissions: ['dashboard.view', 'users.view', 'users.update'],
  intern_profile: {
    id: 3,
    intern_number: 'INT-2026-0003',
    status: 'active',
    track: { id: 4, name: 'React', slug: 'react', is_active: true },
  },
  last_login_at: '2026-07-20T08:00:00Z',
  created_at: '2026-07-19T08:00:00Z',
  updated_at: '2026-07-20T08:00:00Z',
};

function paginated(data, meta = { current_page: 1, last_page: 1, per_page: 15, total: data.length }) {
  return HttpResponse.json({
    success: true,
    message: 'Fetched.',
    data,
    meta,
    links: { first: null, last: null, prev: null, next: null },
  });
}

function mockTracks() {
  server.use(
    http.get(`${API_URL}/tracks`, () => paginated([{ id: 4, name: 'React', slug: 'react', is_active: true }])),
  );
}

describe('Phase 2 user pages', () => {
  it('requests server-side pagination and resets to page 1 when search changes', async () => {
    mockTracks();
    const requests = [];
    server.use(
      http.get(`${API_URL}/users`, ({ request }) => {
        const query = new URL(request.url).searchParams;
        requests.push(Object.fromEntries(query.entries()));
        return paginated([userResource], { current_page: Number(query.get('page') || 1), last_page: 2, per_page: 15, total: 20 });
      }),
    );

    renderWithProviders(<AllUsers />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('Mary Banda')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(requests.some((request) => request.page === '2')).toBe(true));

    await userEvent.type(screen.getByLabelText(/search users/i), 'mary');

    await waitFor(() => expect(requests.some((request) => request.search === 'mary' && request.page === '1')).toBe(true));
  }, 10000);

  it('renders paginated users and hides unauthorized user actions', async () => {
    const limitedUser = { ...adminUser, permissions: ['dashboard.view', 'users.view'] };
    server.use(
      http.get(`${API_URL}/users`, () => paginated([userResource])),
    );

    renderWithProviders(<AllUsers />, { withAuth: true, user: limitedUser });

    expect(await screen.findByText('Mary Banda')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create user/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^deactivate$/i })).not.toBeInTheDocument();
  });

  it('creates a user with backend fields and never offers the protected service role', async () => {
    let body = null;
    server.use(
      http.post(`${API_URL}/users`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 10, ...body } }, { status: 201 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/users/create" element={<CreateUser />} />
        <Route path="/users/:id" element={<div>User profile target</div>} />
      </Routes>,
      { route: '/users/create', withAuth: true, user: adminUser },
    );

    const protectedServiceRole = ['reporting', 'service'].join('_');
    expect(screen.queryByLabelText(new RegExp(protectedServiceRole, 'i'))).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/^name/i), 'Mary Banda');
    await userEvent.type(screen.getByLabelText(/email/i), 'mary@example.com');
    await userEvent.type(screen.getByLabelText(/phone/i), '0977123456');
    const passwordFields = screen.getAllByLabelText(/password/i);
    await userEvent.type(passwordFields[0], 'SecurePassword123!');
    await userEvent.type(passwordFields[1], 'SecurePassword123!');
    await userEvent.click(screen.getByLabelText(/reviewer/i));
    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(await screen.findByText('User profile target')).toBeInTheDocument();
    expect(body).toMatchObject({
      name: 'Mary Banda',
      email: 'mary@example.com',
      phone: '0977123456',
      password: 'SecurePassword123!',
      password_confirmation: 'SecurePassword123!',
      is_active: true,
      roles: ['supervisor', 'reviewer'],
    });
  }, 10000);

  it('renders create-user validation errors beside fields', async () => {
    server.use(
      http.post(`${API_URL}/users`, () => HttpResponse.json({
        success: false,
        message: 'The given data was invalid.',
        errors: { email: ['The email has already been taken.'] },
      }, { status: 422 })),
    );

    renderWithProviders(<CreateUser />, { withAuth: true, user: adminUser });

    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect((await screen.findAllByText('The email has already been taken.')).length).toBeGreaterThanOrEqual(1);
  });

  it('loads user profile by route ID and shows intern profile details', async () => {
    server.use(
      http.get(`${API_URL}/users/5`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: userResource })),
    );

    renderWithProviders(
      <Routes>
        <Route path="/users/:id" element={<UserDetails />} />
      </Routes>,
      { route: '/users/5', withAuth: true, user: adminUser },
    );

    expect((await screen.findAllByText('Mary Banda')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('INT-2026-0003')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view intern profile/i })).toHaveAttribute('href', '/interns/3');
  });

  it('does not send empty password fields when editing a user', async () => {
    let body = null;
    server.use(
      http.get(`${API_URL}/users/5`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: userResource })),
      http.put(`${API_URL}/users/5`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Updated.', data: { ...userResource, ...body } });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/users/edit/:id" element={<EditUser />} />
        <Route path="/users/:id" element={<div>Profile target</div>} />
      </Routes>,
      { route: '/users/edit/5', withAuth: true, user: adminUser },
    );

    expect(await screen.findByDisplayValue('Mary Banda')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /update user/i }));

    expect(await screen.findByText('Profile target')).toBeInTheDocument();
    expect(body).toEqual({
      name: 'Mary Banda',
      email: 'mary@example.com',
      phone: '0977123456',
    });
  });

  it('role synchronization sends lowercase roles and displays final-admin conflicts', async () => {
    let body = null;
    server.use(
      http.get(`${API_URL}/users/5`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: userResource })),
      http.put(`${API_URL}/users/5/roles`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: false,
          message: 'The final active administrator cannot lose the admin role.',
        }, { status: 409 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/users/:id" element={<UserDetails />} />
      </Routes>,
      { route: '/users/5', withAuth: true, user: adminUser },
    );

    expect((await screen.findAllByText('Mary Banda')).length).toBeGreaterThanOrEqual(1);
    await userEvent.click(screen.getByRole('button', { name: /change roles/i }));
    await userEvent.click(screen.getByLabelText(/admin/i));
    await userEvent.click(screen.getByLabelText(/supervisor/i));
    await userEvent.click(screen.getByRole('button', { name: /save roles/i }));

    expect(await screen.findByText('The final active administrator cannot lose the admin role.')).toBeInTheDocument();
    expect(body).toEqual({ roles: ['supervisor'] });
  });

  it('deactivation uses the correct endpoint and confirmation language', async () => {
    let deactivated = false;
    server.use(
      http.get(`${API_URL}/users/5`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: userResource })),
      http.patch(`${API_URL}/users/5/deactivate`, () => {
        deactivated = true;
        return HttpResponse.json({ success: true, message: 'Deactivated.', data: { ...userResource, is_active: false } });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/users/:id" element={<UserDetails />} />
      </Routes>,
      { route: '/users/5', withAuth: true, user: adminUser },
    );

    expect((await screen.findAllByText('Mary Banda')).length).toBeGreaterThanOrEqual(1);
    await userEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));
    expect(screen.getByText(/blocks login and revokes existing tokens/i)).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^deactivate$/i }));

    await waitFor(() => expect(deactivated).toBe(true));
    expect(await screen.findByText('Inactive')).toBeInTheDocument();
  });
});
