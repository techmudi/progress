import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function RolesPermissions() {
  const navigate = useNavigate();

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Roles
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Role changes are applied from each user profile. The backend exposes role synchronization, not direct permission editing.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/users')}>
          Go to Users
        </Button>
      </Paper>
    </Box>
  );
}

export default RolesPermissions;
