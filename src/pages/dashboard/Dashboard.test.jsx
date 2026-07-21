import { describe, expect, it } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { API_URL, server } from '../../test/server';
import { adminUser, renderWithProviders } from '../../test/testUtils';

const managementDashboardData = {
  summary: {
    total_interns: 12,
    active_interns: 9,
    pending_interns: 2,
    suspended_interns: 1,
    completed_interns: 0,
    active_projects: 4,
    active_tasks: 8,
    active_assignments: 11,
  },
  attendance_today: {
    expected_interns: 9,
    recorded: 8,
    present: 6,
    late: 1,
    remote: 1,
    absent: 0,
    excused: 1,
    not_finalized: 1,
    attendance_rate: 100,
  },
  daily_updates_today: {
    expected_updates: 8,
    submitted: 6,
    submitted_on_time: 5,
    submitted_late: 1,
    missing_after_deadline: 2,
    not_yet_due: 0,
    compliance_rate: 75,
  },
  tasks: {
    draft_tasks: 1,
    active_tasks: 8,
    completed_in_period: 3,
    cancelled_in_period: 0,
    unassigned_tasks: 1,
    overdue_tasks: 2,
    open_assignments: 9,
    overdue_assignments: 3,
    ready_for_completion: 1,
    due_within_7_days: 2,
  },
  reviews: {
    pending_reviews: 5,
    reviews_completed_in_period: 7,
    needs_changes_in_period: 1,
    approved_in_period: 5,
    rejected_in_period: 1,
    average_overall_score: 84,
    average_review_turnaround_hours: 6,
  },
  projects: {},
  performance: {},
  recent_activity: [
    {
      type: 'task_status_changed',
      occurred_at: '2026-07-20T08:00:00Z',
      actor: { id: 7, name: 'Dana Admin' },
      subject: { type: 'task', id: 44, label: 'TASK-44' },
      description: 'Task status changed to active.',
    },
  ],
};

const upcomingTasks = [
  {
    id: 101,
    code: 'TASK-101',
    title: 'Submit weekly summary',
    priority: 'high',
    due_at: '2099-07-25T12:00:00Z',
    is_overdue: false,
    project: { id: 11, name: 'Onboarding Portal' },
  },
  {
    id: 102,
    code: 'TASK-102',
    title: 'Archived old deadline',
    priority: 'low',
    due_at: '2020-01-01T12:00:00Z',
    is_overdue: true,
    project: { id: 12, name: 'Old Project' },
  },
];

const projectProgressRows = [
  {
    project: { id: 11, name: 'Alpha Project', code: 'ALPHA' },
    project_name: 'Alpha Project',
    project_code: 'ALPHA',
    status: 'active',
    active_member_count: 3,
    tasks_active: 2,
    tasks_completed: 2,
    tasks_overdue: 1,
    task_completion_rate: 50,
  },
  {
    project: { id: 12, name: 'Beta Project', code: 'BETA' },
    project_name: 'Beta Project',
    project_code: 'BETA',
    status: 'planned',
    active_member_count: 0,
    tasks_active: 0,
    tasks_completed: 0,
    tasks_overdue: 0,
    task_completion_rate: null,
  },
];

function mockDashboard(data = managementDashboardData, delayMs = 0) {
  server.use(
    http.get(`${API_URL}/dashboard/management`, async () => {
      if (delayMs) await delay(delayMs);

      return HttpResponse.json({
        success: true,
        message: 'Management dashboard fetched successfully.',
        data,
        filters: {},
        generated_at: '2026-07-20T09:00:00Z',
      });
    }),
  );
}

function mockUpcomingTasks(data = upcomingTasks) {
  server.use(
    http.get(`${API_URL}/tasks`, () => HttpResponse.json({
      success: true,
      message: 'Tasks fetched successfully.',
      data,
      meta: { total: data.length },
      links: { next: null },
    })),
  );
}

function mockProjectProgress(data = projectProgressRows) {
  server.use(
    http.get(`${API_URL}/reports/project-progress`, () => HttpResponse.json({
      success: true,
      message: 'Project progress report generated successfully.',
      report: 'project-progress',
      contract_version: '1.0',
      data,
      summary: { project_count: data.length },
      filters: {},
      meta: { total: data.length },
      links: { next: null },
      generated_at: '2026-07-20T09:00:00Z',
    })),
  );
}

describe('Dashboard', () => {
  it('shows loading placeholders instead of fake zero metrics', () => {
    mockDashboard(managementDashboardData, 100);
    mockUpcomingTasks([]);
    mockProjectProgress([]);

    renderWithProviders(<Dashboard />, { withAuth: true, user: adminUser });

    expect(screen.getByText(/Welcome Back, Ada Manager/i)).toBeInTheDocument();
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
  });

  it('renders management metrics, activity, deadlines, and project progress from APIs', async () => {
    mockDashboard();
    mockUpcomingTasks();
    mockProjectProgress();

    renderWithProviders(<Dashboard />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('Total Interns')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Overdue Assignments')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Task status changed to active.')).toBeInTheDocument();
    expect(await screen.findByText('Submit weekly summary')).toBeInTheDocument();
    expect(screen.getByText(/Onboarding Portal/)).toBeInTheDocument();
    expect(screen.queryByText('Archived old deadline')).not.toBeInTheDocument();
    expect(await screen.findByText('Alpha Project')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Task completion: No active or completed tasks')).toBeInTheDocument();
    expect(screen.getByText('Attendance Today')).toBeInTheDocument();
    expect(screen.getByText('Daily Updates Today')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /view reports/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/System Status/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Developers/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/notification/i)).not.toBeInTheDocument();
  });

  it('shows empty states and skips report calls when reports.view is missing', async () => {
    const userWithoutReports = {
      ...adminUser,
      permissions: adminUser.permissions.filter((permission) => permission !== 'reports.view'),
    };
    mockDashboard({ ...managementDashboardData, recent_activity: [] });
    mockUpcomingTasks([]);

    renderWithProviders(<Dashboard />, { withAuth: true, user: userWithoutReports });

    expect(await screen.findByText('No recent activity has been recorded.')).toBeInTheDocument();
    expect(screen.getByText('No upcoming deadlines were found.')).toBeInTheDocument();
    expect(screen.getByText('Project reporting is unavailable for your permissions.')).toBeInTheDocument();
  });

  it('keeps the management dashboard visible when project report authorization fails', async () => {
    mockDashboard();
    mockUpcomingTasks([]);
    server.use(
      http.get(`${API_URL}/reports/project-progress`, () => HttpResponse.json({
        success: false,
        message: 'This token cannot read reports.',
      }, { status: 403 })),
    );

    renderWithProviders(<Dashboard />, { withAuth: true, user: adminUser });

    expect(await screen.findByText('Total Interns')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('This token cannot read reports.')).toBeInTheDocument());
  });
});
