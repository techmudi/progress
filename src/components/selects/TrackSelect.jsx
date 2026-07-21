import { useEffect, useMemo, useState } from 'react';
import { MenuItem, TextField } from '@mui/material';
import { getTracks } from '../../services/trackService';
import { firstFieldError, hasFieldError } from '../../utils/formErrors';

function TrackSelect({
  name = 'track_id',
  label = 'Track',
  value,
  onChange,
  error,
  required = false,
  activeOnly = false,
  existingTrack = null,
}) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadTracks() {
      setLoading(true);
      setLoadError('');

      try {
        const result = await getTracks({
          is_active: activeOnly ? true : '',
          per_page: 100,
        }, controller.signal);
        setTracks(result.items || []);
      } catch (caught) {
        if (caught?.type !== 'cancelled') {
          setLoadError(caught.message || 'Unable to load tracks.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTracks();

    return () => controller.abort();
  }, [activeOnly]);

  const options = useMemo(() => {
    const byId = new Map(tracks.map((track) => [track.id, track]));

    if (existingTrack?.id && !byId.has(existingTrack.id)) {
      byId.set(existingTrack.id, existingTrack);
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [existingTrack, tracks]);

  return (
    <TextField
      select
      fullWidth
      required={required}
      label={label}
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={loading}
      error={Boolean(loadError) || hasFieldError(error, name)}
      helperText={loadError || firstFieldError(error, name) || (loading ? 'Loading tracks...' : '')}
    >
      <MenuItem value="">No track selected</MenuItem>
      {options.length === 0 && !loading && <MenuItem disabled>No tracks available</MenuItem>}
      {options.map((track) => (
        <MenuItem key={track.id} value={track.id}>
          {track.name}{track.is_active === false ? ' (inactive)' : ''}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default TrackSelect;
