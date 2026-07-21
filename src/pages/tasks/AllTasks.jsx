import { Box, Paper, Typography } from '@mui/material';

function AllTasks() {
  return (
    <Box>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={700}>All Tasks</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}></Typography>
      </Paper>
    </Box>
  );
}

export default AllTasks;
