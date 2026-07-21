import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/common/UserForm';
import FormError from '../../components/forms/FormError';
import { createUser } from '../../services/userService';
import { fieldsFromApiError } from '../../utils/formErrors';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  is_active: true,
  roles: ['supervisor'],
};

function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRoleToggle = (role) => {
    setFormData((current) => {
      const roles = current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role];

      return { ...current, roles };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setError(null);
    setSaving(true);

    try {
      const result = await createUser(formData);
      navigate(result.user?.id ? `/users/${result.user.id}` : '/users', { replace: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Create User</Typography>
        <FormError error={error} fallback="Unable to create the user." />
        <UserForm
          mode="create"
          formData={formData}
          errors={fieldsFromApiError(error)}
          saving={saving}
          onChange={handleChange}
          onRoleToggle={handleRoleToggle}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/users')}
          submitLabel="Create User"
        />
      </Paper>
    </Box>
  );
}

export default CreateUser;
