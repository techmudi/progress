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
import { useAuth } from '../../context/AuthContext';
import { useServerCollection } from '../../hooks/useServerCollection';
import { activateTrack, deactivateTrack, getTracks } from '../../services/trackService';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import { USER_ACTIVE_OPTIONS } from '../../utils/presentation';

function Tracks() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [action, setAction] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSaving, setActionSaving] = useState(false);
  const fetchTracks = useCallback((params, signal) => getTracks(params, signal), []);
  const collection = useServerCollection({
    fetcher: fetchTracks,
    initialSort: '',
    initialDirection: '',
  });
  const canManage = hasPermission('tracks.manage');

  const confirmAction = async () => {
    if (!action) return;

    setActionSaving(true);
    setActionError('');

    try {
      if (action.type === 'activate') {
        await activateTrack(action.track.id);
      } else {
        await deactivateTrack(action.track.id);
      }
      setAction(null);
      collection.refresh();
    } catch (error) {
      setActionError(error.message || 'Unable to update this track.');
    } finally {
      setActionSaving(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name' },
    { field: 'slug', headerName: 'Slug' },
    { field: 'description', headerName: 'Description', render: (value) => value || '-' },
    { field: 'is_active', headerName: 'Status', render: (value) => <StatusChip status={value} /> },
    { field: 'intern_profiles_count', headerName: 'Interns', render: (value) => formatNumber(value ?? 0) },
    { field: 'created_at', headerName: 'Created', render: (value) => formatDateTime(value) },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => canManage ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button size="small" variant="outlined" onClick={() => navigate(`/tracks/${row.id}/edit`)}>
            Edit
          </Button>
          {!row.is_active ? (
            <Button size="small" variant="outlined" onClick={() => setAction({ type: 'activate', track: row })}>
              Activate
            </Button>
          ) : (
            <Button size="small" color="warning" variant="outlined" onClick={() => setAction({ type: 'deactivate', track: row })}>
              Deactivate
            </Button>
          )}
        </Stack>
      ) : '-',
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Tracks</Typography>
          {canManage && <Button variant="contained" onClick={() => navigate('/tracks/create')}>Create Track</Button>}
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <SearchBar
            label="Search tracks"
            placeholder="Name, slug, or description"
            value={collection.searchInput}
            onChange={(event) => collection.setSearchInput(event.target.value)}
          />
          <TextField
            select
            size="small"
            label="State"
            value={collection.query.is_active ?? ''}
            onChange={(event) => collection.setFilter('is_active', event.target.value)}
            sx={{ minWidth: 190 }}
          >
            {USER_ACTIVE_OPTIONS.map((option) => <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
        </Stack>

        {collection.refreshing && <Alert severity="info" sx={{ mb: 2 }}>Refreshing tracks...</Alert>}
        {collection.error && <ApiState error={collection.error} onRetry={collection.refresh} />}
        {!collection.loading && !collection.error && collection.items.length === 0 && (
          <EmptyState
            title="No tracks found"
            message="Adjust the filters or create a track when you have permission."
            actionLabel={canManage ? 'Create Track' : undefined}
            onAction={canManage ? () => navigate('/tracks/create') : undefined}
          />
        )}
        {(collection.loading || collection.items.length > 0) && !collection.error && (
          <>
            <DataTable ariaLabel="Tracks table" columns={columns} rows={collection.loading ? [] : collection.items} loading={collection.loading} />
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
        title={action?.type === 'activate' ? 'Activate track' : 'Deactivate track'}
        message={action?.type === 'activate'
          ? `Activate ${action?.track?.name}? New interns may be assigned to it.`
          : `Deactivate ${action?.track?.name}? Existing intern profiles remain assigned; this does not delete them.`}
        confirmLabel={action?.type === 'activate' ? 'Activate' : 'Deactivate'}
        confirmColor={action?.type === 'activate' ? 'primary' : 'warning'}
        confirming={actionSaving}
        error={actionError}
        onClose={() => !actionSaving && setAction(null)}
        onConfirm={confirmAction}
      />
    </Box>
  );
}

export default Tracks;
