import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { MonitorHeart } from '@mui/icons-material';

const VoiceAnalysis = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <MonitorHeart sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
          <Typography variant="h4" component="h1">
            Voice Stress & Breathing Analysis
          </Typography>
        </Box>
        <Typography variant="body1">
          Vocal biomarker detection and stress analysis.
        </Typography>
      </Paper>
    </Container>
  );
};

export default VoiceAnalysis;
