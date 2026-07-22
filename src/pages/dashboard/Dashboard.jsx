import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccountTree,
  AssignmentLate,
  AssignmentTurnedIn,
  Groups,
  People,
  PersonAdd,
  PlaylistAdd,
  Refresh,
  TaskAlt,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getManagementDashboard } from '../../services/dashboardService';
import { getProjectProgress } from '../../services/reportService';
import { getTasks } from '../../services/taskService';
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  getTodayDateOnly,
  humanizeValue,
} from '../../utils/formatters';

const messages = [
  'Great projects begin with organized teams.',
  'Progress grows when teams work together.',
  'Small, consistent steps deliver great results.',
];

const emptyDashboard = {
  summary: {},
  attendance_today: {},
  daily_updates_today: {},
  tasks: {},
  reviews: {},
  projects: {},
  performance: {},
  recent_activity: [],
};

function valueOrZero(value) {
  return value ?? 0;
}

function clampPercent(value) {
  if (value === null || value === undefined) return null;
  const number = Number(value);

  if (Number.isNaN(number)) return null;

  return Math.min(100, Math.max(0, number));
}

function getTaskDueAt(task) {
  if (task?.due_at) return task.due_at;

  const assignmentDueAt = task?.assignments?.find((assignment) => assignment?.effective_due_at || assignment?.due_at);
  return assignmentDueAt?.effective_due_at || assignmentDueAt?.due_at || null;
}

function isDueInFuture(task) {
  const dueAt = getTaskDueAt(task);
  if (!dueAt) return false;

  const dueDate = new Date(dueAt);
  return !Number.isNaN(dueDate.getTime()) && dueDate >= new Date();
}

function StatCard({ label, value, icon, loading }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Box>
          <Typography color="#719430" variant="body2" fontWeight={700}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
            {loading ? <Skeleton width={56} /> : formatNumber(valueOrZero(value))}
          </Typography>
        </Box>
        <Box
          sx={{
            color: '#719430',
            bgcolor: 'rgba(113, 148, 48, 0.14)',
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function EmptyState({ children }) {
  return (
    <Typography color="text.secondary" variant="body2">
      {children}
    </Typography>
  );
}

function MetricLine({ label, value, percent = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography fontWeight={800}>{percent ? formatPercent(value) : formatNumber(valueOrZero(value))}</Typography>
    </Stack>
  );
}

function MetricSkeletons({ count = 4 }) {
  return (
    <Stack spacing={1.2}>
      {Array.from({ length: count }, (_, index) => <Skeleton key={index} height={26} />)}
    </Stack>
  );
}

function Dashboard() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dashboardState, setDashboardState] = useState({ data: null, generatedAt: null, loading: true, error: null });
  const [deadlinesState, setDeadlinesState] = useState({ items: [], loading: true, error: null });
  const [projectsState, setProjectsState] = useState({ items: [], loading: false, error: null, skipped: false });
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const canViewReports = hasPermission('reports.view');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setDashboardState((current) => ({ ...current, loading: true, error: null }));

      try {
        const result = await getManagementDashboard({}, { signal: controller.signal });
        setDashboardState({ data: result.data || emptyDashboard, generatedAt: result.generatedAt, loading: false, error: null });
      } catch (error) {
        if (error?.type !== 'cancelled') {
          setDashboardState((current) => ({ ...current, loading: false, error }));
        }
      }
    }

    async function loadDeadlines() {
      setDeadlinesState((current) => ({ ...current, loading: true, error: null }));

      try {
        const result = await getTasks(
          {
            status: 'active',
            sort: 'due_at',
            direction: 'asc',
            per_page: 5,
            due_at_from: getTodayDateOnly(),
          },
          { signal: controller.signal },
        );
        const items = (result.data || []).filter(isDueInFuture).slice(0, 5);
        setDeadlinesState({ items, loading: false, error: null });
      } catch (error) {
        if (error?.type !== 'cancelled') {
          setDeadlinesState({ items: [], loading: false, error });
        }
      }
    }

    loadDashboard();
    loadDeadlines();

    return () => controller.abort();
  }, [refreshKey]);

  useEffect(() => {
    if (!canViewReports) {
      setProjectsState({ items: [], loading: false, error: null, skipped: true });
      return undefined;
    }

    const controller = new AbortController();

    async function loadProjects() {
      setProjectsState((current) => ({ ...current, loading: true, error: null, skipped: false }));

      try {
        const result = await getProjectProgress(
          {
            per_page: 3,
            sort: 'project_name',
            direction: 'asc',
          },
          { signal: controller.signal },
        );
        setProjectsState({ items: result.data || [], loading: false, error: null, skipped: false });
      } catch (error) {
        if (error?.type !== 'cancelled') {
          setProjectsState({ items: [], loading: false, error, skipped: false });
        }
      }
    }

    loadProjects();

    return () => controller.abort();
  }, [canViewReports, refreshKey]);

  const dashboard = dashboardState.data || emptyDashboard;
  const summary = dashboard.summary || {};
  const taskSummary = dashboard.tasks || {};
  const reviewSummary = dashboard.reviews || {};
  const attendance = dashboard.attendance_today || {};
  const dailyUpdates = dashboard.daily_updates_today || {};
  const recentActivity = dashboard.recent_activity || [];

  const stats = useMemo(() => [
    { label: 'Total Interns', value: summary.total_interns, icon: <People /> },
    { label: 'Active Interns', value: summary.active_interns, icon: <Groups /> },
    { label: 'Active Projects', value: summary.active_projects, icon: <AccountTree /> },
    { label: 'Active Tasks', value: summary.active_tasks, icon: <TaskAlt /> },
    { label: 'Pending Reviews', value: reviewSummary.pending_reviews, icon: <AssignmentTurnedIn /> },
    { label: 'Overdue Assignments', value: taskSummary.overdue_assignments, icon: <AssignmentLate /> },
  ], [reviewSummary.pending_reviews, summary.active_interns, summary.active_projects, summary.active_tasks, summary.total_interns, taskSummary.overdue_assignments]);

  const quickActions = [
    { label: 'Create User', to: '/users/create', icon: <PersonAdd />, permission: 'users.create' },
    { label: 'Create Project', to: '/projects/create', icon: <PlaylistAdd />, permission: 'projects.manage' },
    { label: 'Create Task', to: '/tasks/create', icon: <TaskAlt />, permission: 'tasks.manage' },
  ].filter((action) => hasPermission(action.permission));

  const displayName = user?.name || user?.email || 'there';

  return (
    <Box sx={{ width: '100%', maxWidth: 1450, mx: 'auto', p: { xs: 1, md: 2 } }}>
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 2,
          mb: 3,
          bgcolor: '#719430',
          width: { xs: '100%', md: '70%' },
          maxWidth: 760,
          alignSelf: 'flex-start',
        }}
      >
        <Stack direction="column" spacing={0.75} alignItems="flex-start">
          <Typography variant="h4" fontWeight={800} sx={{ color: '#ffffff' }}>
            Welcome Back, {displayName}
          </Typography>
          <Typography variant="body1" sx={{ color: '#ffffff', maxWidth: 700 }}>
            Manage interns, projects, tasks, reviews, attendance, and daily updates from one centralized platform.
          </Typography>
          {dashboardState.generatedAt && (
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Generated {formatRelativeTime(dashboardState.generatedAt)}
            </Typography>
          )}
        </Stack>
      </Paper>

      {dashboardState.error && (
        <Alert
          severity="error"
          action={(
            <Button color="inherit" size="small" startIcon={<Refresh />} onClick={() => setRefreshKey((current) => current + 1)}>
              Retry
            </Button>
          )}
          sx={{ mb: 3 }}
        >
          {dashboardState.error.message}
        </Alert>
      )}

      {!dashboardState.error && !dashboardState.loading && !dashboardState.data && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No management dashboard data is available yet.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} lg={2} key={stat.label}>
            <StatCard {...stat} loading={dashboardState.loading} />
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          mt: 3,
          mb: 3,
          bgcolor: '#ffffff',
          width: { xs: '100%', md: '70%' },
          maxWidth: 760,
          alignSelf: 'flex-start',
        }}
      >
        <Typography color="#719430" sx={{ mb: 2 }} variant="h6" fontWeight={800}>
          Quick Actions
        </Typography>
        {quickActions.length > 0 ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            {quickActions.map((action) => (
              <Button
                key={action.to}
                variant="contained"
                startIcon={action.icon}
                onClick={() => navigate(action.to)}
                sx={{ minHeight: 42 }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        ) : (
          <EmptyState>No quick actions are available for your permissions.</EmptyState>
        )}
      </Paper>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography color="#719430" sx={{ mb: 2 }} variant="h6" fontWeight={800}>
              Recent Activity
            </Typography>
            {dashboardState.loading ? (
              <Stack spacing={1.5}>
                {[0, 1, 2].map((item) => <Skeleton key={item} height={28} />)}
              </Stack>
            ) : recentActivity.length > 0 ? (
              <Stack spacing={1.5}>
                {recentActivity.map((item) => (
                  <Box key={`${item.type}-${item.occurred_at}-${item.subject?.id || item.description}`}>
                    <Typography fontWeight={700}>{item.description}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.actor?.name || 'System'} · {item.subject?.label || humanizeValue(item.type)} · {formatDateTime(item.occurred_at)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <EmptyState>No recent activity has been recorded.</EmptyState>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
              <Typography color="#719430" variant="h6" fontWeight={800}>
                Upcoming Deadlines
              </Typography>
              {deadlinesState.loading && <CircularProgress size={20} />}
            </Stack>
            {deadlinesState.error ? (
              <Alert severity="warning">{deadlinesState.error.message}</Alert>
            ) : deadlinesState.loading ? (
              <Stack spacing={1.5}>
                {[0, 1, 2].map((item) => <Skeleton key={item} height={34} />)}
              </Stack>
            ) : deadlinesState.items.length > 0 ? (
              <Stack spacing={1.5}>
                {deadlinesState.items.map((task) => {
                  const dueAt = getTaskDueAt(task);
                  const overdue = task.is_overdue || (dueAt && new Date(dueAt) < new Date());

                  return (
                    <Box key={task.id || task.code}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Box>
                          <Typography fontWeight={800}>{task.title || task.code}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.project?.name || 'No project'} · {formatDateTime(dueAt)}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {overdue && <Chip label="Overdue" size="small" color="error" />}
                          {task.priority && <Chip label={humanizeValue(task.priority)} size="small" />}
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <EmptyState>No upcoming deadlines were found.</EmptyState>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Typography color="#719430" variant="h6" fontWeight={800}>
                Project Overview
              </Typography>
              {projectsState.loading && <CircularProgress size={20} />}
            </Stack>
            {projectsState.skipped ? (
              <EmptyState>Project reporting is unavailable for your permissions.</EmptyState>
            ) : projectsState.error ? (
              <Alert severity="warning">{projectsState.error.message}</Alert>
            ) : projectsState.loading ? (
              <Stack spacing={2.5}>
                {[0, 1, 2].map((item) => <Skeleton key={item} height={70} />)}
              </Stack>
            ) : projectsState.items.length > 0 ? (
              <Stack spacing={2.5}>
                {projectsState.items.map((project) => {
                  const completionRate = clampPercent(project.task_completion_rate);
                  const projectId = project.project?.id;

                  return (
                    <Box key={project.project?.id || project.project_code || project.project_name}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Box>
                          <Typography
                            fontWeight={800}
                            component={projectId ? RouterLink : 'p'}
                            to={projectId ? `/projects/${projectId}` : undefined}
                            sx={{ color: 'inherit', textDecoration: projectId ? 'none' : 'inherit' }}
                          >
                            {project.project_name || project.project?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {project.project_code || project.project?.code || 'No code'} · {formatNumber(valueOrZero(project.active_member_count))} active members
                          </Typography>
                        </Box>
                        <Chip label={humanizeValue(project.status)} size="small" color={project.status === 'active' ? 'primary' : 'default'} />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Active tasks: {formatNumber(valueOrZero(project.tasks_active))}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed tasks: {formatNumber(valueOrZero(project.tasks_completed))}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overdue tasks: {formatNumber(valueOrZero(project.tasks_overdue))}
                        </Typography>
                      </Stack>
                      {completionRate === null ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Task completion: No active or completed tasks
                        </Typography>
                      ) : (
                        <>
                          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Task completion
                            </Typography>
                            <Typography variant="body2" fontWeight={800}>
                              {formatPercent(completionRate)}
                            </Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={completionRate} sx={{ mt: 0.75, borderRadius: 2, height: 7 }} />
                        </>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <EmptyState>No project progress rows are available.</EmptyState>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography color="#719430" sx={{ mb: 2 }} variant="h6" fontWeight={800}>
              Team Overview
            </Typography>
            {dashboardState.loading ? <MetricSkeletons /> : (
              <Stack spacing={1.3}>
                <MetricLine label="Active Interns" value={summary.active_interns} />
                <MetricLine label="Pending Interns" value={summary.pending_interns} />
                <MetricLine label="Suspended Interns" value={summary.suspended_interns} />
                <MetricLine label="Completed Interns" value={summary.completed_interns} />
              </Stack>
            )}

            <Divider sx={{ my: 2.5 }} />

            <Typography color="#719430" sx={{ mb: 2 }} variant="h6" fontWeight={800}>
              Attendance Today
            </Typography>
            {dashboardState.loading ? <MetricSkeletons count={6} /> : (
              <Stack spacing={1.2}>
                <MetricLine label="Expected Interns" value={attendance.expected_interns} />
                <MetricLine label="Recorded" value={attendance.recorded} />
                <MetricLine label="Present" value={attendance.present} />
                <MetricLine label="Late" value={attendance.late} />
                <MetricLine label="Remote" value={attendance.remote} />
                <MetricLine label="Attendance Rate" value={attendance.attendance_rate} percent />
              </Stack>
            )}

            <Divider sx={{ my: 2.5 }} />

            <Typography color="#719430" sx={{ mb: 2 }} variant="h6" fontWeight={800}>
              Daily Updates Today
            </Typography>
            {dashboardState.loading ? <MetricSkeletons count={6} /> : (
              <Stack spacing={1.2}>
                <MetricLine label="Expected Updates" value={dailyUpdates.expected_updates} />
                <MetricLine label="Submitted" value={dailyUpdates.submitted} />
                <MetricLine label="Submitted On Time" value={dailyUpdates.submitted_on_time} />
                <MetricLine label="Submitted Late" value={dailyUpdates.submitted_late} />
                <MetricLine label="Missing After Deadline" value={dailyUpdates.missing_after_deadline} />
                <MetricLine label="Compliance Rate" value={dailyUpdates.compliance_rate} percent />
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 2, mt: 3, bgcolor: '#ffffff', textAlign: 'center' }}>
        <Typography fontWeight={800} color="#719430">"{messages[messageIndex]}"</Typography>
        <Typography sx={{ mt: 1.5 }} color="#000000">
          Keep project tasks updated regularly to improve collaboration and track progress accurately.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Dashboard;
