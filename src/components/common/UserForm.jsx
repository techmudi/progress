import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';

const roleOptions = ['Admin', 'Supervisor', 'Intern'];
const statusOptions = ['Active', 'Inactive'];

function UserForm({ formData, onChange, onSubmit, onCancel, submitLabel = 'Save User' }) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        <TextField
          label="First Name"
          name="firstName"
          value={formData.firstName || ''}
          onChange={onChange}
          fullWidth
          required
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={formData.lastName || ''}
          onChange={onChange}
          fullWidth
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={onChange}
          fullWidth
          required
        />
        <TextField
          label="Phone Number"
          name="phone"
          value={formData.phone || ''}
          onChange={onChange}
          fullWidth
        />
        <TextField
          label="Department"
          name="department"
          value={formData.department || ''}
          onChange={onChange}
          fullWidth
        />
        <TextField select label="Role" name="role" value={formData.role || ''} onChange={onChange} fullWidth required>
          {roleOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Status" name="status" value={formData.status || 'Active'} onChange={onChange} fullWidth required>
          {statusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password || ''}
          onChange={onChange}
          fullWidth
          required
        />
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword || ''}
          onChange={onChange}
          fullWidth
          required
        />
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default UserForm;
