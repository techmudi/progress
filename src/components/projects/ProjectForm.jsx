import { useEffect, useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import FormError from '../forms/FormError';
import { fieldsFromApiError, firstFieldError, hasFieldError } from '../../utils/formErrors';
import { PROJECT_PRIORITY_OPTIONS } from '../../utils/presentation';

const defaultValues = {
  name: '',
  slug: '',
  description: '',
  priority: 'medium',
  start_date: '',
  expected_end_date: '',
};

function ProjectForm({
  initialValues = defaultValues,
  error,
  saving = false,
  submitLabel = 'Save Project',
  onSubmit,
}) {
  const [values, setValues] = useState({ ...defaultValues, ...initialValues });
  const [localErrors, setLocalErrors] = useState({});
  const apiErrors = fieldsFromApiError(error);

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const fieldError = (field) => firstFieldError(localErrors, field) || firstFieldError(apiErrors, field);
  const fieldHasError = (field) => hasFieldError(localErrors, field) || hasFieldError(apiErrors, field);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setLocalErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (values.start_date && values.expected_end_date && values.expected_end_date < values.start_date) {
      setLocalErrors({
        expected_end_date: ['The expected end date must be on or after the start date.'],
      });
      return;
    }

    onSubmit(values);
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      <FormError error={error} fallback="Unable to save project." />
      <TextField
        label="Project name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={fieldHasError('name')}
        helperText={fieldError('name')}
        fullWidth
        required
      />
      <TextField
        label="Slug"
        name="slug"
        value={values.slug}
        onChange={handleChange}
        error={fieldHasError('slug')}
        helperText={fieldError('slug') || 'Leave blank on create to let the server generate it from the name.'}
        fullWidth
      />
      <TextField
        select
        label="Priority"
        name="priority"
        value={values.priority}
        onChange={handleChange}
        error={fieldHasError('priority')}
        helperText={fieldError('priority')}
        fullWidth
      >
        {PROJECT_PRIORITY_OPTIONS.filter((option) => option.value).map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Start date"
          name="start_date"
          type="date"
          value={values.start_date || ''}
          onChange={handleChange}
          error={fieldHasError('start_date')}
          helperText={fieldError('start_date')}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Expected end date"
          name="expected_end_date"
          type="date"
          value={values.expected_end_date || ''}
          onChange={handleChange}
          error={fieldHasError('expected_end_date')}
          helperText={fieldError('expected_end_date')}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Stack>
      <TextField
        label="Description"
        name="description"
        value={values.description || ''}
        onChange={handleChange}
        error={fieldHasError('description')}
        helperText={fieldError('description')}
        multiline
        rows={4}
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={saving} sx={{ alignSelf: 'flex-start' }}>
        {saving ? 'Saving...' : submitLabel}
      </Button>
    </Stack>
  );
}

export default ProjectForm;
