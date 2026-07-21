import { useCallback, useEffect, useState } from 'react';
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
import StatusChip from '../../components/common/StatusChip';
import FormError from '../../components/forms/FormError';
import { useAuth } from '../../context/AuthContext';
import { useServerCollection } from '../../hooks/useServerCollection';
import {
  createProjectModule,
  getProject,
  getProjectModules,
  updateProjectModule,
  updateProjectModuleStatus,
} from '../../services/projectService';
import { fieldsFromApiError, firstFieldError, hasFieldError } from '../../utils/formErrors';
import { formatDateTime } from '../../utils/formatters';
import {
  PROJECT_MODULE_STATUS_OPTIONS,
  isTerminalProjectModuleStatus,
  projectModuleStatusLabel,
  validNextProjectModuleStatuses,
} from '../../utils/presentation';

const defaultModuleForm = {
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
};

function ProjectModules() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [project, setProject] = useState(null);
  const [projectError, setProjectError] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [moduleDialog, setModuleDialog] = useState(null);
  const [formValues, setFormValues] = useState(defaultModuleForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [statusError, setStatusError] = useState('');
  const fetchModules = useCallback(
    (params, signal) => getProjectModules(projectId, params, signal),
    [projectId],
  );
  const collection = useServerCollection({
    fetcher: fetchModules,
    initialSort: 'sort_order',
    initialDirection: 'asc',
  });
  const canManage = hasPermission('projects.manage');
  const apiErrors = fieldsFromApiError(formError);

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

  const openCreateDialog = () => {
    setModuleDialog({ type: 'create' });
    setFormValues(defaultModuleForm);
    setFormError(null);
  };

  const openEditDialog = (module) => {
    setModuleDialog({ type: 'edit', module });
    setFormValues({
      name: module.name || '',
      slug: module.slug || '',
      description: module.description || '',
      sort_order: module.sort_order ?? 0,
    });
    setFormError(null);
  };

  const closeModuleDialog = () => {
    if (saving) return;
    setModuleDialog(null);
    setFormError(null);
  };

  const setFormField = (name, value) => {
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const submitModule = async () => {
    setSaving(true);
    setFormError(null);

    try {
      if (moduleDialog.type === 'create') {
        await createProjectModule(projectId, formValues);
      } else {
        await updateProjectModule(projectId, moduleDialog.module.id, formValues);
      }
      setModuleDialog(null);
      collection.refresh();
      loadProject();
    } catch (caught) {
      setFormError(caught);
    } finally {
      setSaving(false);
    }
  };

  const confirmStatus = async () => {
    if (!statusAction) return;

    setSaving(true);
    setStatusError('');

    try {
      await updateProjectModuleStatus(projectId, statusAction.module.id, { status: statusAction.status });
      setStatusAction(null);
      collection.refresh();
      loadProject();
    } catch (caught) {
      setStatusError(caught.message || 'Unable to update module status.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Module', sortable: true },
    { field: 'slug', headerName: 'Slug' },
    { field: 'description', headerName: 'Description', render: (value) => value || '-' },
    { field: 'sort_order', headerName: 'Sort Order', sortable: true },
    { field: 'status', headerName: 'Status', sortable: true, render: (value) => <StatusChip status={value} type="module" /> },
    { field: 'created_at', headerName: 'Created', sortable: true, render: (value) => formatDateTime(value) },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {canManage && !isTerminalProjectModuleStatus(row.status) && (
            <Button size="small" variant="outlined" onClick={() => openEditDialog(row)}>
              Edit
            </Button>
          )}
          {canManage && validNextProjectModuleStatuses(row.status).map((status) => (
            <Button key={status} size="small" variant="outlined" color={status === 'cancelled' ? 'warning' : 'primary'} onClick={() => setStatusAction({ module: row, status })}>
              Mark {projectModuleStatusLabel(status)}
            </Button>
          ))}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Project Modules</Typography>
            <Typography color="text.secondary">
              {projectLoading ? 'Loading project...' : project?.name || `Project ${projectId}`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => navigate(`/projects/${projectId}`)}>Project Detail</Button>
            {canManage && <Button variant="contained" onClick={openCreateDialog}>Create Module</Button>}
          </Stack>
        </Stack>

        {projectError && <ApiState error={projectError} onRetry={() => loadProject()} />}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <SearchBar
            label="Search modules"
            placeholder="Name, slug, or description"
            value={collection.searchInput}
            onChange={(event) => collection.setSearchInput(event.target.value)}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={collection.query.status || ''}
            onChange={(event) => collection.setFilter('status', event.target.value)}
            sx={{ minWidth: 180 }}
          >
            {PROJECT_MODULE_STATUS_OPTIONS.map((option) => <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
        </Stack>

        {collection.refreshing && <Alert severity="info" sx={{ mb: 2 }}>Refreshing project modules...</Alert>}
        {collection.error && <ApiState error={collection.error} onRetry={collection.refresh} />}
        {!collection.loading && !collection.error && collection.items.length === 0 && (
          <EmptyState
            title="No project modules found"
            message="Create the first module when you have permission."
            actionLabel={canManage ? 'Create Module' : undefined}
            onAction={canManage ? openCreateDialog : undefined}
          />
        )}
        {(collection.loading || collection.items.length > 0) && !collection.error && (
          <>
            <DataTable
              ariaLabel="Project modules table"
              columns={columns}
              rows={collection.loading ? [] : collection.items}
              loading={collection.loading}
              sortField={collection.query.sort}
              sortDirection={collection.query.direction}
              onSort={collection.setSort}
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

      <Dialog open={Boolean(moduleDialog)} onClose={closeModuleDialog} fullWidth maxWidth="sm">
        <DialogTitle>{moduleDialog?.type === 'create' ? 'Create project module' : 'Edit project module'}</DialogTitle>
        <DialogContent>
          <FormError error={formError} fallback="Unable to save project module." />
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Module name"
              value={formValues.name}
              onChange={(event) => setFormField('name', event.target.value)}
              error={hasFieldError(apiErrors, 'name')}
              helperText={firstFieldError(apiErrors, 'name')}
              fullWidth
              required
            />
            <TextField
              label="Slug"
              value={formValues.slug}
              onChange={(event) => setFormField('slug', event.target.value)}
              error={hasFieldError(apiErrors, 'slug')}
              helperText={firstFieldError(apiErrors, 'slug') || 'Leave blank on create to let the server generate it from the module name.'}
              fullWidth
            />
            <TextField
              label="Sort order"
              type="number"
              value={formValues.sort_order}
              onChange={(event) => setFormField('sort_order', event.target.value === '' ? '' : Number(event.target.value))}
              error={hasFieldError(apiErrors, 'sort_order')}
              helperText={firstFieldError(apiErrors, 'sort_order')}
              inputProps={{ min: 0 }}
              fullWidth
            />
            <TextField
              label="Description"
              value={formValues.description}
              onChange={(event) => setFormField('description', event.target.value)}
              error={hasFieldError(apiErrors, 'description')}
              helperText={firstFieldError(apiErrors, 'description')}
              multiline
              rows={4}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModuleDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={submitModule} disabled={saving}>
            {saving ? 'Saving...' : moduleDialog?.type === 'create' ? 'Create Module' : 'Save Module'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(statusAction)}
        title={`Mark module ${projectModuleStatusLabel(statusAction?.status)}`}
        message={`Mark ${statusAction?.module?.name || 'this module'} ${projectModuleStatusLabel(statusAction?.status)}? This does not automatically change project or task status.`}
        confirmLabel={`Mark ${projectModuleStatusLabel(statusAction?.status)}`}
        confirmColor={statusAction?.status === 'cancelled' ? 'warning' : 'primary'}
        confirming={saving}
        error={statusError}
        onClose={() => !saving && setStatusAction(null)}
        onConfirm={confirmStatus}
      />
    </Box>
  );
}

export default ProjectModules;
