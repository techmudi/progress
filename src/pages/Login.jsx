import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login() {
const navigate = useNavigate();

const handleLogin = () => {
    navigate("/dashboard");
};

return (
    <Box
    sx={{
        height: "100vh",
        backgroundColor: "#f4f6f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }}
    >
    <Paper elevation={3} sx={{ width: 400, padding: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" fontWeight="bold" mb={1}>
        Management System Platform
        </Typography>

        <Typography variant="body2" align="center" color="text.secondary" mb={4}>
        Sign in to continue
        </Typography>

        <TextField fullWidth label="Email" margin="normal" />

        <TextField fullWidth label="Password" type="password" margin="normal" />

        <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3, py: 1.5 }}
        onClick={handleLogin}
        >
        Login
        </Button>
    </Paper>
    </Box>
);
}

export default Login;
