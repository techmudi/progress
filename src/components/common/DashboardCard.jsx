import { Card, CardContent, Typography } from '@mui/material';

function DashboardCard({ title, value, caption }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
        },
      }}
    >
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={600}>
          {value}
        </Typography>
        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default DashboardCard;