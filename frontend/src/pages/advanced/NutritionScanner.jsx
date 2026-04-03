import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const NutritionScanner = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUp sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
          <Typography variant="h4" component="h1">
            Food Image Scanner with Nutrition Breakdown
          </Typography>
        </Box>
        <Typography variant="body1">
          Visual calorie counting and nutritional analysis.
        </Typography>
      </Paper>
    </Container>
  );
};

export default NutritionScanner;
