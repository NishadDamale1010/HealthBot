import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Lightbulb } from '@mui/icons-material';

const ExplainableAI = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Lightbulb sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
          <Typography variant="h4" component="h1">
            Explainable AI (Why this treatment?)
          </Typography>
        </Box>
        <Typography variant="body1">
          Transparent treatment reasoning and AI explanations.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ExplainableAI;
