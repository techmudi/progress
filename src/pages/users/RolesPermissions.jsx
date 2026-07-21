import { Button, Checkbox, FormControlLabel, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { allPermissions, roles as initialRoles } from '../../data/roles';

function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [roles, setRoles] = useState(initialRoles);
  const selectedPermissions = roles.find((role) => role.name === selectedRole)?.permissions || [];

  const togglePermission = (permission) => {
    setRoles((current) => current.map((role) => {
      if (role.name !== selectedRole) return role;
      const permissions = role.permissions.includes(permission)
        ? role.permissions.filter((item) => item !== permission)
        : [...role.permissions, permission];
      return { ...role, permissions };
    }));
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
          {allPermissions.map((permission) => (
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
