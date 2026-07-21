import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { users } from '../../data/users';

function UserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = users.find((item) => item.id === Number(id));

  if (!user) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography>User not found.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        User Details
      </Typography>
      <Stack spacing={1.5}>
        <Typography><strong>Name:</strong> {user.name}</Typography>
        <Typography><strong>Email:</strong> {user.email}</Typography>
        <Typography><strong>Role:</strong> {user.role}</Typography>
        <Typography><strong>Status:</strong> {user.status}</Typography>
      </Stack>
      <Button sx={{ mt: 3 }} variant="outlined" onClick={() => navigate('/users')}>
        Back to Users
      </Button>
    </Paper>
  );
}

export default UserDetails;
