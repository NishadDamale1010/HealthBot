import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { FamilyRestroom } from '@mui/icons-material';

const FamilyDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FamilyRestroom sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Multi-user Family Health Dashboard
          </Typography>
        </Box>
        <Typography variant="body1">
          Family-wide health tracking and monitoring.
        </Typography>
      </Paper>
    </Container>
  );
};

export default FamilyDashboard;
