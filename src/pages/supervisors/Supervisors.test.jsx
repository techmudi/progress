import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Supervisors from './Supervisors';
import { API_URL, server } from '../../test/server';
import { adminUser, renderWithProviders } from '../../test/testUtils';

function paginated(data, meta = { current_page: 1, last_page: 1, per_page: 15, total: data.length }) {
  return HttpResponse.json({
    success: true,
    message: 'Fetched.',
    data,
    meta,
    links: { first: null, last: null, prev: null, next: null },
  });
}

describe('Supervisors page', () => {
  it('calls /users with role=supervisor and does not call /supervisors', async () => {
    const paths = [];
    server.use(
      http.get(`${API_URL}/users`, ({ request }) => {
        const url = new URL(request.url);
        paths.push(url.pathname);
        expect(url.searchParams.get('role')).toBe('supervisor');
        return paginated([{ id: 2, name: 'Sam Supervisor', email: 'sam@example.test', phone: null, is_active: true, roles: ['supervisor'] }]);
      }),
      http.get(`${API_URL}/supervisors`, () => {
        throw new Error('Unexpected /supervisors request');
      }),
    );

    renderWithProviders(<Supervisors />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('Sam Supervisor')).toBeInTheDocument();
    expect(paths).toEqual(['/api/v1/users']);
  });

  it('supports supervisor search and pagination through /users params', async () => {
    const requests = [];
    server.use(
      http.get(`${API_URL}/users`, ({ request }) => {
        const query = new URL(request.url).searchParams;
        requests.push(Object.fromEntries(query.entries()));
        return paginated(
          [{ id: 2, name: 'Sam Supervisor', email: 'sam@example.test', is_active: true, roles: ['supervisor'] }],
          { current_page: Number(query.get('page') || 1), last_page: 2, per_page: 15, total: 18 },
        );
      }),
    );

    renderWithProviders(<Supervisors />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('Sam Supervisor')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(requests.some((request) => request.page === '2')).toBe(true));
    await userEvent.type(screen.getByLabelText(/search supervisors/i), 'sam');
    await waitFor(() => expect(requests.some((request) => request.search === 'sam' && request.page === '1')).toBe(true));
  });
});
