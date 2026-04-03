import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
} from '@mui/material';
import { Psychology } from '@mui/icons-material';

const MentalHealth = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Psychology sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
          <Typography variant="h4" component="h1">
            Mental Health Emotion Detection
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          Advanced sentiment analysis and psychological profiling with crisis detection.
        </Typography>
        
        <Button variant="contained" color="secondary" sx={{ mt: 2 }}>
          Start Mental Health Analysis
        </Button>
      </Paper>
    </Container>
  );
};

export default MentalHealth;
