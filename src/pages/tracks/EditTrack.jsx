import { useEffect, useState } from 'react';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import FormError from '../../components/forms/FormError';
import TrackForm from '../../components/tracks/TrackForm';
import { getTrack, updateTrack } from '../../services/trackService';
import { fieldsFromApiError } from '../../utils/formErrors';

function EditTrack() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', is_active: true });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTrack() {
      setLoading(true);
      setLoadError(null);

      try {
        const result = await getTrack(id, controller.signal);
        setFormData({
          name: result.track?.name || '',
          slug: result.track?.slug || '',
          description: result.track?.description || '',
          is_active: Boolean(result.track?.is_active),
        });
      } catch (caught) {
        if (caught?.type !== 'cancelled') {
          setLoadError(caught);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTrack();

    return () => controller.abort();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      await updateTrack(id, formData);
      navigate('/tracks', { replace: true });
    } catch (caught) {
      setSaveError(caught);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Edit Track</Typography>
        {loading && <CircularProgress />}
        {!loading && loadError && <ApiState error={loadError} />}
        {!loading && !loadError && (
          <>
            <FormError error={saveError} fallback="Unable to update the track." />
            <TrackForm
              formData={formData}
              errors={fieldsFromApiError(saveError)}
              saving={saving}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/tracks')}
              submitLabel="Update Track"
            />
          </>
        )}
      </Paper>
    </Box>
  );
}

export default EditTrack;
