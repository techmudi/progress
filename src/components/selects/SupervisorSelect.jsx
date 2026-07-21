import { useEffect, useState } from 'react';
import { MenuItem, TextField } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getEligibleSupervisors } from '../../services/userService';
import { firstFieldError, hasFieldError } from '../../utils/formErrors';
import { rolesLabel } from '../../utils/presentation';

function SupervisorSelect({ name = 'supervisor_id', label = 'Supervisor', value, onChange, error }) {
  const { user, hasAnyRole } = useAuth();
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadSupervisors() {
      setLoading(true);
      setLoadError('');

      try {
        const result = await getEligibleSupervisors(controller.signal);
        setSupervisors(result.items || []);
      } catch (caught) {
        if (caught?.type !== 'cancelled') {
          if (caught?.type === 'forbidden' && hasAnyRole(['admin', 'supervisor'])) {
            setSupervisors([user]);
          } else {
            setLoadError(caught.message || 'Unable to load supervisors.');
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadSupervisors();

    return () => controller.abort();
  }, [hasAnyRole, user]);

  return (
    <TextField
      select
      fullWidth
      label={label}
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={loading}
      error={Boolean(loadError) || hasFieldError(error, name)}
      helperText={loadError || firstFieldError(error, name) || (loading ? 'Loading supervisors...' : '')}
    >
      <MenuItem value="">No supervisor selected</MenuItem>
      {supervisors.length === 0 && !loading && <MenuItem disabled>No eligible supervisors available</MenuItem>}
      {supervisors.map((user) => (
        <MenuItem key={user.id} value={user.id}>
          {user.name} · {rolesLabel(user.roles || [])}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default SupervisorSelect;
