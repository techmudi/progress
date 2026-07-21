import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { getEligibleProjectMemberUsers } from '../../services/projectService';
import { firstFieldError, hasFieldError } from '../../utils/formErrors';
import { rolesLabel } from '../../utils/presentation';

const emptyExcludedUserIds = [];

function ProjectMemberUserSelect({
  memberRole,
  value,
  onChange,
  excludedUserIds = emptyExcludedUserIds,
  error,
  disabled = false,
  required = false,
  label = 'Eligible user',
}) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const selected = useMemo(
    () => options.find((option) => String(option.id) === String(value)) || null,
    [options, value],
  );
  const excludedKey = useMemo(() => excludedUserIds.map(String).sort().join(','), [excludedUserIds]);

  useEffect(() => {
    if (!memberRole) {
      setOptions([]);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setLoadError('');

      try {
        const result = await getEligibleProjectMemberUsers(memberRole, inputValue, excludedUserIds, controller.signal);
        setOptions(result.items || []);
      } catch (caught) {
        if (caught?.type !== 'cancelled') {
          setLoadError(caught.message || 'Unable to load eligible users.');
          setOptions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [excludedKey, excludedUserIds, inputValue, memberRole]);

  return (
    <Autocomplete
      options={options}
      value={selected}
      inputValue={inputValue}
      onInputChange={(_event, nextValue) => setInputValue(nextValue)}
      onChange={(_event, nextValue) => onChange(nextValue?.id || '', nextValue)}
      getOptionLabel={(option) => option ? `${option.name} · ${option.email}` : ''}
      isOptionEqualToValue={(option, selectedOption) => option.id === selectedOption.id}
      loading={loading}
      disabled={disabled || !memberRole}
      noOptionsText={loadError || 'No eligible active users found'}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={Boolean(loadError) || hasFieldError(error, 'user_id')}
          helperText={loadError || firstFieldError(error, 'user_id') || (selected ? rolesLabel(selected.roles || []) : 'Search by name or email')}
        />
      )}
    />
  );
}

export default ProjectMemberUserSelect;
