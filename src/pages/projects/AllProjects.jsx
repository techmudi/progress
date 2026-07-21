import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import { getProjects } from '../../services/api';

const columns = [
  { field: 'name', headerName: 'Project' },
  { field: 'description', headerName: 'Description' },
  { field: 'status', headerName: 'Status' },
  { field: 'members', headerName: 'Members', render: (members) => Array.isArray(members) ? members.join(', ') : members || '-' },
];

function AllProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    try { setLoading(true); setError(''); const data = await getProjects(); setProjects(Array.isArray(data) ? data : []); }
    catch (err) { setError(err.message || 'Unable to load projects.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProjects(); }, []);

  return <Box><Paper sx={{ p: 3, borderRadius: 3 }}>
    <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>All Projects</Typography>
    {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
    {!loading && error && <Alert severity="error" action={<Button color="inherit" onClick={loadProjects}>Retry</Button>}>{error}</Alert>}
    {!loading && !error && projects.length === 0 && <EmptyState title="No projects found" message="Create a project to get started." actionLabel="Create Project" onAction={() => navigate('/projects/create')} />}
    {!loading && !error && projects.length > 0 && <DataTable columns={columns} rows={projects} />}
  </Paper></Box>;
}

export default AllProjects;
