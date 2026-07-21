import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import StatusChip from '../../components/common/StatusChip';
import { getUsers } from '../../services/api';

function AllUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      // If your backend responds with { users: [...] }, change this to: setUsers(data.users || []).
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((user) =>
      [user.name, user.firstName, user.lastName, user.email, user.role, user.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [users, search]);

  const columns = [
    { field: 'name', headerName: 'Name', render: (value, row) => value || `${row.firstName || ''} ${row.lastName || ''}`.trim() },
    { field: 'email', headerName: 'Email' },
    { field: 'role', headerName: 'Role' },
    { field: 'status', headerName: 'Status', render: (value) => <StatusChip status={value} /> },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => (
        <Button size="small" variant="outlined" onClick={() => navigate(`/users/${row.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Users</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField size="small" placeholder="Search users" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button variant="contained" onClick={() => navigate('/users/create')}>+ Create User</Button>
          </Stack>
        </Stack>

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
        {!loading && error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadUsers}>Retry</Button>}>{error}</Alert>}
        {!loading && !error && filteredUsers.length === 0 && <EmptyState title="No users found" message="Click Create User to add your first user." actionLabel="Create User" onAction={() => navigate('/users/create')} />}
        {!loading && !error && filteredUsers.length > 0 && <DataTable columns={columns} rows={filteredUsers} />}
      </Paper>
    </Box>
  );
}

export default AllUsers;
