import { Chip } from '@mui/material';

function StatusChip({ status }) {
  const color = status === 'Active' ? 'success' : status === 'Inactive' ? 'default' : 'info';

  return <Chip label={status} color={color} size="small" />;
}

export default StatusChip;
