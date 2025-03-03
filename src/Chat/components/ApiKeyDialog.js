import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

export const ApiKeyDialog = ({
  isDarkMode,
  open,
  onClose,
  tempApiKey,
  setTempApiKey,
  onSave,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: isDarkMode ? '#1e1e1e' : 'white',
          color: isDarkMode ? 'white' : 'inherit',
        }
      }}
    >
      <DialogTitle>OpenAI API Key</DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
        >
          Please enter your OpenAI API key to use this application. Your key will be stored locally in your browser and never sent to our servers.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="API Key"
          type="password"
          fullWidth
          variant="outlined"
          value={tempApiKey}
          onChange={(e) => setTempApiKey(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              '& fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            },
            '& input': {
              color: isDarkMode ? 'white' : 'inherit',
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 