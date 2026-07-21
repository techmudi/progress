import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';

function CreateProject() {
  return (
    <Box>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
          Create Project
        </Typography>
        <Box component="form">
          <Stack spacing={2}>
            <TextField label="Project Name" fullWidth />
            <TextField label="Manager" fullWidth />
            <TextField label="Deadline" fullWidth />
            <TextField label="Description" multiline rows={4} fullWidth />
          </Stack>
          <Button variant="contained" sx={{ mt: 3 }}>
            Create Project
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateProject;
