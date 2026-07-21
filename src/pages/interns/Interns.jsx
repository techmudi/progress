import { useCallback } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import ServerPagination from '../../components/common/ServerPagination';
import StatusChip from '../../components/common/StatusChip';
import SupervisorSelect from '../../components/selects/SupervisorSelect';
import TrackSelect from '../../components/selects/TrackSelect';
import { useAuth } from '../../context/AuthContext';
import { useServerCollection } from '../../hooks/useServerCollection';
import { getInterns } from '../../services/internService';
import { formatDateOnly } from '../../utils/formatters';
import { INTERN_STATUS_OPTIONS, USER_ACTIVE_OPTIONS } from '../../utils/presentation';

function Interns() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const fetchInterns = useCallback((params, signal) => getInterns(params, signal), []);
  const collection = useServerCollection({
    fetcher: fetchInterns,
    initialSort: 'created_at',
    initialDirection: 'desc',
  });
  const canManage = hasPermission('interns.manage');
  const canViewTracks = hasPermission('tracks.view');

  const columns = [
    { field: 'intern_number', headerName: 'Intern Number', sortable: true },
    { field: 'user_name', headerName: 'Name', sortable: true, sortField: 'user_name', render: (_value, row) => row.user?.name || '-' },
    { field: 'user_email', headerName: 'Email', render: (_value, row) => row.user?.email || '-' },
    { field: 'user_phone', headerName: 'Phone', render: (_value, row) => row.user?.phone || '-' },
    { field: 'track', headerName: 'Track', render: (value) => value?.name || '-' },
    { field: 'supervisor', headerName: 'Supervisor', render: (value) => value?.name || '-' },
    { field: 'status', headerName: 'Internship', render: (value) => <StatusChip status={value} type="intern" /> },
    { field: 'user_account', headerName: 'Account', render: (_value, row) => <StatusChip status={Boolean(row.user?.is_active)} /> },
    { field: 'start_date', headerName: 'Start Date', sortable: true, render: (value) => formatDateOnly(value) },
    { field: 'expected_end_date', headerName: 'Expected End', sortable: true, render: (value) => formatDateOnly(value) },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button size="small" variant="outlined" onClick={() => navigate(`/interns/${row.id}`)}>
            View
          </Button>
          {canManage && (
            <Button size="small" variant="outlined" onClick={() => navigate(`/interns/${row.id}/edit`)}>
              Edit
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
          <Typography variant="h5" fontWeight={700}>Interns</Typography>
          {canManage && <Button variant="contained" onClick={() => navigate('/interns/create')}>Create Intern</Button>}
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <SearchBar
            label="Search interns"
            placeholder="Number, name, email, phone, or track"
            value={collection.searchInput}
            onChange={(event) => collection.setSearchInput(event.target.value)}
          />
          {canViewTracks && (
            <Box sx={{ minWidth: 220 }}>
              <TrackSelect
                label="Track"
                value={collection.query.track_id || ''}
                onChange={(event) => collection.setFilter('track_id', event.target.value)}
              />
            </Box>
          )}
          <TextField
            select
            size="small"
            label="Internship status"
            value={collection.query.status || ''}
            onChange={(event) => collection.setFilter('status', event.target.value)}
            sx={{ minWidth: 210 }}
          >
            {INTERN_STATUS_OPTIONS.map((option) => <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <Box sx={{ minWidth: 240 }}>
            <SupervisorSelect
              label="Supervisor"
              value={collection.query.supervisor_id || ''}
              onChange={(event) => collection.setFilter('supervisor_id', event.target.value)}
            />
          </Box>
          <TextField
            select
            size="small"
            label="Account"
            value={collection.query.is_active ?? ''}
            onChange={(event) => collection.setFilter('is_active', event.target.value)}
            sx={{ minWidth: 190 }}
          >
            {USER_ACTIVE_OPTIONS.map((option) => <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
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
            label="Start to"
            type="date"
            value={collection.query.start_date_to || ''}
            onChange={(event) => collection.setFilter('start_date_to', event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        {collection.refreshing && <Alert severity="info" sx={{ mb: 2 }}>Refreshing interns...</Alert>}
        {collection.error && <ApiState error={collection.error} onRetry={collection.refresh} />}
        {!collection.loading && !collection.error && collection.items.length === 0 && (
          <EmptyState
            title="No interns found"
            message="Adjust the filters or create an intern when you have permission."
            actionLabel={canManage ? 'Create Intern' : undefined}
            onAction={canManage ? () => navigate('/interns/create') : undefined}
          />
        )}
        {(collection.loading || collection.items.length > 0) && !collection.error && (
          <>
            <DataTable
              ariaLabel="Interns table"
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

export default Interns;
