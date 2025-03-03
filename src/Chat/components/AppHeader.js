import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import KeyIcon from '@mui/icons-material/Key';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { availableAgents } from '../prompts';

export const AppHeader = ({
  isDarkMode,
  toggleDarkMode,
  isMobile,
  drawerOpen,
  setDrawerOpen,
  selectedAgent,
  setSelectedAgent,
  handleChangeApiKey,
}) => {
  const theme = useTheme();

  const controls = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControl variant="outlined" size="small" sx={{ 
        marginBottom: isMobile ? 2 : 0,
        minWidth: 190, 
        '& .MuiOutlinedInput-root': {
          bgcolor: isDarkMode ? '#2d2d2d' : theme.palette.background.paper,
          borderRadius: 1,
          '& fieldset': {
            borderColor: 'transparent',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          }
        },
        '& .MuiSelect-select': {
          color: isDarkMode ? '#fff' : theme.palette.text.primary,
        },
        '& .MuiInputLabel-root': {
          color: isDarkMode ? '#fff' : theme.palette.text.primary,
          '&.Mui-focused': {
            color: isDarkMode ? '#fff' : theme.palette.text.primary,
          }
        },
        '& .MuiInputLabel-shrink': {
          transform: 'translate(14px, -6px) scale(0.75)',
          '&:not(.Mui-focused)': {
            color: isDarkMode ? '#fff' : theme.palette.text.primary,
          }
        }
      }}>
        <InputLabel sx={{ 
          '&.MuiInputLabel-shrink': {
            background: isDarkMode ? '#2d2d2d' : theme.palette.primary.main,
            paddingX: '4px'
          }
        }}>Select Agent</InputLabel>
        <Select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          label="Select Agent"
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: isDarkMode ? '#2d2d2d' : theme.palette.background.paper,
                '& .MuiMenuItem-root': {
                  color: isDarkMode ? '#fff' : theme.palette.text.primary,
                }
              }
            }
          }}
        >
          {availableAgents.map(agent => (
            <MenuItem key={agent.id} value={agent.id}>
              {agent.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {getCurrentAgent(selectedAgent) && (
        <Tooltip title={getCurrentAgent(selectedAgent).description}>
          <IconButton color="inherit">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Change API Key">
        <IconButton color="inherit" onClick={handleChangeApiKey}>
          <KeyIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
        <IconButton color="inherit" onClick={toggleDarkMode}>
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <AppBar 
      className='chatAppBar'
      position="fixed" 
      sx={{ 
        bgcolor: isDarkMode ? '#0d47a1' : theme.palette.primary.main,
        boxShadow: isDarkMode ? 'none' : 3,
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" sx={{ 
            fontWeight: 500,
            letterSpacing: '0.5px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            QHCH Chat
          </Typography>
        </Box>
        {!isMobile && controls}
      </Toolbar>
    </AppBar>
  );
};

const getCurrentAgent = (selectedAgent) => {
  return availableAgents.find(agent => agent.id === selectedAgent);
}; 