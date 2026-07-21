import { useCallback } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import ServerPagination from '../../components/common/ServerPagination';
import StatusChip from '../../components/common/StatusChip';
import { useServerCollection } from '../../hooks/useServerCollection';
import { getUsers } from '../../services/userService';
import { formatDateTime } from '../../utils/formatters';
import { USER_ACTIVE_OPTIONS } from '../../utils/presentation';

function Supervisors() {
  const navigate = useNavigate();
  const fetchSupervisors = useCallback((params, signal) => getUsers({ ...params, role: 'supervisor' }, signal), []);
  const collection = useServerCollection({
    fetcher: fetchSupervisors,
    initialFilters: { role: 'supervisor' },
    initialSort: 'name',
    initialDirection: 'asc',
  });

  const columns = [
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'email', headerName: 'Email', sortable: true },
    { field: 'phone', headerName: 'Phone', render: (value) => value || '-' },
    { field: 'is_active', headerName: 'Account', render: (value) => <StatusChip status={value} /> },
    { field: 'last_login_at', headerName: 'Last Login', sortable: true, render: (value) => formatDateTime(value) },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => (
        <Button size="small" variant="outlined" onClick={() => navigate(`/users/${row.id}`)}>
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Supervisors
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <SearchBar
            label="Search supervisors"
            placeholder="Name, email, or phone"
            value={collection.searchInput}
            onChange={(event) => collection.setSearchInput(event.target.value)}
          />
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
        </Stack>

        {collection.refreshing && <Alert severity="info" sx={{ mb: 2 }}>Refreshing supervisors...</Alert>}
        {collection.error && <ApiState error={collection.error} onRetry={collection.refresh} />}
        {!collection.loading && !collection.error && collection.items.length === 0 && (
          <EmptyState title="No supervisors found" message="Adjust the search or active-state filter." />
        )}
        {(collection.loading || collection.items.length > 0) && !collection.error && (
          <>
            <DataTable
              ariaLabel="Supervisors table"
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

export default Supervisors;
