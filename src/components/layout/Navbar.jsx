import { useState } from 'react';
import { AccountCircle, Logout } from '@mui/icons-material';
import { IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMenuOpen = Boolean(anchorEl);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        height: '70px',
        background: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 30px',
        boxShadow: '0 2px #719430',
        marginLeft: '260px',
      }}
    >
      <h3>Dashboard</h3>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {user?.name || user?.email}
        </Typography>
        <IconButton aria-label="Open account menu" onClick={(event) => setAnchorEl(event.currentTarget)}>
          <AccountCircle />
        </IconButton>
        <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Navbar;
