import { styled, Box } from '@mui/material';

export const ChatInputContainer = styled(Box)(({ theme, isDarkMode }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.palette.divider}`,
  backgroundColor: isDarkMode ? '#222222' : theme.palette.background.paper,
}));

export const ChatInputInnerBox = styled(Box)(() => ({
  display: 'flex',
  gap: '1.2rem',
})); 