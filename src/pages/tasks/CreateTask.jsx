import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

function CreateTask() {
  return (
    <Box>
      <Paper sx={{ p: 1, borderRadius: 1 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
          Create Task
        </Typography>

        <Box component="form">
          <Stack spacing={2}>
            <TextField label="Task name" fullWidth />
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="Due date"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <Button
              variant="contained"
              type="submit"
              sx={{ alignSelf: "flex-start" }}
            >
              Create Task
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateTask;