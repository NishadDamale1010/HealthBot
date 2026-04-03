import React from 'react';
import { Alert, Box, Typography } from '@mui/material';

const EmergencyMode = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Emergency Mode</Typography>
      <Alert severity="error">
        Emergency mode is active. Contact local emergency services immediately for life-threatening symptoms.
      </Alert>
    </Box>
  );
};

export default EmergencyMode;
