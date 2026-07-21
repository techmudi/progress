import { useEffect, useState } from 'react';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import UserForm from '../../components/common/UserForm';
import FormError from '../../components/forms/FormError';
import { getUser, updateUser } from '../../services/userService';
import { fieldsFromApiError } from '../../utils/formErrors';

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      setLoading(true);
      setLoadError(null);

      try {
        const result = await getUser(id, controller.signal);
        setFormData({
          name: result.user?.name || '',
          email: result.user?.email || '',
          phone: result.user?.phone || '',
          password: '',
          password_confirmation: '',
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

    loadUser();

    return () => controller.abort();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaveError(null);
    setSaving(true);

    try {
      await updateUser(id, formData);
      navigate(`/users/${id}`, { replace: true });
    } catch (caught) {
      setSaveError(caught);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Edit User</Typography>
        {loading && <CircularProgress />}
        {!loading && loadError && <ApiState error={loadError} />}
        {!loading && !loadError && (
          <>
            <FormError error={saveError} fallback="Unable to update the user." />
            <UserForm
              mode="edit"
              formData={formData}
              errors={fieldsFromApiError(saveError)}
              saving={saving}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/users/${id}`)}
              submitLabel="Update User"
            />
          </>
        )}
      </Paper>
    </Box>
  );
}

export default EditUser;
