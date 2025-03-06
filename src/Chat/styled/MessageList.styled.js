import { styled, List, Box } from '@mui/material';

export const StyledList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  height: '100%',
  padding: theme.spacing(2),
  '& > *:not(:last-child)': {
    marginBottom: theme.spacing(2),
  },
}));

export const MessageBox = styled(Box)(({ theme, isDarkMode, role, isMobile }) => ({
  maxWidth: isMobile ? '99%' : '80%',
  backgroundColor: (role === 'user') ? (isDarkMode ? '#2c3e50' : '#3c5e80') : (isDarkMode ? '#2d2d2d' : 'rgba(0, 0, 0, 0.05)'),
  color: role === 'user' ? '#ffffff' : theme.palette.text.primary,
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(1.5, 2.5),
  boxShadow: isDarkMode ? 'none' : theme.shadows[1],
  border: role !== 'user' && isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.6
})); 