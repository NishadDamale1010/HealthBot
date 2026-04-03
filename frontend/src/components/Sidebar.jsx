import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  HealthAndSafety,
  Assessment,
  Medication,
  Psychology,
  Emergency,
  Timeline,
  FamilyRestroom,
  Science,
  LocalHospital,
  Settings,
  TrendingUp,
  MonitorHeart,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Symptom Checker', icon: <HealthAndSafety />, path: '/symptom-checker' },
  { text: 'Risk Assessment', icon: <Assessment />, path: '/risk-assessment' },
  { text: 'Prescription Scanner', icon: <Medication />, path: '/prescription-scanner' },
  { text: 'Mental Health', icon: <Psychology />, path: '/mental-health' },
  { text: 'Emergency Mode', icon: <Emergency />, path: '/emergency', emergency: true },
  { text: 'Health Timeline', icon: <Timeline />, path: '/timeline' },
  { text: 'Family Dashboard', icon: <FamilyRestroom />, path: '/family' },
  { text: 'Lab Reports', icon: <Science />, path: '/lab-reports' },
];

const advancedMenuItems = [
  { text: 'Digital Twin', icon: <Person />, path: '/advanced/digital-twin' },
  { text: 'Treatment Engine', icon: <LocalHospital />, path: '/advanced/treatment-engine' },
  { text: 'Nutrition Scanner', icon: <TrendingUp />, path: '/advanced/nutrition-scanner' },
  { text: 'Voice Analysis', icon: <MonitorHeart />, path: '/advanced/voice-analysis' },
];

const Sidebar = ({ open, setOpen, emergencyMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: emergencyMode ? '#ffebee' : '#fafafa',
          borderRight: emergencyMode ? '2px solid #d32f2f' : '1px solid #e0e0e0'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          HealthBot AI
        </Typography>
        
        {emergencyMode && (
          <Chip 
            label="Emergency Mode Active" 
            color="error" 
            size="small" 
            sx={{ mb: 2 }}
          />
        )}

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: emergencyMode ? '#ffcdd2' : '#e3f2fd',
                    '&:hover': {
                      backgroundColor: emergencyMode ? '#ef9a9a' : '#bbdefb',
                    }
                  },
                  '&:hover': {
                    backgroundColor: emergencyMode ? '#ffebee' : '#f5f5f5',
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: item.emergency && emergencyMode ? 'error.main' : 'inherit' 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      color: item.emergency && emergencyMode ? 'error.main' : 'inherit',
                      fontWeight: item.emergency && emergencyMode ? 'bold' : 'normal'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Advanced Features
        </Typography>
        
        <List>
          {advancedMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#f3e5f5',
                    '&:hover': {
                      backgroundColor: '#e1bee7',
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#faf5ff',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'secondary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/settings')}>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
