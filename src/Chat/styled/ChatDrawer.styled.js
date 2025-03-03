import { styled, Drawer, Box } from '@mui/material';
import { drawerWidth } from '../constants/storage';

export const StyledDrawer = styled(Drawer)(({ isDarkMode, theme, isMobile }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: isDarkMode ? '#161616' : 'white',
    top: isMobile ? 0 : '64px',
    height: isMobile ? '100%' : 'calc(100% - 64px)',
    '& > .MuiToolbar-root': {
      display: isMobile ? 'block' : 'none'
    }
  }
}));

export const HeaderContainer = styled(Box)(({ theme, isDarkMode }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`
})); 