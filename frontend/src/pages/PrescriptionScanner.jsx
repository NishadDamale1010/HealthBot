import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
} from '@mui/material';
import { Medication } from '@mui/icons-material';

const PrescriptionScanner = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Medication sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
          <Typography variant="h4" component="h1">
            Prescription Image Scanner + Drug Safety Checker
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          OCR-powered prescription scanning with comprehensive drug safety analysis.
        </Typography>
        
        <Button variant="contained" color="info" sx={{ mt: 2 }}>
          Scan Prescription
        </Button>
      </Paper>
    </Container>
  );
};

export default PrescriptionScanner;
