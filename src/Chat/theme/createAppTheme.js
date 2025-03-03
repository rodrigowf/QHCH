import { createTheme } from '@mui/material';

export const createAppTheme = (isDarkMode) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: isDarkMode ? {
      main: '#76b6fd',
      light: '#aed1ff',
      dark: '#809de0'
    } : {
      main: '#4c6797',
      light: '#3a4a5e',
      dark: '#1f2a38'
    },
    background: isDarkMode ? {
      default: '#161616',
      paper: '#1b1b1b',
      darker: '#121212'
    } : {
      default: '#f8f9fa',
      paper: '#ffffff',
      darker: '#f0f0f0'
    },
    grey: {
      800: isDarkMode ? '#2d2d2d' : '#424242',
      900: isDarkMode ? '#212121' : '#212121',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
          scrollbarColor: isDarkMode ? '#424242 #1a1a1a' : '#bdbdbd #f5f5f5',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? '#424242' : '#bdbdbd',
            borderRadius: '4px',
            '&:hover': {
              background: isDarkMode ? '#616161' : '#9e9e9e',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: isDarkMode ? '#161616' : '#ffffff',
          borderRight: `1px solid ${isDarkMode ? '#2d2d2d' : '#e0e0e0'}`,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: isDarkMode ? '#fff' : 'inherit',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: isDarkMode ? '#2d2d2d' : '#e3f2fd',
            '&:hover': {
              backgroundColor: isDarkMode ? '#333333' : '#bbdefb',
            },
          },
          '&:hover': {
            backgroundColor: isDarkMode ? '#252525' : '#f5f5f5',
          },
        },
      },
    },
  },
}); 