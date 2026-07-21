import { Box, Paper, Typography } from '@mui/material';
import DataTable from '../../components/common/DataTable';
import { supervisors } from '../../data/supervisors';

const columns = [
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
  { field: 'department', headerName: 'Department' },
  { field: 'internsCount', headerName: 'Interns Supervised' },
];

function Supervisors() {
  return (
    <Box sx={{ p: 1 }}>
      <Paper sx={{ p: 1, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Supervisors
        </Typography>
        <DataTable columns={columns} rows={supervisors} />
      </Paper>
      </Box>
    
  );
}

export default Supervisors;
