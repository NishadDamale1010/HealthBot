import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
} from '@mui/material';
import { HealthAndSafety } from '@mui/icons-material';

const SymptomChecker = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HealthAndSafety sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            AI Symptom Progression Simulator
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          Advanced AI-powered symptom analysis and disease progression prediction.
        </Typography>
        
        <Button variant="contained" sx={{ mt: 2 }}>
          Start Symptom Analysis
        </Button>
      </Paper>
    </Container>
  );
};

export default SymptomChecker;
