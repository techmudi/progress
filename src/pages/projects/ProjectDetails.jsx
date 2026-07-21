import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import AppLoading from '../../components/common/AppLoading';
import StatusChip from '../../components/common/StatusChip';
import FormError from '../../components/forms/FormError';
import { useAuth } from '../../context/AuthContext';
import { getProject, updateProjectStatus } from '../../services/projectService';
import { formatDateOnly, formatDateTime, getTodayDateOnly } from '../../utils/formatters';
import {
  isTerminalProjectStatus,
  projectMemberRoleLabel,
  projectModuleStatusLabel,
  projectPriorityLabel,
  projectStatusLabel,
  validNextProjectStatuses,
} from '../../utils/presentation';

function DetailLine({ label, children }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Box sx={{ fontWeight: 700, textAlign: { xs: 'left', sm: 'right' } }}>{children}</Box>
    </Stack>
  );
}

function statusActionMessage(project, targetStatus) {
  if (targetStatus === 'completed') {
    return 'Complete this project only when all project modules are finished. The backend will block completion while modules are unfinished.';
  }

  if (targetStatus === 'cancelled') {
    return 'Cancel this project and close it as terminal. Memberships, modules, and tasks are not deleted.';
  }

  if (targetStatus === 'active') {
    return 'Activate this project. An active admin or supervisor project lead is required.';
  }

  if (targetStatus === 'on_hold') {
    return 'Put this active project on hold. It can be returned to active later.';
  }

  return `Change this project from ${projectStatusLabel(project.status)} to ${projectStatusLabel(targetStatus)}.`;
}

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [statusValues, setStatusValues] = useState({ start_date: '', actual_end_date: '', closure_reason: '' });
  const [statusError, setStatusError] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const canManage = hasPermission('projects.manage');

  const loadProject = async (signal) => {
    setLoading(true);
    setLoadError(null);

    try {
      const result = await getProject(projectId, signal);
      setProject(result.project);
    } catch (caught) {
      if (caught?.type !== 'cancelled') {
        setLoadError(caught);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadProject(controller.signal);
    return () => controller.abort();
  }, [projectId]);

  const openStatusAction = (status) => {
    setStatusAction(status);
    setStatusValues({
      start_date: project.start_date || getTodayDateOnly(),
      actual_end_date: project.actual_end_date || getTodayDateOnly(),
      closure_reason: project.closure_reason || '',
    });
    setStatusError(null);
  };

  const closeStatusAction = () => {
    if (savingStatus) return;
    setStatusAction(null);
    setStatusError(null);
  };

  const submitStatus = async () => {
    if (!statusAction) return;

    if (statusAction === 'active' && !project.start_date && !statusValues.start_date) {
      setStatusError({ message: 'The start date is required when activating a project.' });
      return;
    }

    if ((statusAction === 'completed' || statusAction === 'cancelled') && !statusValues.actual_end_date) {
      setStatusError({ message: 'The actual end date is required for this project status.' });
      return;
    }

    setSavingStatus(true);
    setStatusError(null);

    try {
      const result = await updateProjectStatus(projectId, {
        status: statusAction,
        start_date: statusAction === 'active' ? statusValues.start_date : '',
        actual_end_date: statusAction === 'completed' || statusAction === 'cancelled' ? statusValues.actual_end_date : '',
        closure_reason: statusAction === 'cancelled' ? statusValues.closure_reason : '',
      });
      setProject(result.project);
      setStatusAction(null);
    } catch (caught) {
      setStatusError(caught);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return <AppLoading message="Loading project..." />;
  }

  if (loadError) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <ApiState error={loadError} onRetry={() => loadProject()} />
      </Paper>
    );
  }

  const nextStatuses = validNextProjectStatuses(project.status);

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Project Detail</Typography>
            <Typography color="text.secondary">{project.code || 'Code pending'} · {project.name}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => navigate('/projects')}>Back</Button>
            {canManage && <Button variant="contained" onClick={() => navigate(`/projects/${project.id}/edit`)}>Edit Project</Button>}
            <Button variant="outlined" onClick={() => navigate(`/projects/${project.id}/members`)}>Members</Button>
            <Button variant="outlined" onClick={() => navigate(`/projects/${project.id}/modules`)}>Modules</Button>
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          <DetailLine label="Project code">{project.code || 'Not available'}</DetailLine>
          <DetailLine label="Name">{project.name}</DetailLine>
          <DetailLine label="Slug">{project.slug}</DetailLine>
          <DetailLine label="Status"><StatusChip status={project.status} type="project" /></DetailLine>
          <DetailLine label="Priority">{projectPriorityLabel(project.priority)}</DetailLine>
          <DetailLine label="Start date">{formatDateOnly(project.start_date)}</DetailLine>
          <DetailLine label="Expected end date">{formatDateOnly(project.expected_end_date)}</DetailLine>
          <DetailLine label="Actual end date">{formatDateOnly(project.actual_end_date)}</DetailLine>
          <DetailLine label="Created by">{project.creator?.name || 'Not available'}</DetailLine>
          <DetailLine label="Active members">{project.active_member_count ?? project.members?.length ?? 0}</DetailLine>
          <DetailLine label="Modules">{project.module_count ?? project.modules?.length ?? 0}</DetailLine>
          <DetailLine label="Created">{formatDateTime(project.created_at)}</DetailLine>
          <DetailLine label="Updated">{formatDateTime(project.updated_at)}</DetailLine>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Description</Typography>
        <Typography color="text.secondary">{project.description || 'No description has been added.'}</Typography>

        {project.closure_reason && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Closure Reason</Typography>
            <Typography color="text.secondary">{project.closure_reason}</Typography>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Active Member Summary</Typography>
            {project.members?.length ? (
              <Stack spacing={1}>
                {project.members.slice(0, 5).map((member) => (
                  <Typography key={member.id} color="text.secondary">
                    {member.user?.name || 'Unknown user'} · {projectMemberRoleLabel(member.member_role)}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No active members are assigned.</Typography>
            )}
            <Button component={RouterLink} to={`/projects/${project.id}/members`} sx={{ mt: 1.5 }}>
              Manage Members
            </Button>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Module Summary</Typography>
            {project.modules?.length ? (
              <Stack spacing={1}>
                {project.modules.slice(0, 5).map((module) => (
                  <Typography key={module.id} color="text.secondary">
                    {module.sort_order}. {module.name} · {projectModuleStatusLabel(module.status)}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No modules have been created.</Typography>
            )}
            <Button component={RouterLink} to={`/projects/${project.id}/modules`} sx={{ mt: 1.5 }}>
              Manage Modules
            </Button>
          </Box>
        </Stack>

        {canManage && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Lifecycle</Typography>
            {isTerminalProjectStatus(project.status) ? (
              <Typography color="text.secondary">This project is terminal and cannot be reopened here.</Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {nextStatuses.map((status) => (
                  <Button key={status} variant="outlined" onClick={() => openStatusAction(status)}>
                    Mark {projectStatusLabel(status)}
                  </Button>
                ))}
              </Stack>
            )}
          </>
        )}
      </Paper>

      <Dialog open={Boolean(statusAction)} onClose={closeStatusAction} fullWidth maxWidth="sm">
        <DialogTitle>Mark project {projectStatusLabel(statusAction)}</DialogTitle>
        <DialogContent>
          <FormError error={statusError} fallback="Unable to update project status." />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {statusActionMessage(project, statusAction)}
          </Typography>
          {statusAction === 'active' && !project.start_date && (
            <TextField
              label="Start date"
              type="date"
              value={statusValues.start_date}
              onChange={(event) => setStatusValues((current) => ({ ...current, start_date: event.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          )}
          {(statusAction === 'completed' || statusAction === 'cancelled') && (
            <Stack spacing={2}>
              <TextField
                label="Actual end date"
                type="date"
                value={statusValues.actual_end_date}
                onChange={(event) => setStatusValues((current) => ({ ...current, actual_end_date: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              {statusAction === 'cancelled' && (
                <TextField
                  label="Closure reason"
                  value={statusValues.closure_reason}
                  onChange={(event) => setStatusValues((current) => ({ ...current, closure_reason: event.target.value }))}
                  multiline
                  rows={3}
                  fullWidth
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusAction} disabled={savingStatus}>Cancel</Button>
          <Button variant="contained" color={statusAction === 'cancelled' ? 'warning' : 'primary'} onClick={submitStatus} disabled={savingStatus}>
            {savingStatus ? 'Saving...' : `Mark ${projectStatusLabel(statusAction)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectDetails;
