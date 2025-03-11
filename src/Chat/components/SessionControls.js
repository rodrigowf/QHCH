import React from 'react';
import {
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import KeyIcon from '@mui/icons-material/Key';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ControlsContainer, StyledFormControl } from '../styled/AppHeader.styled';
import { availableAgents } from '../prompts';

export const SessionControls = ({
  isDarkMode,
  isMobile,
  theme,
  selectedAgent,
  setSelectedAgent,
  getCurrentAgent,
  handleChangeApiKey,
  toggleDarkMode,
}) => {
    return (
        <ControlsContainer isMobile={isMobile}>
            <StyledFormControl isDarkMode={isDarkMode} isMobile={isMobile} variant="outlined" size="small">
            <InputLabel>Select Character</InputLabel>
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
                {availableAgents?.map(agent => (
                <MenuItem key={agent.id} value={agent.id}>
                    {agent.name}
                </MenuItem>
                ))}
            </Select>
            </StyledFormControl>
            {!isMobile && getCurrentAgent(selectedAgent) && (
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
        </ControlsContainer>
    );
}

