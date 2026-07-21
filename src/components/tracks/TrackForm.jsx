import { Box, Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import { firstFieldError, hasFieldError } from '../../utils/formErrors';

function TrackForm({ formData, errors = {}, saving = false, onChange, onSubmit, onCancel, submitLabel = 'Save Track' }) {
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
          label="Slug"
          name="slug"
          value={formData.slug || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'slug')}
          helperText={firstFieldError(errors, 'slug') || 'Leave blank to let the backend generate or preserve the slug.'}
          fullWidth
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description || ''}
          onChange={onChange}
          error={hasFieldError(errors, 'description')}
          helperText={firstFieldError(errors, 'description')}
          fullWidth
          multiline
          minRows={3}
        />
        <FormControlLabel
          control={<Checkbox name="is_active" checked={Boolean(formData.is_active)} onChange={onChange} />}
          label="Active track"
        />
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : submitLabel}</Button>
      </Box>
    </Box>
  );
}

export default TrackForm;
