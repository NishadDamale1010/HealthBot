import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const SettingsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'default.main' }} />
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
        </Box>
        <Typography variant="body1">
          Application settings and preferences.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
