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
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ChatIcon from '@mui/icons-material/Chat';
import { availableAgents } from '../prompts';
import { styled } from '@mui/material/styles';
import { ControlsContainer, StyledFormControl } from '../styled/AppHeader.styled';
import { SessionControls } from './SessionControls'

// Add the keyframes and styled AppBar
const StyledAppBar = styled(AppBar)`
  background: linear-gradient(-55deg, 
rgb(37, 69, 102) 0%, 
rgb(68, 107, 139) 25%,
rgb(85, 138, 174) 50%,
rgb(58, 91, 118) 75%,
    #143556 100%
  );

  &.animate {
    background-size: 300% 300%;
    animation: gradient 35s linear infinite;
  }
  &.fast {
    animation: gradient 10s linear infinite;
  }

  &.dark-mode {
    background: linear-gradient(-55deg, #0a0d15 0%, #1d312eeb 25%, #172f4bc7 50%, #232443b5 75%, #06090b 100%);
    
    &.animate {
      background-size: 300% 300%;
      animation: gradient 35s linear infinite;
    }
    &.fast {
      animation: gradient 10s linear infinite;
    }
  }

  @keyframes gradient {
    0% {
      background-position: 300% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export const AppHeader = ({
  isDarkMode,
  toggleDarkMode,
  isMobile,
  drawerOpen,
  setDrawerOpen,
  selectedAgent,
  getCurrentAgent,
  setSelectedAgent,
  handleChangeApiKey,
  isThinking,
  autoPlayEnabled,
  toggleAutoPlay,
  isVoiceMode,
  toggleVoiceMode,
}) => {
  const theme = useTheme();

  return (
    <StyledAppBar
      className={`chatAppBar ${isDarkMode ? 'dark-mode' : ''} animate ${isThinking ? 'fast' : ''}`}
      position="static"
      sx={{
        boxShadow: 5,
        zIndex: theme.zIndex.drawer + 1,
        position: "static",
        top: 0,
        left: 0,
        right: 0
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
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            QHCH Chat
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: isMobile ? 8 : 2 }}>
          <Tooltip title={isVoiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}>
            <IconButton color="inherit" onClick={toggleVoiceMode}>
              {isVoiceMode ? <ChatIcon /> : <RecordVoiceOverIcon />}
            </IconButton>
          </Tooltip>
          {!isVoiceMode && (<>
              <Tooltip
                title={autoPlayEnabled ? "Disable Auto Play" : "Enable Auto Play"}
              >
                <IconButton color="inherit" onClick={toggleAutoPlay}>
                  {autoPlayEnabled ? <PlayCircleFilledIcon /> : <PlayCircleOutlineIcon />}
                </IconButton>
              </Tooltip>
            </>)}
          {!isMobile && 
            <SessionControls 
              isDarkMode={isDarkMode}
              isMobile={isMobile}
              theme={theme}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
              availableAgents={availableAgents}
              getCurrentAgent={getCurrentAgent}
              handleChangeApiKey={handleChangeApiKey}
              toggleDarkMode={toggleDarkMode}
            />
          }
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};