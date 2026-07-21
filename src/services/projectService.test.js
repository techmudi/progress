import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  addProjectMember,
  createProject,
  createProjectModule,
  getEligibleProjectMemberUsers,
  getProjectMembers,
  getProjectModules,
  getProjects,
  removeProjectMember,
  updateProject,
  updateProjectMember,
  updateProjectModule,
  updateProjectModuleStatus,
  updateProjectStatus,
} from './projectService';
import { API_URL, server } from '../test/server';

function paginated(data, meta = { current_page: 1, last_page: 1, per_page: 15, total: data.length }) {
  return HttpResponse.json({
    success: true,
    message: 'OK',
    data,
    meta,
    links: { first: null, last: null, prev: null, next: null },
  });
}

describe('Project services', () => {
  it('requests projects with server-side filters, sorting, and pagination', async () => {
    let query = null;
    server.use(
      http.get(`${API_URL}/projects`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return paginated([{ id: 7, name: 'Portal' }], { current_page: 2, last_page: 4, per_page: 25, total: 76 });
      }),
    );

    const result = await getProjects({
      search: 'portal',
      status: 'active',
      priority: 'urgent',
      member_id: 3,
      track_id: 4,
      start_date_from: '2026-07-20',
      expected_end_date_to: '2026-10-20',
      page: 2,
      per_page: 25,
      sort: 'name',
      direction: 'asc',
    });

    expect(query.get('search')).toBe('portal');
    expect(query.get('status')).toBe('active');
    expect(query.get('priority')).toBe('urgent');
    expect(query.get('member_id')).toBe('3');
    expect(query.get('track_id')).toBe('4');
    expect(query.get('start_date_from')).toBe('2026-07-20');
    expect(query.get('expected_end_date_to')).toBe('2026-10-20');
    expect(query.get('page')).toBe('2');
    expect(query.get('sort')).toBe('name');
    expect(result.items[0].name).toBe('Portal');
    expect(result.meta.last_page).toBe(4);
  });

  it('creates and updates projects with supported fields only', async () => {
    const bodies = [];
    server.use(
      http.post(`${API_URL}/projects`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 8, code: 'PRJ-2026-0001' } }, { status: 201 });
      }),
      http.put(`${API_URL}/projects/8`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ success: true, message: 'Updated.', data: { id: 8, ...(bodies.at(-1) || {}) } });
      }),
    );

    await createProject({
      name: 'Portal',
      slug: '',
      description: 'Internal portal',
      priority: 'high',
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
      code: 'LOCAL-CODE',
      manager: 'Ada',
      progress: 80,
    });
    await updateProject(8, {
      name: 'Portal v2',
      slug: 'portal-v2',
      description: '',
      priority: 'urgent',
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
      status: 'completed',
    });

    expect(bodies[0]).toEqual({
      name: 'Portal',
      description: 'Internal portal',
      priority: 'high',
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
    });
    expect(bodies[1]).toEqual({
      name: 'Portal v2',
      slug: 'portal-v2',
      priority: 'urgent',
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
    });
  });

  it('updates project status through the lifecycle endpoint and preserves conflicts', async () => {
    let body = null;
    server.use(
      http.patch(`${API_URL}/projects/8/status`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: false,
          message: 'Projects cannot be completed while modules are unfinished.',
        }, { status: 409 });
      }),
    );

    await expect(updateProjectStatus(8, {
      status: 'completed',
      actual_end_date: '2026-10-20',
      closure_reason: 'Done',
    })).rejects.toMatchObject({
      type: 'conflict',
      message: 'Projects cannot be completed while modules are unfinished.',
    });
    expect(body).toEqual({
      status: 'completed',
      actual_end_date: '2026-10-20',
      closure_reason: 'Done',
    });
  });

  it('uses nested project member endpoints without changing global user roles', async () => {
    const calls = [];
    server.use(
      http.get(`${API_URL}/projects/8/members`, ({ request }) => {
        calls.push(['list', new URL(request.url).searchParams.get('member_role')]);
        return paginated([{ id: 1, member_role: 'lead' }]);
      }),
      http.post(`${API_URL}/projects/8/members`, async ({ request }) => {
        calls.push(['add', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Added.', data: { id: 2 } }, { status: 201 });
      }),
      http.put(`${API_URL}/projects/8/members/2`, async ({ request }) => {
        calls.push(['update', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Updated.', data: { id: 2 } });
      }),
      http.delete(`${API_URL}/projects/8/members/2`, () => {
        calls.push(['remove']);
        return HttpResponse.json({ success: true, message: 'Removed.' });
      }),
      http.put(`${API_URL}/users/12/roles`, () => {
        calls.push(['unexpected-global-role-sync']);
        return HttpResponse.json({});
      }),
    );

    await getProjectMembers(8, { member_role: 'lead' });
    await addProjectMember(8, { user_id: 12, member_role: 'member', joined_at: '2026-07-20', roles: ['admin'] });
    await updateProjectMember(8, 2, { user_id: 99, member_role: 'reviewer', joined_at: '2026-07-21' });
    await removeProjectMember(8, 2);

    expect(calls).toEqual([
      ['list', 'lead'],
      ['add', { user_id: 12, member_role: 'member', joined_at: '2026-07-20' }],
      ['update', { member_role: 'reviewer' }],
      ['remove'],
    ]);
  });

  it('loads eligible project member users by exact global role rules and excludes active members', async () => {
    const requestedRoles = [];
    server.use(
      http.get(`${API_URL}/users`, ({ request }) => {
        const url = new URL(request.url);
        const role = url.searchParams.get('role');
        requestedRoles.push(role || 'all');
        return paginated([
          { id: role === 'admin' ? 1 : 2, name: role === 'admin' ? 'Ada Admin' : 'Sam Supervisor', email: `${role}@example.test`, roles: [role] },
          { id: 99, name: 'Existing Lead', email: 'existing@example.test', roles: [role] },
        ]);
      }),
    );

    const leadResult = await getEligibleProjectMemberUsers('lead', 'ad', [99]);
    const observerResult = await getEligibleProjectMemberUsers('observer', '', []);

    expect(requestedRoles).toEqual(['admin', 'supervisor', 'all']);
    expect(leadResult.items.map((user) => user.id).sort()).toEqual([1, 2]);
    expect(observerResult.items.length).toBeGreaterThan(0);
  });

  it('uses nested module endpoints and keeps status out of create and edit payloads', async () => {
    const calls = [];
    server.use(
      http.get(`${API_URL}/projects/8/modules`, ({ request }) => {
        calls.push(['list', new URL(request.url).searchParams.get('sort')]);
        return paginated([{ id: 4, name: 'Planning', sort_order: 1 }]);
      }),
      http.post(`${API_URL}/projects/8/modules`, async ({ request }) => {
        calls.push(['create', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 5 } }, { status: 201 });
      }),
      http.put(`${API_URL}/projects/8/modules/5`, async ({ request }) => {
        calls.push(['update', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Updated.', data: { id: 5 } });
      }),
      http.patch(`${API_URL}/projects/8/modules/5/status`, async ({ request }) => {
        calls.push(['status', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Status updated.', data: { id: 5, status: 'completed' } });
      }),
    );

    await getProjectModules(8, { sort: 'sort_order', direction: 'asc' });
    await createProjectModule(8, { name: 'Planning', slug: '', description: 'Scope', sort_order: 1, status: 'active', project_id: 8 });
    await updateProjectModule(8, 5, { name: 'Planning', slug: 'planning', description: '', sort_order: 2, status: 'completed' });
    await updateProjectModuleStatus(8, 5, { status: 'completed' });

    expect(calls).toEqual([
      ['list', 'sort_order'],
      ['create', { name: 'Planning', description: 'Scope', sort_order: 1 }],
      ['update', { name: 'Planning', slug: 'planning', sort_order: 2 }],
      ['status', { status: 'completed' }],
    ]);
  });
});
