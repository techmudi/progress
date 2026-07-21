import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AccessUnavailable() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f4f6f9', p: 2 }}>
      <Paper sx={{ width: { xs: '100%', sm: 520 }, p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          Access unavailable
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          This dashboard client currently supports management users only.
        </Typography>
        {isAuthenticated ? (
          <Button variant="contained" onClick={handleLogout}>
            Sign out
          </Button>
        ) : (
          <Button variant="contained" onClick={() => navigate('/login', { replace: true })}>
            Back to login
          </Button>
        )}
      </Paper>
    </Box>
  );
}

export default AccessUnavailable;
