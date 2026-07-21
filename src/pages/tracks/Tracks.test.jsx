import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tracks from './Tracks';
import CreateTrack from './CreateTrack';
import { API_URL, server } from '../../test/server';
import { adminUser, renderWithProviders } from '../../test/testUtils';
import TrackSelect from '../../components/selects/TrackSelect';

const track = {
  id: 4,
  name: 'PHP/Laravel',
  slug: 'php-laravel',
  description: 'Backend development using PHP and Laravel.',
  is_active: true,
  intern_profiles_count: 7,
  created_at: '2026-07-20T08:00:00Z',
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

describe('Tracks pages', () => {
  it('renders paginated track data with returned intern counts', async () => {
    server.use(
      http.get(`${API_URL}/tracks`, () => paginated([track], { current_page: 1, last_page: 3, per_page: 15, total: 31 })),
    );

    renderWithProviders(<Tracks />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('PHP/Laravel')).toBeInTheDocument();
    expect(screen.getByText('php-laravel')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
  });

  it('creates tracks with supported fields and allows slug omission', async () => {
    let body = null;
    server.use(
      http.post(`${API_URL}/tracks`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 9, slug: 'php-laravel', ...body } }, { status: 201 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/tracks/create" element={<CreateTrack />} />
        <Route path="/tracks" element={<div>Tracks target</div>} />
      </Routes>,
      { route: '/tracks/create', withAuth: true, user: adminUser },
    );

    await userEvent.type(screen.getByLabelText(/^name/i), 'PHP/Laravel');
    await userEvent.type(screen.getByLabelText(/description/i), 'Backend development using PHP and Laravel.');
    await userEvent.click(screen.getByRole('button', { name: /create track/i }));

    expect(await screen.findByText('Tracks target')).toBeInTheDocument();
    expect(body).toEqual({
      name: 'PHP/Laravel',
      description: 'Backend development using PHP and Laravel.',
      is_active: true,
    });
  }, 10000);

  it('uses confirmation before deactivating a track', async () => {
    let deactivated = false;
    server.use(
      http.get(`${API_URL}/tracks`, () => paginated([track])),
      http.patch(`${API_URL}/tracks/4/deactivate`, () => {
        deactivated = true;
        return HttpResponse.json({ success: true, message: 'Deactivated.', data: { ...track, is_active: false } });
      }),
    );

    renderWithProviders(<Tracks />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('PHP/Laravel')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));
    expect(screen.getByText(/does not delete them/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));

    await waitFor(() => expect(deactivated).toBe(true));
  });

  it('hides track management actions without tracks.manage', async () => {
    const viewer = { ...adminUser, permissions: ['dashboard.view', 'tracks.view'] };
    server.use(
      http.get(`${API_URL}/tracks`, () => paginated([track])),
    );

    renderWithProviders(<Tracks />, { withAuth: true, user: viewer });

    expect(await screen.findByText('PHP/Laravel')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create track/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
  });

  it('track select loads real API IDs', async () => {
    const changes = [];
    server.use(
      http.get(`${API_URL}/tracks`, () => paginated([track])),
    );

    renderWithProviders(
      <TrackSelect value="" onChange={(event) => changes.push(event.target.value)} />,
      { withAuth: true, user: adminUser },
    );

    await waitFor(() => expect(screen.queryByText(/Loading tracks/i)).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('combobox', { name: /track/i }));
    await userEvent.click(screen.getByRole('option', { name: 'PHP/Laravel' }));

    expect(changes.map(String)).toEqual(['4']);
  });
});
