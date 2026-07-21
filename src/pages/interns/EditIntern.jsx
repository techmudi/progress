import { useEffect, useState } from 'react';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import FormError from '../../components/forms/FormError';
import InternForm from '../../components/interns/InternForm';
import { getIntern, updateIntern } from '../../services/internService';
import { fieldsFromApiError } from '../../utils/formErrors';

function EditIntern() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [intern, setIntern] = useState(null);
  const [formData, setFormData] = useState({
    track_id: '',
    start_date: '',
    expected_end_date: '',
    actual_end_date: '',
    supervisor_id: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIntern() {
      setLoading(true);
      setLoadError(null);

      try {
        const result = await getIntern(id, controller.signal);
        setIntern(result.intern);
        setFormData({
          track_id: result.intern?.track?.id || '',
          start_date: result.intern?.start_date || '',
          expected_end_date: result.intern?.expected_end_date || '',
          actual_end_date: result.intern?.actual_end_date || '',
          supervisor_id: result.intern?.supervisor?.id || '',
          bio: result.intern?.bio || '',
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

    loadIntern();

    return () => controller.abort();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      await updateIntern(id, formData);
      navigate(`/interns/${id}`, { replace: true });
    } catch (caught) {
      setSaveError(caught);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Edit Intern Profile</Typography>
        {loading && <CircularProgress />}
        {!loading && loadError && <ApiState error={loadError} />}
        {!loading && !loadError && (
          <>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Intern number {intern?.intern_number} is immutable. Update user name, email, phone, or password from the linked user profile.
            </Typography>
            <FormError error={saveError} fallback="Unable to update the intern profile." />
            <InternForm
              mode="edit"
              formData={formData}
              errors={fieldsFromApiError(saveError)}
              saving={saving}
              existingTrack={intern?.track}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/interns/${id}`)}
              submitLabel="Update Intern"
            />
          </>
        )}
      </Paper>
    </Box>
  );
}

export default EditIntern;
