import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  activateUser,
  createUser,
  deactivateUser,
  getEligibleSupervisors,
  getUsers,
  syncUserRoles,
  updateUser,
} from './userService';
import { createTrack, deactivateTrack, getTracks, updateTrack } from './trackService';
import { createIntern, getInterns, updateIntern, updateInternStatus } from './internService';
import { API_URL, server } from '../test/server';

function success(data, meta = { current_page: 1, last_page: 1, per_page: 15, total: data.length }) {
  return HttpResponse.json({
    success: true,
    message: 'OK',
    data,
    meta,
    links: { first: null, last: null, prev: null, next: null },
  });
}

describe('Phase 2 services', () => {
  it('requests users with server-side pagination, search, filters, and lowercase roles', async () => {
    let query = null;
    server.use(
      http.get(`${API_URL}/users`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return success([{ id: 1, name: 'Mary Banda' }], { current_page: 2, last_page: 5, per_page: 25, total: 101 });
      }),
    );

    const result = await getUsers({
      search: 'mary',
      role: 'supervisor',
      is_active: false,
      track_id: 4,
      page: 2,
      per_page: 25,
      sort: 'name',
      direction: 'asc',
    });

    expect(query.get('search')).toBe('mary');
    expect(query.get('role')).toBe('supervisor');
    expect(query.get('is_active')).toBe('false');
    expect(query.get('track_id')).toBe('4');
    expect(query.get('page')).toBe('2');
    expect(query.get('per_page')).toBe('25');
    expect(query.get('sort')).toBe('name');
    expect(query.get('direction')).toBe('asc');
    expect(result.items).toEqual([{ id: 1, name: 'Mary Banda' }]);
    expect(result.meta.last_page).toBe(5);
  });

  it('creates users with backend field names, roles array, and password confirmation', async () => {
    let body = null;
    server.use(
      http.post(`${API_URL}/users`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 9, ...body } }, { status: 201 });
      }),
    );

    const result = await createUser({
      name: 'Mary Banda',
      email: 'mary@example.com',
      phone: '0977123456',
      password: 'SecurePassword123!',
      password_confirmation: 'SecurePassword123!',
      is_active: true,
      roles: ['supervisor'],
    });

    expect(body).toEqual({
      name: 'Mary Banda',
      email: 'mary@example.com',
      phone: '0977123456',
      password: 'SecurePassword123!',
      password_confirmation: 'SecurePassword123!',
      is_active: true,
      roles: ['supervisor'],
    });
    expect(result.user.id).toBe(9);
  });

  it('updates users without sending empty password fields', async () => {
    let body = null;
    server.use(
      http.put(`${API_URL}/users/7`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Updated.', data: { id: 7, ...body } });
      }),
    );

    await updateUser(7, {
      name: 'Mary Banda',
      email: 'mary@example.com',
      phone: '',
      password: '',
      password_confirmation: '',
    });

    expect(body).toEqual({
      name: 'Mary Banda',
      email: 'mary@example.com',
    });
  });

  it('syncs user roles with lowercase role values and preserves conflict errors', async () => {
    let body = null;
    server.use(
      http.put(`${API_URL}/users/1/roles`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: false,
          message: 'The final active administrator cannot lose the admin role.',
        }, { status: 409 });
      }),
    );

    await expect(syncUserRoles(1, ['supervisor', 'reviewer'])).rejects.toMatchObject({
      type: 'conflict',
      message: 'The final active administrator cannot lose the admin role.',
    });
    expect(body).toEqual({ roles: ['supervisor', 'reviewer'] });
  });

  it('uses dedicated user activation endpoints', async () => {
    const called = [];
    server.use(
      http.patch(`${API_URL}/users/3/activate`, () => {
        called.push('activate');
        return HttpResponse.json({ success: true, message: 'Activated.', data: { id: 3, is_active: true } });
      }),
      http.patch(`${API_URL}/users/3/deactivate`, () => {
        called.push('deactivate');
        return HttpResponse.json({ success: true, message: 'Deactivated.', data: { id: 3, is_active: false } });
      }),
    );

    await activateUser(3);
    await deactivateUser(3);

    expect(called).toEqual(['activate', 'deactivate']);
  });

  it('loads eligible supervisors from admin and supervisor user filters', async () => {
    const roles = [];
    server.use(
      http.get(`${API_URL}/users`, ({ request }) => {
        const role = new URL(request.url).searchParams.get('role');
        roles.push(role);
        return success([{ id: role === 'admin' ? 1 : 2, name: role === 'admin' ? 'Ada Admin' : 'Sam Supervisor', roles: [role] }]);
      }),
    );

    const result = await getEligibleSupervisors();

    expect(roles.sort()).toEqual(['admin', 'supervisor']);
    expect(result.items.map((user) => user.id).sort()).toEqual([1, 2]);
  });

  it('lists tracks with pagination and filters', async () => {
    let query = null;
    server.use(
      http.get(`${API_URL}/tracks`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return success([{ id: 4, name: 'PHP/Laravel', intern_profiles_count: 3 }]);
      }),
    );

    const result = await getTracks({ search: 'php', is_active: true, page: 3, per_page: 10 });

    expect(query.get('search')).toBe('php');
    expect(query.get('is_active')).toBe('true');
    expect(query.get('page')).toBe('3');
    expect(result.items[0].intern_profiles_count).toBe(3);
  });

  it('creates tracks with supported fields and omits blank slugs', async () => {
    let body = null;
    server.use(
      http.post(`${API_URL}/tracks`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 4, slug: 'php-laravel', ...body } }, { status: 201 });
      }),
    );

    await createTrack({ name: 'PHP/Laravel', slug: '', description: 'Backend development.', is_active: true });

    expect(body).toEqual({
      name: 'PHP/Laravel',
      description: 'Backend development.',
      is_active: true,
    });
  });

  it('updates tracks without sending a blank slug and deactivates through the dedicated endpoint', async () => {
    let updateBody = null;
    let deactivated = false;
    server.use(
      http.put(`${API_URL}/tracks/4`, async ({ request }) => {
        updateBody = await request.json();
        return HttpResponse.json({ success: true, message: 'Updated.', data: { id: 4, ...updateBody } });
      }),
      http.patch(`${API_URL}/tracks/4/deactivate`, () => {
        deactivated = true;
        return HttpResponse.json({ success: true, message: 'Deactivated.', data: { id: 4, is_active: false } });
      }),
    );

    await updateTrack(4, { name: 'Laravel', slug: '', description: '', is_active: true });
    await deactivateTrack(4);

    expect(updateBody).toEqual({ name: 'Laravel', is_active: true });
    expect(deactivated).toBe(true);
  });

  it('requests interns with server-side filters, sorting, and pagination', async () => {
    let query = null;
    server.use(
      http.get(`${API_URL}/interns`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return success([{ id: 8, intern_number: 'INT-2026-0001' }]);
      }),
    );

    const result = await getInterns({
      search: 'john',
      track_id: 4,
      status: 'active',
      supervisor_id: 2,
      is_active: true,
      start_date_from: '2026-07-20',
      start_date_to: '2026-10-20',
      page: 2,
      per_page: 25,
      sort: 'user_name',
      direction: 'asc',
    });

    expect(query.get('search')).toBe('john');
    expect(query.get('track_id')).toBe('4');
    expect(query.get('status')).toBe('active');
    expect(query.get('supervisor_id')).toBe('2');
    expect(query.get('is_active')).toBe('true');
    expect(query.get('start_date_from')).toBe('2026-07-20');
    expect(query.get('start_date_to')).toBe('2026-10-20');
    expect(query.get('sort')).toBe('user_name');
    expect(result.items[0].intern_number).toBe('INT-2026-0001');
  });

  it('creates interns with real IDs, date-only fields, no arbitrary roles, and omitted blank intern number', async () => {
    let body = null;
    server.use(
      http.post(`${API_URL}/interns`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 12, intern_number: 'INT-2026-0002' } }, { status: 201 });
      }),
    );

    await createIntern({
      name: 'John Phiri',
      email: 'john@example.com',
      phone: '0977000000',
      password: 'SecurePassword123!',
      password_confirmation: 'SecurePassword123!',
      is_active: true,
      track_id: 4,
      intern_number: '',
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
      actual_end_date: '',
      supervisor_id: 2,
      bio: 'React intern',
      status: 'active',
      roles: ['admin'],
    });

    expect(body).toEqual({
      name: 'John Phiri',
      email: 'john@example.com',
      phone: '0977000000',
      password: 'SecurePassword123!',
      password_confirmation: 'SecurePassword123!',
      is_active: true,
      track_id: 4,
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
      supervisor_id: 2,
      bio: 'React intern',
      status: 'active',
    });
    expect(body.roles).toBeUndefined();
    expect(body.intern_number).toBeUndefined();
  });

  it('updates interns without immutable fields or status', async () => {
    let body = null;
    server.use(
      http.put(`${API_URL}/interns/12`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Updated.', data: { id: 12, ...body } });
      }),
    );

    await updateIntern(12, {
      track_id: 4,
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
      actual_end_date: '',
      supervisor_id: 2,
      bio: 'Updated',
      intern_number: 'INT-2026-0001',
      status: 'completed',
      name: 'Wrong',
    });

    expect(body).toEqual({
      track_id: 4,
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
      supervisor_id: 2,
      bio: 'Updated',
    });
  });

  it('updates intern status through the status endpoint and preserves conflicts', async () => {
    let body = null;
    server.use(
      http.patch(`${API_URL}/interns/12/status`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: false,
          message: 'That intern status transition is not allowed.',
        }, { status: 409 });
      }),
    );

    await expect(updateInternStatus(12, { status: 'completed', actual_end_date: '2026-10-20' })).rejects.toMatchObject({
      type: 'conflict',
      message: 'That intern status transition is not allowed.',
    });
    expect(body).toEqual({ status: 'completed', actual_end_date: '2026-10-20' });
  });
});
