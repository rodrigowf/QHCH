import React from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export const ChatInput = ({
  isDarkMode,
  input,
  setInput,
  loading,
  apiKey,
  handleSend,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{
      p: 2,
      borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.palette.divider}`,
      bgcolor: isDarkMode ? '#222222' : theme.palette.background.paper,
    }}>
      <Box sx={{
        display: 'flex',
        gap: 1
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={apiKey ? "Type your message..." : "Please set your OpenAI API key first"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={!apiKey || loading}
          multiline
          maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: isDarkMode ? '#2d2d2d' : 'rgba(0, 0, 0, 0.02)',
              '&:hover': {
                backgroundColor: isDarkMode ? '#333333' : 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-focused': {
                backgroundColor: isDarkMode ? '#333333' : 'rgba(0, 0, 0, 0.06)',
              },
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : theme.palette.primary.main,
              }
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!apiKey || loading}
          sx={{
            borderRadius: 2,
            minWidth: '50px',
            height: '56px',
            boxShadow: isDarkMode ? 'none' : 2,
            bgcolor: '#2196f3',
            '&:hover': {
              bgcolor: '#1976d2',
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </Button>
      </Box>
    </Box>
  );
}; 