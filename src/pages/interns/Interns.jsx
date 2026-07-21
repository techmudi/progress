import { Box, Paper, Typography } from '@mui/material';
import DataTable from '../../components/common/DataTable';
import { interns } from '../../data/interns';

const columns = [
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
  { field: 'department', headerName: 'Department' },
  { field: 'supervisor', headerName: 'Supervisor' },
  { field: 'status', headerName: 'Status' },
];

function Interns() {
  return (
    <Box>
      <Paper sx={{ p: 1, borderRadius: 1 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Interns
        </Typography>
        <DataTable columns={columns} rows={interns} />
      </Paper>
    </Box>
  );
}

export default Interns;
