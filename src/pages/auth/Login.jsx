import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f6f9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ width: { xs: '100%', sm: 500 }, p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" fontWeight={700} sx={{ mb: 1 }}>
          Management System Platform
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to continue to the dashboard
        </Typography>

        <Stack spacing={2}>
          <TextField fullWidth label="Email" />
          <TextField fullWidth label="Password" type="password" />
          <Button variant="contained" size="large" onClick={() => navigate('/dashboard')}>
            Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Login;
