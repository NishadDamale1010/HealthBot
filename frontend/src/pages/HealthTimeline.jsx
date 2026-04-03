import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Timeline } from '@mui/icons-material';

const HealthTimeline = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Timeline sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
          <Typography variant="h4" component="h1">
            Health Timeline Dashboard
          </Typography>
        </Box>
        <Typography variant="body1">
          Visual health history tracking and trend analysis.
        </Typography>
      </Paper>
    </Container>
  );
};

export default HealthTimeline;
