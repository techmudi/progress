import { Alert, Button } from '@mui/material';

function messageFor(error) {
  if (error?.type === 'forbidden') return error.message || 'You are not allowed to view this resource.';
  if (error?.type === 'not_found') return error.message || 'The requested resource could not be found.';
  if (error?.type === 'conflict') return error.message || 'The request conflicts with the current workflow state.';
  return error?.message || 'Unable to load this resource.';
}

function severityFor(error) {
  if (error?.type === 'conflict') return 'warning';
  if (error?.type === 'not_found') return 'info';
  return 'error';
}

function ApiState({ error, onRetry }) {
  if (!error) return null;

  return (
    <Alert
      severity={severityFor(error)}
      action={onRetry ? <Button color="inherit" size="small" onClick={onRetry}>Retry</Button> : null}
    >
      {messageFor(error)}
    </Alert>
  );
}

export default ApiState;
