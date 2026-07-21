import { describe, expect, it } from 'vitest';
import { Navigate, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllProjects from './AllProjects';
import CreateProject from './CreateProject';
import EditProject from './EditProject';
import ProjectDetails from './ProjectDetails';
import ProjectMembers from './ProjectMembers';
import ProjectModules from './ProjectModules';
import { API_URL, server } from '../../test/server';
import { adminUser, renderWithProviders } from '../../test/testUtils';

const project = {
  id: 8,
  code: 'PRJ-2026-0001',
  name: 'Portal',
  slug: 'portal',
  description: 'Internal portal',
  status: 'active',
  priority: 'high',
  start_date: '2026-07-20',
  expected_end_date: '2026-10-20',
  actual_end_date: null,
  closure_reason: null,
  creator: { id: 1, name: 'Ada Manager', email: 'ada@example.test' },
  active_member_count: 1,
  module_count: 2,
  members: [],
  modules: [],
  created_at: '2026-07-20T08:00:00Z',
  updated_at: '2026-07-20T08:30:00Z',
};

const leadMember = {
  id: 4,
  member_role: 'lead',
  joined_at: '2026-07-20T08:00:00Z',
  left_at: null,
  user: { id: 2, name: 'Sam Supervisor', email: 'sam@example.test', phone: null },
  global_roles: ['supervisor'],
};

const moduleRow = {
  id: 5,
  name: 'Planning',
  slug: 'planning',
  description: 'Scope work',
  status: 'active',
  sort_order: 1,
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

function mockSelectors() {
  server.use(
    http.get(`${API_URL}/tracks`, () => paginated([{ id: 3, name: 'React', is_active: true }])),
    http.get(`${API_URL}/users`, ({ request }) => {
      const role = new URL(request.url).searchParams.get('role');
      return paginated([
        { id: role === 'admin' ? 1 : role === 'supervisor' ? 2 : 7, name: role === 'admin' ? 'Ada Manager' : role === 'supervisor' ? 'Sam Supervisor' : 'Ivy Intern', email: `${role || 'ivy'}@example.test`, roles: role ? [role] : ['intern'] },
      ]);
    }),
  );
}

describe('Project pages', () => {
  it('lists projects with server pagination, filters, sorting, and returned detail IDs', async () => {
    mockSelectors();
    const requests = [];
    server.use(
      http.get(`${API_URL}/projects`, ({ request }) => {
        const params = new URL(request.url).searchParams;
        requests.push(Object.fromEntries(params.entries()));
        return paginated([project], { current_page: Number(params.get('page') || 1), last_page: 3, per_page: 15, total: 31 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/projects/8" element={<div>Project target</div>} />
      </Routes>,
      { route: '/projects', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('PRJ-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(requests.some((params) => params.page === '2')).toBe(true));

    await userEvent.type(screen.getByLabelText(/search projects/i), 'portal');
    await waitFor(() => expect(requests.some((params) => params.search === 'portal' && params.page === '1')).toBe(true));

    await userEvent.click(screen.getByLabelText(/status/i));
    await userEvent.click(screen.getByRole('option', { name: 'Completed' }));
    await waitFor(() => expect(requests.at(-1).status).toBe('completed'));

    await userEvent.click(screen.getByLabelText(/priority/i));
    await userEvent.click(screen.getByRole('option', { name: 'Urgent' }));
    await waitFor(() => expect(requests.at(-1).priority).toBe('urgent'));

    await userEvent.click(screen.getByText('Project'));
    await waitFor(() => expect(requests.at(-1).sort).toBe('name'));

    await userEvent.click(screen.getByRole('button', { name: /^view$/i }));
    expect(await screen.findByText('Project target')).toBeInTheDocument();
  }, 10000);

  it('hides project management actions without projects.manage', async () => {
    mockSelectors();
    const viewer = { ...adminUser, permissions: ['dashboard.view', 'projects.view'] };
    server.use(
      http.get(`${API_URL}/projects`, () => paginated([project])),
    );

    renderWithProviders(<AllProjects />, { withAuth: true, user: viewer });

    expect(await screen.findByText('Portal')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create project/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^members$/i })).not.toBeInTheDocument();
  });

  it('creates projects with supported fields only and keeps date-only values unchanged', async () => {
    let body = null;
    server.use(
      http.post(`${API_URL}/projects`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 8, code: 'PRJ-2026-0001', ...body } }, { status: 201 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/create" element={<CreateProject />} />
        <Route path="/projects/8" element={<div>Created project target</div>} />
      </Routes>,
      { route: '/projects/create', withAuth: true, user: adminUser },
    );

    await userEvent.type(screen.getByLabelText(/project name/i), 'Portal');
    await userEvent.click(screen.getByLabelText(/priority/i));
    await userEvent.click(screen.getByRole('option', { name: 'Urgent' }));
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-07-20' } });
    fireEvent.change(screen.getByLabelText(/expected end date/i), { target: { value: '2026-10-20' } });
    await userEvent.type(screen.getByLabelText(/description/i), 'Internal portal');
    await userEvent.click(screen.getByRole('button', { name: /create project/i }));

    expect(await screen.findByText('Created project target')).toBeInTheDocument();
    expect(body).toEqual({
      name: 'Portal',
      description: 'Internal portal',
      priority: 'urgent',
      start_date: '2026-07-20',
      expected_end_date: '2026-10-20',
    });
    expect(body).not.toHaveProperty('code');
    expect(body).not.toHaveProperty('manager');
    expect(body).not.toHaveProperty('progress');
  }, 10000);

  it('renders project validation errors beside fields', async () => {
    server.use(
      http.post(`${API_URL}/projects`, () => HttpResponse.json({
        success: false,
        message: 'Validation failed.',
        errors: { slug: ['The slug has already been taken.'] },
      }, { status: 422 })),
    );

    renderWithProviders(<CreateProject />, { withAuth: true, user: adminUser });

    await userEvent.type(screen.getByLabelText(/project name/i), 'Portal');
    await userEvent.type(screen.getByLabelText(/^slug/i), 'portal');
    await userEvent.click(screen.getByRole('button', { name: /create project/i }));

    expect(await screen.findAllByText('The slug has already been taken.')).toHaveLength(2);
  });

  it('edits projects by route ID without sending status or generated fields', async () => {
    let body = null;
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: project })),
      http.put(`${API_URL}/projects/8`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Updated.', data: { ...project, ...body } });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId/edit" element={<EditProject />} />
        <Route path="/projects/8" element={<div>Edited project target</div>} />
      </Routes>,
      { route: '/projects/8/edit', withAuth: true, user: adminUser },
    );

    await screen.findByDisplayValue('Portal');
    await userEvent.clear(screen.getByLabelText(/project name/i));
    await userEvent.type(screen.getByLabelText(/project name/i), 'Portal v2');
    await userEvent.click(screen.getByRole('button', { name: /save project/i }));

    expect(await screen.findByText('Edited project target')).toBeInTheDocument();
    expect(body).toMatchObject({ name: 'Portal v2', slug: 'portal', priority: 'high' });
    expect(body).not.toHaveProperty('status');
    expect(body).not.toHaveProperty('code');
  });

  it('loads project detail from the API and preserves lifecycle conflicts', async () => {
    let statusBeforeFailure = null;
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: { ...project, status: 'active' } })),
      http.patch(`${API_URL}/projects/8/status`, () => HttpResponse.json({
        success: false,
        message: 'Projects cannot be completed while modules are unfinished.',
      }, { status: 409 })),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      { route: '/projects/8', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('PRJ-2026-0001 · Portal')).toBeInTheDocument();
    statusBeforeFailure = screen.getByText('Active');
    expect(screen.getByRole('button', { name: /mark on hold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark completed/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark planned/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /mark completed/i }));
    expect(screen.getByText(/all project modules are finished/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^mark completed$/i }));

    expect(await screen.findByText('Projects cannot be completed while modules are unfinished.')).toBeInTheDocument();
    expect(statusBeforeFailure).toBeInTheDocument();
  });

  it('does not offer reopening actions on terminal projects', async () => {
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: { ...project, status: 'completed' } })),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      { route: '/projects/8', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText(/terminal and cannot be reopened/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark active/i })).not.toBeInTheDocument();
  });

  it('adds project members through nested endpoints and server-side eligible user search', async () => {
    mockSelectors();
    const calls = [];
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: project })),
      http.get(`${API_URL}/projects/8/members`, () => paginated([leadMember])),
      http.get(`${API_URL}/users`, ({ request }) => {
        const url = new URL(request.url);
        calls.push(['eligible', url.searchParams.get('role'), url.searchParams.get('search') || '']);
        return paginated([
          { id: 7, name: 'Ivy Intern', email: 'ivy@example.test', roles: ['intern'] },
          { id: 2, name: 'Sam Supervisor', email: 'sam@example.test', roles: ['supervisor'] },
        ]);
      }),
      http.post(`${API_URL}/projects/8/members`, async ({ request }) => {
        calls.push(['add', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Added.', data: { id: 9 } }, { status: 201 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId/members" element={<ProjectMembers />} />
      </Routes>,
      { route: '/projects/8/members', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('Project Lead')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /add member/i }));
    const addDialog = screen.getByRole('dialog', { name: /add project member/i });
    await userEvent.click(within(addDialog).getByLabelText(/project role/i));
    await userEvent.click(screen.getByRole('option', { name: 'Member' }));
    await userEvent.type(within(addDialog).getByLabelText(/eligible user/i), 'Ivy');
    await waitFor(() => expect(calls.some((call) => call[0] === 'eligible' && call[1] === 'intern' && call[2] === 'Ivy')).toBe(true));
    await userEvent.click(screen.getByText(/Ivy Intern/));
    await userEvent.click(screen.getByRole('button', { name: /^add member$/i }));

    await waitFor(() => expect(calls.some((call) => call[0] === 'add' && call[1].user_id === 7 && call[1].member_role === 'member')).toBe(true));
  }, 10000);

  it('edits and removes project memberships while preserving final-lead conflicts', async () => {
    mockSelectors();
    const calls = [];
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: project })),
      http.get(`${API_URL}/projects/8/members`, () => paginated([leadMember])),
      http.put(`${API_URL}/projects/8/members/4`, async ({ request }) => {
        calls.push(['edit', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Updated.', data: { ...leadMember, member_role: 'reviewer' } });
      }),
      http.delete(`${API_URL}/projects/8/members/4`, () => HttpResponse.json({
        success: false,
        message: 'The final active project lead cannot be removed.',
      }, { status: 409 })),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId/members" element={<ProjectMembers />} />
      </Routes>,
      { route: '/projects/8/members', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('Project Lead')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    const dialog = screen.getByRole('dialog', { name: /edit project membership/i });
    await userEvent.click(within(dialog).getByLabelText(/project role/i));
    await userEvent.click(screen.getByRole('option', { name: 'Reviewer' }));
    expect(screen.getByText(/final active project lead/i)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /update membership/i }));
    await waitFor(() => expect(calls.some((call) => call[0] === 'edit' && call[1].member_role === 'reviewer')).toBe(true));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /edit project membership/i })).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /^remove$/i }));
    expect(screen.getByText(/user account remains intact/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /remove member/i }));
    expect(await screen.findByText('The final active project lead cannot be removed.')).toBeInTheDocument();
  });

  it('does not label historical project memberships as deleted', async () => {
    mockSelectors();
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: project })),
      http.get(`${API_URL}/projects/8/members`, () => paginated([{ ...leadMember, left_at: '2026-07-21T08:00:00Z' }])),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId/members" element={<ProjectMembers />} />
      </Routes>,
      { route: '/projects/8/members', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText(/Historical · ended/i)).toBeInTheDocument();
    expect(screen.queryByText(/deleted/i)).not.toBeInTheDocument();
  });

  it('creates project modules through nested endpoints', async () => {
    const calls = [];
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: project })),
      http.get(`${API_URL}/projects/8/modules`, () => paginated([moduleRow])),
      http.post(`${API_URL}/projects/8/modules`, async ({ request }) => {
        calls.push(['create', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Created.', data: { id: 10 } }, { status: 201 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId/modules" element={<ProjectModules />} />
      </Routes>,
      { route: '/projects/8/modules', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('Planning')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /create module/i }));
    await userEvent.type(screen.getByLabelText(/module name/i), 'Build');
    await userEvent.type(screen.getByLabelText(/description/i), 'Implementation');
    await userEvent.click(screen.getByRole('button', { name: /^create module$/i }));

    await waitFor(() => expect(calls.some((call) => call[0] === 'create' && !('project_id' in call[1]) && !('status' in call[1]))).toBe(true));
  }, 10000);

  it('edits project modules and preserves lifecycle conflicts', async () => {
    const calls = [];
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: project })),
      http.get(`${API_URL}/projects/8/modules`, () => paginated([moduleRow])),
      http.put(`${API_URL}/projects/8/modules/5`, async ({ request }) => {
        calls.push(['edit', await request.json()]);
        return HttpResponse.json({ success: true, message: 'Updated.', data: { ...moduleRow, name: 'Planning v2' } });
      }),
      http.patch(`${API_URL}/projects/8/modules/5/status`, async ({ request }) => {
        calls.push(['status', await request.json()]);
        return HttpResponse.json({
          success: false,
          message: 'That project module status transition is not allowed.',
        }, { status: 409 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId/modules" element={<ProjectModules />} />
      </Routes>,
      { route: '/projects/8/modules', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('Planning')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    await userEvent.clear(screen.getByLabelText(/module name/i));
    await userEvent.type(screen.getByLabelText(/module name/i), 'Planning v2');
    await userEvent.click(screen.getByRole('button', { name: /save module/i }));
    await waitFor(() => expect(calls.some((call) => call[0] === 'edit' && call[1].name === 'Planning v2' && !('status' in call[1]))).toBe(true));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /edit project module/i })).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /mark completed/i }));
    expect(screen.getByText(/does not automatically change project or task status/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^mark completed$/i }));
    expect(await screen.findByText('That project module status transition is not allowed.')).toBeInTheDocument();
  });

  it('does not offer module reopening actions for terminal modules', async () => {
    server.use(
      http.get(`${API_URL}/projects/8`, () => HttpResponse.json({ success: true, message: 'Fetched.', data: project })),
      http.get(`${API_URL}/projects/8/modules`, () => paginated([{ ...moduleRow, status: 'completed' }])),
    );

    renderWithProviders(
      <Routes>
        <Route path="/projects/:projectId/modules" element={<ProjectModules />} />
      </Routes>,
      { route: '/projects/8/modules', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('Completed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark active/i })).not.toBeInTheDocument();
  });

  it('redirects the legacy global project members route to projects', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/projects" element={<div>Select a project first</div>} />
        <Route path="/projects/members" element={<Navigate to="/projects" replace />} />
      </Routes>,
      { route: '/projects/members', withAuth: true, user: adminUser },
    );

    expect(await screen.findByText('Select a project first')).toBeInTheDocument();
  });
});
