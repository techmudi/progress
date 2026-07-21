import { Box, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import UserForm from '../../components/common/UserForm';
import { users } from '../../data/users';

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const existingUser = users.find((item) => item.id === Number(id));

  if (!existingUser) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography>User not found.</Typography>
      </Paper>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/users');
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Edit User
        </Typography>
        <UserForm
          formData={existingUser}
          onChange={() => {}}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/users')}
          submitLabel="Update User"
        />
      </Paper>
    </Box>
  );
}

export default EditUser;
