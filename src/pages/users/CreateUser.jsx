import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/common/UserForm';
import { createUser } from '../../services/api';

function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', department: '', role: '', status: 'Active', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const { confirmPassword, ...user } = formData;

    try {
      setSaving(true);
      await createUser({ ...user, name: `${user.firstName} ${user.lastName}`.trim() });
      navigate('/users');
    } catch (err) {
      setError(err.message || 'Unable to create the user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box><Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Create User</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saving && <CircularProgress size={24} sx={{ mb: 2 }} />}
      <UserForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} onCancel={() => navigate('/users')} submitLabel={saving ? 'Creating...' : 'Create User'} />
    </Paper></Box>
  );
}

export default CreateUser;
