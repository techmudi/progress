import { useEffect, useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import AppLoading from '../../components/common/AppLoading';
import ProjectForm from '../../components/projects/ProjectForm';
import { getProject, updateProject } from '../../services/projectService';

function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const loadProject = async (signal) => {
    setLoading(true);
    setLoadError(null);

    try {
      const result = await getProject(projectId, signal);
      setProject(result.project);
    } catch (caught) {
      if (caught?.type !== 'cancelled') {
        setLoadError(caught);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadProject(controller.signal);
    return () => controller.abort();
  }, [projectId]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setSaveError(null);

    try {
      const result = await updateProject(projectId, payload);
      navigate(`/projects/${result.project.id}`);
    } catch (caught) {
      setSaveError(caught);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AppLoading message="Loading project..." />;
  }

  if (loadError) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <ApiState error={loadError} onRetry={() => loadProject()} />
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Edit Project</Typography>
            <Typography color="text.secondary">{project.code || project.name}</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate(`/projects/${project.id}`)}>Back</Button>
        </Stack>
        <ProjectForm
          initialValues={project}
          saving={saving}
          error={saveError}
          submitLabel="Save Project"
          onSubmit={handleSubmit}
        />
      </Paper>
    </Box>
  );
}

export default EditProject;
