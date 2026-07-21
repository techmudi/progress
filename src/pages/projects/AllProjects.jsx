import { useCallback } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import ServerPagination from '../../components/common/ServerPagination';
import StatusChip from '../../components/common/StatusChip';
import ProjectMemberUserSelect from '../../components/projects/ProjectMemberUserSelect';
import TrackSelect from '../../components/selects/TrackSelect';
import { useAuth } from '../../context/AuthContext';
import { useServerCollection } from '../../hooks/useServerCollection';
import { getProjects } from '../../services/projectService';
import { formatDateOnly, formatDateTime, formatNumber } from '../../utils/formatters';
import {
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  projectPriorityLabel,
} from '../../utils/presentation';

function AllProjects() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const fetchProjects = useCallback((params, signal) => getProjects(params, signal), []);
  const collection = useServerCollection({
    fetcher: fetchProjects,
    initialSort: 'created_at',
    initialDirection: 'desc',
  });

  const canManage = hasPermission('projects.manage');
  const canViewTracks = hasPermission('tracks.view');

  const columns = [
    { field: 'code', headerName: 'Code', sortable: true, render: (value) => value || '-' },
    { field: 'name', headerName: 'Project', sortable: true },
    { field: 'status', headerName: 'Status', sortable: true, render: (value) => <StatusChip status={value} type="project" /> },
    { field: 'priority', headerName: 'Priority', sortable: true, render: (value) => projectPriorityLabel(value) },
    { field: 'start_date', headerName: 'Start', sortable: true, render: (value) => formatDateOnly(value) },
    { field: 'expected_end_date', headerName: 'Expected End', sortable: true, render: (value) => formatDateOnly(value) },
    { field: 'active_member_count', headerName: 'Members', render: (value) => formatNumber(value ?? 0) },
    { field: 'module_count', headerName: 'Modules', render: (value) => formatNumber(value ?? 0) },
    { field: 'creator', headerName: 'Created By', render: (value) => value?.name || '-' },
    { field: 'created_at', headerName: 'Created', sortable: true, render: (value) => formatDateTime(value) },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button size="small" variant="outlined" onClick={() => navigate(`/projects/${row.id}`)}>
            View
          </Button>
          {canManage && (
            <Button size="small" variant="outlined" onClick={() => navigate(`/projects/${row.id}/edit`)}>
              Edit
            </Button>
          )}
          {canManage && (
            <Button size="small" variant="outlined" onClick={() => navigate(`/projects/${row.id}/members`)}>
              Members
            </Button>
          )}
          {canManage && (
            <Button size="small" variant="outlined" onClick={() => navigate(`/projects/${row.id}/modules`)}>
              Modules
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
          <Typography variant="h5" fontWeight={700}>Projects</Typography>
          {canManage && <Button variant="contained" onClick={() => navigate('/projects/create')}>Create Project</Button>}
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <SearchBar
            label="Search projects"
            placeholder="Code, name, slug, or description"
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
            {PROJECT_STATUS_OPTIONS.map((option) => <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            label="Priority"
            value={collection.query.priority || ''}
            onChange={(event) => collection.setFilter('priority', event.target.value)}
            sx={{ minWidth: 170 }}
          >
            {PROJECT_PRIORITY_OPTIONS.map((option) => <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          {canViewTracks && (
            <Box sx={{ minWidth: 220 }}>
              <TrackSelect
                label="Member track"
                value={collection.query.track_id || ''}
                onChange={(event) => collection.setFilter('track_id', event.target.value)}
              />
            </Box>
          )}
          <Box sx={{ minWidth: 280 }}>
            <ProjectMemberUserSelect
              label="Active member"
              memberRole="observer"
              value={collection.query.member_id || ''}
              onChange={(userId) => collection.setFilter('member_id', userId)}
            />
          </Box>
          <TextField
            size="small"
            label="Start from"
            type="date"
            value={collection.query.start_date_from || ''}
            onChange={(event) => collection.setFilter('start_date_from', event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="Expected end to"
            type="date"
            value={collection.query.expected_end_date_to || ''}
            onChange={(event) => collection.setFilter('expected_end_date_to', event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        {collection.refreshing && <Alert severity="info" sx={{ mb: 2 }}>Refreshing projects...</Alert>}
        {collection.error && <ApiState error={collection.error} onRetry={collection.refresh} />}
        {!collection.loading && !collection.error && collection.items.length === 0 && (
          <EmptyState
            title="No projects found"
            message="Adjust the filters or create a project when you have permission."
            actionLabel={canManage ? 'Create Project' : undefined}
            onAction={canManage ? () => navigate('/projects/create') : undefined}
          />
        )}
        {(collection.loading || collection.items.length > 0) && !collection.error && (
          <>
            <DataTable
              ariaLabel="Projects table"
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
    </Box>
  );
}

export default AllProjects;
