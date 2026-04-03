import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Science } from '@mui/icons-material';

const LabReports = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Science sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
          <Typography variant="h4" component="h1">
            Lab Report Analyzer
          </Typography>
        </Box>
        <Typography variant="body1">
          AI-powered medical result interpretation and analysis.
        </Typography>
      </Paper>
    </Container>
  );
};

export default LabReports;
