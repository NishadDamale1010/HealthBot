import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
} from '@mui/material';
import { Assessment } from '@mui/icons-material';

const RiskAssessment = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Assessment sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
          <Typography variant="h4" component="h1">
            Personalized Health Risk Scoring
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          Comprehensive risk assessment using AI algorithms and personalized health data.
        </Typography>
        
        <Button variant="contained" color="warning" sx={{ mt: 2 }}>
          Start Risk Assessment
        </Button>
      </Paper>
    </Container>
  );
};

export default RiskAssessment;
