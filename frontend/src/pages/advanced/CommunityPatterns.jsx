import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Public } from '@mui/icons-material';

const CommunityPatterns = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Public sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
          <Typography variant="h4" component="h1">
            Community Disease Pattern Detection
          </Typography>
        </Box>
        <Typography variant="body1">
          Public health monitoring and disease pattern analysis.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CommunityPatterns;
