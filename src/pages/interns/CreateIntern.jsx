import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FormError from '../../components/forms/FormError';
import InternForm from '../../components/interns/InternForm';
import { createIntern } from '../../services/internService';
import { fieldsFromApiError } from '../../utils/formErrors';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  is_active: true,
  track_id: '',
  intern_number: '',
  start_date: '',
  expected_end_date: '',
  actual_end_date: '',
  supervisor_id: '',
  bio: '',
  status: 'pending',
};

function CreateIntern() {
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
      const result = await createIntern(formData);
      navigate(result.intern?.id ? `/interns/${result.intern.id}` : '/interns', { replace: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Create Intern</Typography>
        <FormError error={error} fallback="Unable to create the intern." />
        <InternForm
          mode="create"
          formData={formData}
          errors={fieldsFromApiError(error)}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/interns')}
          submitLabel="Create Intern"
        />
      </Paper>
    </Box>
  );
}

export default CreateIntern;
