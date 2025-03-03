import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
// Import our styled components
import { StyledDialogContentText, StyledTextField } from '../styled/ApiKeyDialog.styled';

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
        <StyledDialogContentText isDarkMode={isDarkMode}>
          Please enter your OpenAI API key to use this application. Your key will be stored locally in your browser and never sent to our servers.
        </StyledDialogContentText>
        <StyledTextField
          autoFocus
          margin="dense"
          label="API Key"
          type="password"
          fullWidth
          variant="outlined"
          value={tempApiKey}
          onChange={(e) => setTempApiKey(e.target.value)}
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