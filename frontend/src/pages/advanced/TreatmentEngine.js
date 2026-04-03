import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

const TreatmentEngine = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalHospital sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Adaptive Treatment Recommendation Engine
          </Typography>
        </Box>
        <Typography variant="body1">
          ML-based personalized treatment suggestions and recommendations.
        </Typography>
      </Paper>
    </Container>
  );
};

export default TreatmentEngine;
