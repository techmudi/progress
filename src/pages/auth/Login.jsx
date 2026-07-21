import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function isCredentialError(error) {
  const emailErrors = error?.errors?.email || [];
  return emailErrors.some((message) => message.includes('provided credentials'));
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggingIn, login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoggingIn) return;

    setFieldErrors({});
    setGeneralError('');

    try {
      const user = await login(formData);

      if (user?.roles?.some((role) => ['admin', 'supervisor'].includes(role))) {
        const nextPath = location.state?.from?.pathname || '/dashboard';
        navigate(nextPath === '/login' ? '/dashboard' : nextPath, { replace: true });
        return;
      }

      navigate('/access-unavailable', { replace: true });
    } catch (error) {
      if (error.type === 'validation' && !isCredentialError(error)) {
        setFieldErrors(error.errors || {});
        return;
      }

      setGeneralError(error.message || 'Unable to sign in.');
    }
  };

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

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
          {generalError && <Alert severity="error">{generalError}</Alert>}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email?.[0] || ''}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password?.[0] || ''}
          />
          <Button variant="contained" size="large" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
