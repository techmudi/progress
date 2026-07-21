import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Interns from './Interns';
import CreateIntern from './CreateIntern';
import EditIntern from './EditIntern';
import InternDetails from './InternDetails';
import { ProtectedRoute } from '../../routes/RouteGuards';
import { API_URL, server } from '../../test/server';
import { adminUser, internUser, renderWithProviders } from '../../test/testUtils';

const track = { id: 4, name: 'React', slug: 'react', is_active: true };
const supervisor = { id: 2, name: 'Sam Supervisor', email: 'sam@example.test', is_active: true, roles: ['supervisor'] };
const intern = {
  id: 12,
  intern_number: 'INT-2026-0002',
  status: 'active',
  start_date: '2026-07-20',
  expected_end_date: '2026-10-20',
  actual_end_date: null,
  bio: 'React intern',
  user: { id: 20, name: 'John Phiri', email: 'john@example.com', phone: '0977000000', is_active: true, roles: ['intern'] },
  track,
  supervisor,
  created_at: '2026-07-20T08:00:00Z',
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

function mockTrackAndSupervisorOptions() {
  server.use(
    http.get(`${API_URL}/tracks`, () => paginated([track])),
    http.get(`${API_URL}/users`, ({ request }) => {
      const role = new URL(request.url).searchParams.get('role');
      if (role === 'admin') return paginated([]);
      if (role === 'supervisor') return paginated([supervisor]);
      return paginated([]);
    }),
  );
}

async function chooseSelect(label, option) {
  await userEvent.click(screen.getByRole('combobox', { name: label }));
  await userEvent.click(screen.getByRole('option', { name: option }));
}

describe('Intern pages', () => {
  it('renders intern number, track, supervisor, account state, and status from a paginated API response', async () => {
    mockTrackAndSupervisorOptions();
    server.use(
      http.get(`${API_URL}/interns`, () => paginated([intern])),
    );

    renderWithProviders(<Interns />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('INT-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('John Phiri')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Sam Supervisor')).toBeInTheDocument();
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
  });

  it('search and filter changes request server-side intern params and reset pagination', async () => {
    mockTrackAndSupervisorOptions();
    const requests = [];
    server.use(
      http.get(`${API_URL}/interns`, ({ request }) => {
        const query = new URL(request.url).searchParams;
        requests.push(Object.fromEntries(query.entries()));
        return paginated([intern], { current_page: Number(query.get('page') || 1), last_page: 2, per_page: 15, total: 18 });
      }),
    );

    renderWithProviders(<Interns />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('INT-2026-0002')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(requests.some((request) => request.page === '2')).toBe(true));
    await userEvent.type(screen.getByLabelText(/search interns/i), 'john');
    await waitFor(() => expect(requests.some((request) => request.search === 'john' && request.page === '1')).toBe(true));
  });

  it('creates interns with backend fields, real option IDs, no roles, and unshifted date-only values', async () => {
    mockTrackAndSupervisorOptions();
    let body = null;
    server.use(
      http.post(`${API_URL}/interns`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Created.', data: { ...intern, id: 99 } }, { status: 201 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/interns/create" element={<CreateIntern />} />
        <Route path="/interns/:id" element={<div>Intern target</div>} />
      </Routes>,
      { route: '/interns/create', withAuth: true, user: adminUser },
    );

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'John Phiri' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '0977000000' } });
    const passwordFields = screen.getAllByLabelText(/password/i);
    fireEvent.change(passwordFields[0], { target: { value: 'SecurePassword123!' } });
    fireEvent.change(passwordFields[1], { target: { value: 'SecurePassword123!' } });
    await chooseSelect(/track/i, 'React');
    await chooseSelect(/supervisor/i, /Sam Supervisor/);
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-07-20' } });
    fireEvent.change(screen.getByLabelText(/expected end date/i), { target: { value: '2026-10-20' } });
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: 'React intern' } });
    await chooseSelect(/internship status/i, 'Active');
    await userEvent.click(screen.getByRole('button', { name: /create intern/i }));

    expect(await screen.findByText('Intern target')).toBeInTheDocument();
    expect(body).toMatchObject({
      name: 'John Phiri',
      email: 'john@example.com',
      phone: '0977000000',
      password: 'SecurePassword123!',
      password_confirmation: 'SecurePassword123!',
      is_active: true,
      track_id: 4,
      supervisor_id: 2,
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
      bio: 'React intern',
      status: 'active',
    });
    expect(body.roles).toBeUndefined();
    expect(body.intern_number).toBeUndefined();
  }, 20000);

  it('loads intern profile by intern-profile ID and shows only valid active-status transitions', async () => {
    server.use(
      http.get(`${API_URL}/interns/12`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: intern })),
    );

    renderWithProviders(
      <Routes>
        <Route path="/interns/:id" element={<InternDetails />} />
      </Routes>,
      { route: '/interns/12', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('INT-2026-0002')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark suspended/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark completed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark withdrawn/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark pending/i })).not.toBeInTheDocument();
  });

  it('requires actual end date before completing an intern', async () => {
    server.use(
      http.get(`${API_URL}/interns/12`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: intern })),
    );

    renderWithProviders(
      <Routes>
        <Route path="/interns/:id" element={<InternDetails />} />
      </Routes>,
      { route: '/interns/12', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('INT-2026-0002')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /mark completed/i }));
    await userEvent.click(screen.getByRole('button', { name: /update status/i }));

    expect(await screen.findByText('The actual end date is required when completing an intern.')).toBeInTheDocument();
  });

  it('preserves backend conflict messages during status transitions', async () => {
    server.use(
      http.get(`${API_URL}/interns/12`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: intern })),
      http.patch(`${API_URL}/interns/12/status`, () => HttpResponse.json({
        success: false,
        message: 'That intern status transition is not allowed.',
      }, { status: 409 })),
    );

    renderWithProviders(
      <Routes>
        <Route path="/interns/:id" element={<InternDetails />} />
      </Routes>,
      { route: '/interns/12', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('INT-2026-0002')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /mark withdrawn/i }));
    fireEvent.change(screen.getByLabelText(/actual end date/i), { target: { value: '2026-10-20' } });
    await userEvent.click(screen.getByRole('button', { name: /update status/i }));

    expect(await screen.findByText('That intern status transition is not allowed.')).toBeInTheDocument();
  });

  it('does not offer reopening for terminal intern statuses', async () => {
    server.use(
      http.get(`${API_URL}/interns/12`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: { ...intern, status: 'completed', actual_end_date: '2026-10-20' } })),
    );

    renderWithProviders(
      <Routes>
        <Route path="/interns/:id" element={<InternDetails />} />
      </Routes>,
      { route: '/interns/12', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('This intern profile is terminal and cannot be reopened here.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark active/i })).not.toBeInTheDocument();
  });

  it('updates intern profiles without immutable intern number or status fields', async () => {
    mockTrackAndSupervisorOptions();
    let body = null;
    server.use(
      http.get(`${API_URL}/interns/12`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: intern })),
      http.put(`${API_URL}/interns/12`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Updated.', data: { ...intern, ...body } });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/interns/:id/edit" element={<EditIntern />} />
        <Route path="/interns/:id" element={<div>Intern profile target</div>} />
      </Routes>,
      { route: '/interns/12/edit', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText(/Intern number INT-2026-0002 is immutable/i)).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText(/bio/i));
    await userEvent.type(screen.getByLabelText(/bio/i), 'Updated bio');
    await userEvent.click(screen.getByRole('button', { name: /update intern/i }));

    expect(await screen.findByText('Intern profile target')).toBeInTheDocument();
    expect(body).toEqual({
      track_id: 4,
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
      supervisor_id: 2,
      bio: 'Updated bio',
    });
    expect(body.intern_number).toBeUndefined();
    expect(body.status).toBeUndefined();
  });

  it('blocks intern users from management routes', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/interns"
          element={(
            <ProtectedRoute managementOnly permissions={['interns.view']}>
              <div>Interns target</div>
            </ProtectedRoute>
          )}
        />
      </Routes>,
      { route: '/interns', withAuth: true, user: internUser },
    );

    expect(await screen.findByText('Access unavailable')).toBeInTheDocument();
    expect(screen.queryByText('Interns target')).not.toBeInTheDocument();
  });
});
