import { useCallback, useState } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import ServerPagination from '../../components/common/ServerPagination';
import StatusChip from '../../components/common/StatusChip';
import TrackSelect from '../../components/selects/TrackSelect';
import { useAuth } from '../../context/AuthContext';
import { useServerCollection } from '../../hooks/useServerCollection';
import { activateUser, deactivateUser, getUsers } from '../../services/userService';
import { formatDateTime } from '../../utils/formatters';
import { ROLE_OPTIONS, USER_ACTIVE_OPTIONS, rolesLabel } from '../../utils/presentation';

function AllUsers() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [action, setAction] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSaving, setActionSaving] = useState(false);
  const fetchUsers = useCallback((params, signal) => getUsers(params, signal), []);
  const collection = useServerCollection({
    fetcher: fetchUsers,
    initialSort: 'created_at',
    initialDirection: 'desc',
  });

  const canCreate = hasPermission('users.create');
  const canEdit = hasPermission('users.update');
  const canDeactivate = hasPermission('users.deactivate');
  const canViewTracks = hasPermission('tracks.view');

  const closeAction = () => {
    if (actionSaving) return;
    setAction(null);
    setActionError('');
  };

  const confirmAction = async () => {
    if (!action) return;

    setActionSaving(true);
    setActionError('');

    try {
      if (action.type === 'activate') {
        await activateUser(action.user.id);
      } else {
        await deactivateUser(action.user.id);
      }
      setAction(null);
      collection.refresh();
    } catch (error) {
      setActionError(error.message || 'Unable to update this user.');
    } finally {
      setActionSaving(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'email', headerName: 'Email', sortable: true },
    { field: 'phone', headerName: 'Phone', render: (value) => value || '-' },
    { field: 'roles', headerName: 'Roles', render: (value) => rolesLabel(value || []) },
    { field: 'is_active', headerName: 'Account', render: (value) => <StatusChip status={value} /> },
    { field: 'intern_profile', headerName: 'Track', render: (value) => value?.track?.name || '-' },
    { field: 'last_login_at', headerName: 'Last Login', sortable: true, render: (value) => formatDateTime(value) },
    { field: 'created_at', headerName: 'Created', sortable: true, render: (value) => formatDateTime(value) },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button size="small" variant="outlined" onClick={() => navigate(`/users/${row.id}`)}>
            View
          </Button>
          {canEdit && (
            <Button size="small" variant="outlined" onClick={() => navigate(`/users/edit/${row.id}`)}>
              Edit
            </Button>
          )}
          {canEdit && !row.is_active && (
            <Button size="small" variant="outlined" onClick={() => setAction({ type: 'activate', user: row })}>
              Activate
            </Button>
          )}
          {canDeactivate && row.is_active && (
            <Button size="small" color="warning" variant="outlined" onClick={() => setAction({ type: 'deactivate', user: row })}>
              Deactivate
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
          <Typography variant="h5" fontWeight={700}>Users</Typography>
          {canCreate && <Button variant="contained" onClick={() => navigate('/users/create')}>Create User</Button>}
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <SearchBar
            label="Search users"
            placeholder="Name, email, or phone"
            value={collection.searchInput}
            onChange={(event) => collection.setSearchInput(event.target.value)}
          />
          <TextField
            select
            size="small"
            label="Role"
            value={collection.query.role || ''}
            onChange={(event) => collection.setFilter('role', event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All roles</MenuItem>
            {ROLE_OPTIONS.map((role) => <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>)}
          </TextField>
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

        {collection.refreshing && <Alert severity="info" sx={{ mb: 2 }}>Refreshing users...</Alert>}
        {collection.error && <ApiState error={collection.error} onRetry={collection.refresh} />}
        {!collection.loading && !collection.error && collection.items.length === 0 && (
          <EmptyState
            title="No users found"
            message="Adjust the filters or create a user when you have permission."
            actionLabel={canCreate ? 'Create User' : undefined}
            onAction={canCreate ? () => navigate('/users/create') : undefined}
          />
        )}
        {(collection.loading || collection.items.length > 0) && !collection.error && (
          <>
            <DataTable
              ariaLabel="Users table"
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

      <ConfirmationDialog
        open={Boolean(action)}
        title={action?.type === 'activate' ? 'Activate user' : 'Deactivate user'}
        message={action?.type === 'activate'
          ? `Activate ${action?.user?.name}? This allows the user to sign in again.`
          : `Deactivate ${action?.user?.name}? This blocks login and revokes existing tokens. It does not delete the user.`}
        confirmLabel={action?.type === 'activate' ? 'Activate' : 'Deactivate'}
        confirmColor={action?.type === 'activate' ? 'primary' : 'warning'}
        confirming={actionSaving}
        error={actionError}
        onClose={closeAction}
        onConfirm={confirmAction}
      />
    </Box>
  );
}

export default AllUsers;
