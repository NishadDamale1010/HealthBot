import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Person } from '@mui/icons-material';

const DigitalTwin = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Person sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
          <Typography variant="h4" component="h1">
            Digital Twin Health Model
          </Typography>
        </Box>
        <Typography variant="body1">
          Personalized health digital replica for predictive analysis.
        </Typography>
      </Paper>
    </Container>
  );
};

export default DigitalTwin;
