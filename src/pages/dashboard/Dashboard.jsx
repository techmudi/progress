import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccountTree,
  AssignmentTurnedIn,
  CheckCircle,
  Groups,
  People,
  PersonAdd,
  PlaylistAdd,
  TaskAlt,
} from '@mui/icons-material';

const statistics = [
  { label: 'Total Users', value: 0, icon: <People />, color: '#719430' },
  { label: 'Interns', value: 0, icon: <Groups />, color: '#719430' },
  { label: 'Supervisors', value: 0, icon: <PersonAdd />, color: '#719430' },
  { label: 'Active Projects', value: 0, icon: <AccountTree />, color: '#719430' },
  { label: 'Pending Tasks', value: 0, icon: <TaskAlt />, color: '#719430' },
  { label: 'Completed Tasks', value: 0, icon: <AssignmentTurnedIn />, color: '#719430' },
];

const projects = [
  { name: 'Website Redesign', status: 'Active', members: 0, progress: 0 },
  { name: 'Inventory Planning', status: 'Planning', members: 0, progress: 0 },
  { name: 'Platform', status: 'Completed', members: 0, progress: 0 },
];

const activity = ['New project created', 'User account added', 'Supervisor assigned', 'Task completed', 'Project updated'];
const messages = [
  'Great projects begin with organized teams.',
  'Progress grows when teams work together.',
  'Small, consistent steps deliver great results.',
];

const cardHoverSx = {
  transition: 'transform 0.2s ease, box-shadow 0.5s ease',
  '&:hover': {
    transform: "translateY(-6px)",
    boxShadow: "#719430 1px 5px 10px",
    borderRadius: 3,
    cursor: 'pointer',
  },
};

function Dashboard() {
  const [messageIndex, setMessageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <Box sx={{ width: '95%', maxWidth: 1450, mx: 'auto' }}>
      <Paper
        sx={{
          p: { xs: 1, md: 2.5 },
          borderRadius: 3,
          mb: 3,
          bgcolor: '#719430',
          width: { xs: '100%', md: '70%' },
          maxWidth: 770,
          alignSelf: 'flex-start',
        }}
      >
        <Stack direction="column" spacing={0.75} alignItems="flex-start" sx={{ mb: 0 }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#ffffff' }}>
            Welcome Back, Administrator!
          </Typography>
          <Typography variant="body1" sx={{ color: '#ffffff', maxWidth: 700 }}>
            Manage users, projects, tasks, and supervisors from one centralized platform.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        {statistics.map((stat) => (
          <Grid item xs={12} sm={6} lg={2} key={stat.label}>
            <Paper sx={{ ...cardHoverSx, p: 2.5, borderRadius: 3, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="#719430" variant="body2">
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    color: stat.color,
                    bgcolor: `${stat.color}50`,
                    borderRadius: 4,
                    p: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          mt: 3,
          mb: 3,
          bgcolor: '#ffffff',
          width: { xs: '100%', md: '70%' },
          maxWidth: 760,
          alignSelf: 'flex-start',
        }}
      >
        <Typography color="#719430" sx={{ mt: 1, maxWidth: 700, mb: 2 }} variant="h6" fontWeight={700}>
          Quick Actions
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ color: '#719430' }} spacing={1.5} flexWrap="wrap">
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => navigate('/users/create')}>
            Create User
          </Button>
          <Button variant="contained" startIcon={<PlaylistAdd />} onClick={() => navigate('/projects/create')}>
            Create Project
          </Button>
          <Button variant="contained" startIcon={<TaskAlt />} onClick={() => navigate('/tasks/create')}>
            Create Task
          </Button>
          <Button variant="contained">View Reports</Button>
        </Stack>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ ...cardHoverSx, p: 1, borderRadius: 1, height: '100%' }}>
            <Typography color="#719430" sx={{ mt: 1, maxWidth: 700, mb: 2 }} variant="h6" fontWeight={700}>
              Recent Activity
            </Typography>
            <Stack spacing={1.5}>
              {activity.map((item) => (
                <Typography key={item}>• {item}</Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography color="#719430" sx={{ mt: 1, maxWidth: 700, mb: 2 }} variant="h6" fontWeight={800}>
              Upcoming Deadlines
            </Typography>
            <Stack spacing={1.4}>
              <Typography><strong>Website Redesign</strong></Typography>
              <Typography><strong>Mobile App MVP</strong></Typography>
              <Typography><strong>Database Migration</strong></Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography color="#719430" sx={{ mt: 1, maxWidth: 700, mb: 2 }} variant="h6" fontWeight={700}>
              Projects Overview
            </Typography>
            <Stack spacing={2.5}>
              {projects.map((project) => (
                <Box key={project.name}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Box>
                      <Typography fontWeight={700}>{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.members} members · {project.progress}% progress
                      </Typography>
                    </Box>
                    <Chip
                      label={project.status}
                      size="small"
                      variant="filled"
                      sx={{
                        bgcolor: '#719430',
                        color: '#ffffff',
                        fontWeight: 700,
                        borderRadius: 2,
                      }}
                    />
                  </Stack>
                  <LinearProgress variant="determinate" value={project.progress} sx={{ mt: 5, borderRadius: 2, height: 7 }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography color="#719430" sx={{ mt: 1, maxWidth: 700, mb: 2 }} variant="h6" fontWeight={700}>
              Team Overview
            </Typography>
            <Stack spacing={1.3}>
              {['Administrators: 0', 'Supervisors: 0', 'Interns: 0', 'Developers: 0'].map((team) => (
                <Typography key={team}>{team}</Typography>
              ))}
            </Stack>
            <Divider sx={{ my: 2.5 }} />
            <Typography color="#719430" sx={{ mt: 1, maxWidth: 700, mb: 1.5 }} variant="h6" fontWeight={700}>
              System Status
            </Typography>
            <Stack spacing={1.2}>
              {['Server Status — Online', 'Database — Connected', 'API — Running'].map((status) => (
                <Stack key={status} direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography>{status}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ ...cardHoverSx, p: 3, borderRadius: 3, mt: 3, bgcolor: '#ffffff', textAlign: 'center' }}>
        <Typography fontWeight={700} color="#719430">“{messages[messageIndex]}”</Typography>
        <Typography sx={{ mt: 1.5 }} color="#000000">
          Keep project tasks updated regularly to improve collaboration and track progress accurately.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Dashboard;