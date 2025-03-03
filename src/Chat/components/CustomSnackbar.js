import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export const CustomSnackbar = ({
  isDarkMode,
  open,
  onClose,
  message,
  severity,
}) => {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity} 
        sx={{ 
          width: '100%',
          bgcolor: isDarkMode ? '#2d2d2d' : undefined,
          color: isDarkMode ? 'white' : undefined,
          '& .MuiAlert-icon': {
            color: isDarkMode ? 'white' : undefined,
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}; 