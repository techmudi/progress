import { Box, Button, Typography } from '@mui/material';

function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 3,
        p: 6,
        textAlign: 'center',
        bgcolor: 'grey.50',
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;
