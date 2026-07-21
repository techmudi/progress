import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ROLE_OPTIONS } from '../../utils/presentation';
import { firstFieldError, hasFieldError } from '../../utils/formErrors';

function UserForm({
  formData,
  onChange,
  onRoleToggle,
  onSubmit,
  onCancel,
  errors = {},
  saving = false,
  mode = 'create',
  submitLabel = 'Save User',
}) {
  const isCreate = mode === 'create';

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Name"
          name="name"
          value={formData.name || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'name')}
          helperText={firstFieldError(errors, 'name')}
          fullWidth
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'email')}
          helperText={firstFieldError(errors, 'email')}
          fullWidth
          required
        />
        <TextField
          label="Phone"
          name="phone"
          value={formData.phone || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'phone')}
          helperText={firstFieldError(errors, 'phone')}
          fullWidth
        />
        {isCreate && (
          <FormControlLabel
            control={<Checkbox name="is_active" checked={Boolean(formData.is_active)} onChange={onChange} />}
            label="Active account"
          />
        )}
        <TextField
          label={isCreate ? 'Password' : 'New password'}
          name="password"
          type="password"
          value={formData.password || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'password')}
          helperText={firstFieldError(errors, 'password') || (!isCreate ? 'Leave blank to keep the current password.' : '')}
          fullWidth
          required={isCreate}
        />
        <TextField
          label="Password confirmation"
          name="password_confirmation"
          type="password"
          value={formData.password_confirmation || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'password_confirmation')}
          helperText={firstFieldError(errors, 'password_confirmation')}
          fullWidth
          required={isCreate || Boolean(formData.password)}
        />
        {isCreate && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Roles
            </Typography>
            <FormGroup row>
              {ROLE_OPTIONS.map((role) => (
                <FormControlLabel
                  key={role.value}
                  control={(
                    <Checkbox
                      checked={(formData.roles || []).includes(role.value)}
                      onChange={() => onRoleToggle(role.value)}
                    />
                  )}
                  label={role.label}
                />
              ))}
            </FormGroup>
            {hasFieldError(errors, 'roles') && (
              <Typography color="error" variant="caption">
                {firstFieldError(errors, 'roles')}
              </Typography>
            )}
          </Box>
        )}
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default UserForm;
