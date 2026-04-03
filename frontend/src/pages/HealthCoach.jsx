import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const HealthCoach = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUp sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
          <Typography variant="h4" component="h1">
            AI Health Coach
          </Typography>
        </Box>
        <Typography variant="body1">
          Daily personalized wellness guidance and health coaching.
        </Typography>
      </Paper>
    </Container>
  );
};

export default HealthCoach;
