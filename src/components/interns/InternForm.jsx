import { Box, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField } from '@mui/material';
import TrackSelect from '../selects/TrackSelect';
import SupervisorSelect from '../selects/SupervisorSelect';
import { firstFieldError, hasFieldError } from '../../utils/formErrors';
import { INTERN_STATUS_OPTIONS } from '../../utils/presentation';

function InternForm({
  formData,
  errors = {},
  saving = false,
  mode = 'create',
  existingTrack = null,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save Intern',
}) {
  const isCreate = mode === 'create';

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        {isCreate && (
          <>
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
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password || ''}
              onChange={onChange}
              error={hasFieldError(errors, 'password')}
              helperText={firstFieldError(errors, 'password')}
              fullWidth
              required
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
              required
            />
            <FormControlLabel
              control={<Checkbox name="is_active" checked={Boolean(formData.is_active)} onChange={onChange} />}
              label="Active account"
            />
            <TextField
              label="Intern number"
              name="intern_number"
              value={formData.intern_number || ''}
              onChange={onChange}
              error={hasFieldError(errors, 'intern_number')}
              helperText={firstFieldError(errors, 'intern_number') || 'Leave blank to let the backend generate it.'}
              fullWidth
            />
          </>
        )}
        <TrackSelect
          required
          activeOnly={isCreate}
          existingTrack={existingTrack}
          value={formData.track_id || ''}
          onChange={onChange}
          error={errors}
        />
        <SupervisorSelect
          value={formData.supervisor_id || ''}
          onChange={onChange}
          error={errors}
        />
        <TextField
          label="Start date"
          name="start_date"
          type="date"
          value={formData.start_date || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'start_date')}
          helperText={firstFieldError(errors, 'start_date')}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
        />
        <TextField
          label="Expected end date"
          name="expected_end_date"
          type="date"
          value={formData.expected_end_date || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'expected_end_date')}
          helperText={firstFieldError(errors, 'expected_end_date')}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Actual end date"
          name="actual_end_date"
          type="date"
          value={formData.actual_end_date || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'actual_end_date')}
          helperText={firstFieldError(errors, 'actual_end_date') || (!isCreate ? 'Only terminal statuses may have an actual end date.' : '')}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        {isCreate && (
          <TextField
            select
            label="Internship status"
            name="status"
            value={formData.status || 'pending'}
            onChange={onChange}
            error={hasFieldError(errors, 'status')}
            helperText={firstFieldError(errors, 'status')}
            fullWidth
          >
            {INTERN_STATUS_OPTIONS.filter((option) => option.value).map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          label="Bio"
          name="bio"
          value={formData.bio || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'bio')}
          helperText={firstFieldError(errors, 'bio')}
          fullWidth
          multiline
          minRows={3}
        />
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : submitLabel}</Button>
      </Box>
    </Box>
  );
}

export default InternForm;
