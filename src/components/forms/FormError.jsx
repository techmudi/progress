import { Alert } from '@mui/material';
import { generalMessageFromApiError } from '../../utils/formErrors';

function FormError({ error, fallback = 'The request could not be completed.' }) {
  if (!error) return null;

  return (
    <Alert severity={error.type === 'conflict' ? 'warning' : 'error'} sx={{ mb: 2 }}>
      {generalMessageFromApiError(error, fallback)}
    </Alert>
  );
}

export default FormError;
