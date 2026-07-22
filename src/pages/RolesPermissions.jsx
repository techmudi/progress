import { Box, Button, Checkbox, FormControlLabel, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { useState } from 'react';

const permissionsList = ['Dashboard', 'Users', 'Projects', 'Interns', 'Supervisors', 'Reports'];

function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [selectedPermissions, setSelectedPermissions] = useState(permissionsList);

  const togglePermission = (permission) => {
    setSelectedPermissions((current) =>
      current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Roles & Permissions
        </Typography>

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Role
        </Typography>
        <RadioGroup value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <FormControlLabel value="Admin" control={<Radio />} label="Admin" />
          <FormControlLabel value="Supervisor" control={<Radio />} label="Supervisor" />
          <FormControlLabel value="Intern" control={<Radio />} label="Intern" />
        </RadioGroup>

        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
          Permissions
        </Typography>
        <Stack spacing={1}>
          {permissionsList.map((permission) => (
            <FormControlLabel
              key={permission}
              control={<Checkbox checked={selectedPermissions.includes(permission)} onChange={() => togglePermission(permission)} />}
              label={permission}
            />
          ))}
        </Stack>

        <Button variant="contained" sx={{ mt: 3 }}>
          Save Permissions
        </Button>
      </Paper>
    </Box>
  );
}

export default RolesPermissions;
