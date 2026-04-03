import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Language } from '@mui/icons-material';

const MultiLanguage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Language sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Multi-language + Local Dialect Support
          </Typography>
        </Box>
        <Typography variant="body1">
          Global accessibility with multi-language support.
        </Typography>
      </Paper>
    </Container>
  );
};

export default MultiLanguage;
