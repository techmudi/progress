import MainLayout from "../components/layout/MainLayout";
import { Card, Grid, Typography } from "@mui/material";

const Dashboard = () => {
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">0</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Interns</Typography>
            <Typography variant="h3">0</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Supervisors</Typography>
            <Typography variant="h3">0</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Projects</Typography>
            <Typography variant="h3">0</Typography>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Dashboard;
