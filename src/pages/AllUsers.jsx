import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import StatusChip from '../../components/common/StatusChip';

const initialUsers = [];

function AllUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = search.toLowerCase();
      return [user.firstName, user.lastName, user.email, user.role, user.status]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [users, search]);

  const columns = [
    { field: 'firstName', headerName: 'First Name' },
    { field: 'lastName', headerName: 'Last Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'role', headerName: 'Role' },
    {
      field: 'status',
      headerName: 'Status',
      render: (value) => <StatusChip status={value} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_value, row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => navigate(`/users/${row.id}`)}>
            View
          </Button>
          <Button size="small" variant="outlined" onClick={() => navigate(`/users/edit/${row.id}`)}>
            Edit
          </Button>
          <Button size="small" color="error" variant="outlined" onClick={() => openDeleteDialog(row)}>
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    setUsers((current) => current.filter((user) => user.id !== selectedUser.id));
    setConfirmOpen(false);
    setSelectedUser(null);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Users
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField size="small" placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="contained" onClick={() => navigate('/users/create')}>
              + Create User
            </Button>
          </Stack>
        </Stack>

        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            message="Click Create User to add your first user."
            actionLabel="Create User"
            onAction={() => navigate('/users/create')}
          />
        ) : (
          <DataTable columns={columns} rows={filteredUsers} />
        )}
      </Paper>

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete user"
        message={`Are you sure you want to delete ${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}?`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}

export default AllUsers;
