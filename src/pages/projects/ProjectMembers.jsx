import { Box, Paper, Typography } from '@mui/material';
import DataTable from '../../components/common/DataTable';
import { projects } from '../../data/projects';

const members = projects.flatMap((project) =>
  project.members.map((name, index) => ({
    id: `${project.id}-${index}`,
    name,
    project: project.name,
  }))
);

const columns = [
  { field: 'name', headerName: 'Name' },
  { field: 'project', headerName: 'Project' },
];

function ProjectMembers() {
  return (
    <Box>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Project Members
        </Typography>
        <DataTable columns={columns} rows={members} />
      </Paper>
    </Box>
  );
}

export default ProjectMembers;
