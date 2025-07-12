import React, { useState, useContext, useEffect } from 'react';
import bonton from '../../assets/images/bontonlogo.png';
import axios from "axios";
import { Logout, Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SearchContext } from '../Search/search';
import { useNavigate } from "react-router-dom";
import {BASE_URL} from "../API Config/config";

const EnhancedNavbar = ({ toggleDrawer }) => {
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const username = userData.username || "User";
  const currentLoginTime = userData.current_login_time || "";
  const lastLoginTime = userData.last_login_time || "First time login";

  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { setSearchTerm } = useContext(SearchContext);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      if (userData?.user_id) {
        await axios.get(`${BASE_URL}/api/method/set_logout_time`, {
          params: { user_id: userData.user_id }
        });
      }
    } catch (error) {
      console.error("Logout time error:", error);
    } finally {
      localStorage.removeItem("userData");
      navigate("/");
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const date = new Date(timeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  useEffect(() => {
    const handleToggle = () => {
      const event = new CustomEvent("toggleCollapse");
      window.dispatchEvent(event);
    };
    window.handleSidebarToggle = () => {
      if (isMobile) {
        toggleDrawer();
      } else {
        handleToggle();
      }
    };
  }, [isMobile, toggleDrawer]);

  const renderMenu = (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
      <MenuItem onClick={handleLogout}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Logout fontSize="small" style={{ marginRight: 8, color: '#d32f2f' }} />
          <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
            Logout
          </Typography>
        </Box>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#fff', color: '#000', zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left: Toggle + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => {
                if (isMobile) {
                  toggleDrawer();
                } else {
                  const event = new CustomEvent("toggleCollapse");
                  window.dispatchEvent(event);
                }
              }}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <img style={{ height: "40px", width: "170px" }} src={bonton} alt="BonTon" />
          </Box>

          {/* Right: User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                {/* Welcome */}
                <Typography variant="body1" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  Welcome <span style={{ color: '#ff8d03' }}>{username}</span>
                </Typography>

                {/* Divider */}
                 <Divider
      orientation="vertical"
      flexItem
      sx={{ mx: 2, borderColor: '#FF9006', borderRightWidth: 2 }}
    />


                {/* Times */}
                <Box sx={{ display: 'flex', flexDirection: 'column', marginright: '180px' }}>
                  <Typography variant="body2">
                    🔓 Current Login: <strong style={{ color: '#FF9006' }}>{formatTime(currentLoginTime)}</strong>
                  </Typography>
                  <Typography variant="body2">
                    🕓 Last Login: <strong style={{ color: '#FF9006' }}>{lastLoginTime || "First time login"}</strong>
                  </Typography>
                </Box>
              </Box>
            )}
            <IconButton onClick={handleMenu}>
              <Avatar sx={{ bgcolor: '#FF9006' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {renderMenu}
    </>
  );
};

export default EnhancedNavbar;
