import { styled } from '@mui/material';
import { DialogContentText, TextField } from '@mui/material';

export const StyledDialogContentText = styled(DialogContentText)(({ theme, isDarkMode }) => ({
  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
}));

export const StyledTextField = styled(TextField)(({ theme, isDarkMode }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
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
})); 