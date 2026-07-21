import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FormError from '../../components/forms/FormError';
import TrackForm from '../../components/tracks/TrackForm';
import { createTrack } from '../../services/trackService';
import { fieldsFromApiError } from '../../utils/formErrors';

const initialForm = {
  name: '',
  slug: '',
  description: '',
  is_active: true,
};

function CreateTrack() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      await createTrack(formData);
      navigate('/tracks', { replace: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Create Track</Typography>
        <FormError error={error} fallback="Unable to create the track." />
        <TrackForm
          formData={formData}
          errors={fieldsFromApiError(error)}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/tracks')}
          submitLabel="Create Track"
        />
      </Paper>
    </Box>
  );
}

export default CreateTrack;
