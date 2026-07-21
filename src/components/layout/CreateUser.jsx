import { Box, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/common/UserForm';

function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    status: 'Active',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const newUser = {
      id: Date.now(),
      ...formData,
    };

    localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
    navigate('/users');
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Create User
        </Typography>
        <UserForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/users')}
        />
      </Paper>
    </Box>
  );
}

export default CreateUser;
