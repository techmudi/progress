import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import ServerPagination from '../../components/common/ServerPagination';
import ProjectMemberUserSelect from '../../components/projects/ProjectMemberUserSelect';
import TrackSelect from '../../components/selects/TrackSelect';
import FormError from '../../components/forms/FormError';
import { useAuth } from '../../context/AuthContext';
import { useServerCollection } from '../../hooks/useServerCollection';
import {
  addProjectMember,
  getProject,
  getProjectMembers,
  removeProjectMember,
  updateProjectMember,
} from '../../services/projectService';
import { fieldsFromApiError, firstFieldError, hasFieldError } from '../../utils/formErrors';
import { formatDateTime, getTodayDateOnly } from '../../utils/formatters';
import {
  PROJECT_MEMBER_ROLE_OPTIONS,
  ROLE_OPTIONS,
  projectMemberRoleLabel,
  rolesLabel,
} from '../../utils/presentation';

const activeOnlyOptions = [
  { value: 'true', label: 'Active memberships' },
  { value: 'false', label: 'Active and historical' },
];

const defaultMemberForm = {
  user_id: '',
  member_role: 'member',
  joined_at: getTodayDateOnly(),
};

function ProjectMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [project, setProject] = useState(null);
  const [projectError, setProjectError] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [memberDialog, setMemberDialog] = useState(null);
  const [formValues, setFormValues] = useState(defaultMemberForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removeAction, setRemoveAction] = useState(null);
  const [removeError, setRemoveError] = useState('');
  const fetchMembers = useCallback(
    (params, signal) => getProjectMembers(projectId, params, signal),
    [projectId],
  );
  const collection = useServerCollection({
    fetcher: fetchMembers,
    initialFilters: { active_only: 'true' },
    initialSort: '',
  });
  const canManage = hasPermission('projects.manage');
  const canViewTracks = hasPermission('tracks.view');
  const apiErrors = fieldsFromApiError(formError);
  const excludedUserIds = useMemo(
    () => collection.items
      .filter((member) => !member.left_at)
      .map((member) => member.user?.id)
      .filter(Boolean),
    [collection.items],
  );

  const loadProject = async (signal) => {
    setProjectLoading(true);
    setProjectError(null);

    try {
      const result = await getProject(projectId, signal);
      setProject(result.project);
    } catch (caught) {
      if (caught?.type !== 'cancelled') {
        setProjectError(caught);
      }
    } finally {
      setProjectLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadProject(controller.signal);
    return () => controller.abort();
  }, [projectId]);

  const openAddDialog = () => {
    setMemberDialog({ type: 'add' });
    setFormValues(defaultMemberForm);
    setFormError(null);
  };

  const openEditDialog = (member) => {
    setMemberDialog({ type: 'edit', member });
    setFormValues({
      user_id: member.user?.id || '',
      member_role: member.member_role,
      joined_at: '',
    });
    setFormError(null);
  };

  const closeDialog = () => {
    if (saving) return;
    setMemberDialog(null);
    setFormError(null);
  };

  const submitMember = async () => {
    setSaving(true);
    setFormError(null);

    try {
      if (memberDialog.type === 'add') {
        await addProjectMember(projectId, formValues);
      } else {
        await updateProjectMember(projectId, memberDialog.member.id, {
          member_role: formValues.member_role,
        });
      }
      setMemberDialog(null);
      collection.refresh();
      loadProject();
    } catch (caught) {
      setFormError(caught);
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!removeAction) return;

    setSaving(true);
    setRemoveError('');

    try {
      await removeProjectMember(projectId, removeAction.member.id);
      setRemoveAction(null);
      collection.refresh();
      loadProject();
    } catch (caught) {
      setRemoveError(caught.message || 'Unable to remove this project member.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: 'user', headerName: 'Name', render: (value) => value?.name || '-' },
    { field: 'email', headerName: 'Email', render: (_value, row) => row.user?.email || '-' },
    { field: 'global_roles', headerName: 'Global Roles', render: (value) => rolesLabel(value || []) },
    { field: 'member_role', headerName: 'Project Role', render: (value) => projectMemberRoleLabel(value) },
    { field: 'joined_at', headerName: 'Joined', render: (value) => formatDateTime(value) },
    { field: 'left_at', headerName: 'Membership State', render: (value) => value ? `Historical · ended ${formatDateTime(value)}` : 'Active membership' },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {canManage && !row.left_at && (
            <Button size="small" variant="outlined" onClick={() => openEditDialog(row)}>
              Edit
            </Button>
          )}
          {canManage && !row.left_at && (
            <Button size="small" color="warning" variant="outlined" onClick={() => setRemoveAction({ member: row })}>
              Remove
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Project Members</Typography>
            <Typography color="text.secondary">
              {projectLoading ? 'Loading project...' : project?.name || `Project ${projectId}`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => navigate(`/projects/${projectId}`)}>Project Detail</Button>
            {canManage && <Button variant="contained" onClick={openAddDialog}>Add Member</Button>}
          </Stack>
        </Stack>

        {projectError && <ApiState error={projectError} onRetry={() => loadProject()} />}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <SearchBar
            label="Search members"
            placeholder="Name, email, phone, or intern number"
            value={collection.searchInput}
            onChange={(event) => collection.setSearchInput(event.target.value)}
          />
          <TextField
            select
            size="small"
            label="Project role"
            value={collection.query.member_role || ''}
            onChange={(event) => collection.setFilter('member_role', event.target.value)}
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="">All project roles</MenuItem>
            {PROJECT_MEMBER_ROLE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            label="Global role"
            value={collection.query.global_role || ''}
            onChange={(event) => collection.setFilter('global_role', event.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="">All global roles</MenuItem>
            {ROLE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            label="Membership state"
            value={collection.query.active_only ?? 'true'}
            onChange={(event) => collection.setFilter('active_only', event.target.value)}
            sx={{ minWidth: 210 }}
          >
            {activeOnlyOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          {canViewTracks && (
            <Box sx={{ minWidth: 220 }}>
              <TrackSelect
                label="Intern track"
                value={collection.query.track_id || ''}
                onChange={(event) => collection.setFilter('track_id', event.target.value)}
              />
            </Box>
          )}
        </Stack>

        {collection.refreshing && <Alert severity="info" sx={{ mb: 2 }}>Refreshing project members...</Alert>}
        {collection.error && <ApiState error={collection.error} onRetry={collection.refresh} />}
        {!collection.loading && !collection.error && collection.items.length === 0 && (
          <EmptyState
            title="No project members found"
            message="Adjust the filters or add a member when you have permission."
            actionLabel={canManage ? 'Add Member' : undefined}
            onAction={canManage ? openAddDialog : undefined}
          />
        )}
        {(collection.loading || collection.items.length > 0) && !collection.error && (
          <>
            <DataTable
              ariaLabel="Project members table"
              columns={columns}
              rows={collection.loading ? [] : collection.items}
              loading={collection.loading}
            />
            <ServerPagination
              meta={collection.meta}
              disabled={collection.loading}
              onPageChange={collection.setPage}
              onPerPageChange={collection.setPerPage}
            />
          </>
        )}
      </Paper>

      <Dialog open={Boolean(memberDialog)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{memberDialog?.type === 'add' ? 'Add project member' : 'Edit project membership'}</DialogTitle>
        <DialogContent>
          <FormError error={formError} fallback="Unable to save project member." />
          {memberDialog?.type === 'edit' && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {memberDialog.member.user?.name || 'This user'} stays attached to this membership. Only the project role can be changed.
            </Typography>
          )}
          {memberDialog?.type === 'edit' && memberDialog.member.member_role === 'lead' && formValues.member_role !== 'lead' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              If this is the final active project lead, the backend will block the role change.
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Project role"
              value={formValues.member_role}
              onChange={(event) => setFormValues((current) => ({ ...current, member_role: event.target.value, user_id: memberDialog?.type === 'add' ? '' : current.user_id }))}
              error={hasFieldError(apiErrors, 'member_role')}
              helperText={firstFieldError(apiErrors, 'member_role')}
              fullWidth
              required
            >
              {PROJECT_MEMBER_ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            {memberDialog?.type === 'add' ? (
              <ProjectMemberUserSelect
                memberRole={formValues.member_role}
                value={formValues.user_id}
                onChange={(userId) => setFormValues((current) => ({ ...current, user_id: userId }))}
                excludedUserIds={excludedUserIds}
                error={apiErrors}
                required
              />
            ) : (
              <TextField
                label="Member"
                value={`${memberDialog?.member?.user?.name || 'Unknown user'} · ${memberDialog?.member?.user?.email || 'No email'}`}
                fullWidth
                disabled
              />
            )}
            {memberDialog?.type === 'add' && (
              <TextField
                label="Joined date"
                type="date"
                value={formValues.joined_at}
                onChange={(event) => setFormValues((current) => ({ ...current, joined_at: event.target.value }))}
                error={hasFieldError(apiErrors, 'joined_at')}
                helperText={firstFieldError(apiErrors, 'joined_at')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={submitMember} disabled={saving || (memberDialog?.type === 'add' && !formValues.user_id)}>
            {saving ? 'Saving...' : memberDialog?.type === 'add' ? 'Add Member' : 'Update Membership'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(removeAction)}
        title="Remove project member"
        message={`Remove ${removeAction?.member?.user?.name || 'this user'} from this project? The user account remains intact. If this is the final active project lead, the backend will block the removal.`}
        confirmLabel="Remove Member"
        confirmColor="warning"
        confirming={saving}
        error={removeError}
        onClose={() => !saving && setRemoveAction(null)}
        onConfirm={confirmRemove}
      />
    </Box>
  );
}

export default ProjectMembers;
