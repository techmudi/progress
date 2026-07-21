import { Box, CircularProgress, Typography } from '@mui/material';

function AppLoading({ message = 'Loading...' }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f4f6f9', p: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">{message}</Typography>
      </Box>
    </Box>
  );
}

export default AppLoading;
