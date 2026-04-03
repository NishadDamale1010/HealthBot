import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { BluetoothConnected } from '@mui/icons-material';

const WearableSync = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BluetoothConnected sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
          <Typography variant="h4" component="h1">
            Wearable Data Sync / Simulation
          </Typography>
        </Box>
        <Typography variant="body1">
          IoT device integration and health data synchronization.
        </Typography>
      </Paper>
    </Container>
  );
};

export default WearableSync;
