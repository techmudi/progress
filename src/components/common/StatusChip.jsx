import { Chip } from '@mui/material';
import {
  activeStateLabel,
  internStatusLabel,
  projectModuleStatusLabel,
  projectStatusLabel,
} from '../../utils/presentation';

const statusColors = {
  planned: 'info',
  active: 'success',
  inactive: 'default',
  on_hold: 'warning',
  pending: 'warning',
  suspended: 'warning',
  completed: 'success',
  withdrawn: 'default',
  cancelled: 'default',
};

function StatusChip({ status, type = 'generic' }) {
  const normalized = typeof status === 'boolean'
    ? (status ? 'active' : 'inactive')
    : String(status || '').toLowerCase();
  let label = typeof status === 'boolean' ? activeStateLabel(status) : status || 'Not available';

  if (type === 'intern') {
    label = internStatusLabel(normalized);
  } else if (type === 'project') {
    label = projectStatusLabel(normalized);
  } else if (type === 'module') {
    label = projectModuleStatusLabel(normalized);
  }

  const color = statusColors[normalized] || 'info';

  return <Chip label={label} color={color} size="small" />;
}

export default StatusChip;
