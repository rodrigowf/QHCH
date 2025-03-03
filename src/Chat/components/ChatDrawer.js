import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Toolbar,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { drawerWidth } from '../constants/storage';
import { SessionControls } from './SessionControls'


// Import styled components for ChatDrawer
import { StyledDrawer, HeaderContainer } from '../styled/ChatDrawer.styled';

export const ChatDrawer = ({
  isDarkMode,
  isMobile,
  drawerOpen,
  setDrawerOpen,
  conversations,
  selectedConversation,
  loadConversation,
  startNewConversation,
  handleBackupConversations,
  formatTimestamp,
  selectedAgent,
  setSelectedAgent,
  getCurrentAgent,
  handleChangeApiKey,
  toggleDarkMode,
  theme,
}) => {
  return (
    <StyledDrawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      isDarkMode={isDarkMode}
      isMobile={isMobile}
    >
      {isMobile && (
        <SessionControls 
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          theme={theme}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          getCurrentAgent={getCurrentAgent}
          handleChangeApiKey={handleChangeApiKey}
          toggleDarkMode={toggleDarkMode}
        />
      )}
      <Box sx={{ 
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDarkMode ? '#161616' : 'background.paper',
      }}>
        <HeaderContainer isDarkMode={isDarkMode}>
          <ListItemButton 
            onClick={startNewConversation}
            sx={{
              borderRadius: 1,
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <AddIcon sx={{ mr: 1 }} />
            <ListItemText primary="New Conversation" />
          </ListItemButton>
          <Tooltip title="Backup Conversations">
            <IconButton 
              onClick={handleBackupConversations}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                }
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </HeaderContainer>
        <List sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          '& .MuiListItemButton-root': {
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
          }
        }}>
          {conversations.map((conv) => (
            <ListItem key={conv.id} disablePadding>
              <ListItemButton 
                selected={selectedConversation === conv.id}
                onClick={() => loadConversation(conv.id)}
                sx={{ 
                  display: 'block',
                  py: 1,
                  px: 2,
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {conv.agent}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    mb: 0.5,
                  }}
                >
                  {conv.preview}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.disabled',
                    display: 'block',
                  }}
                >
                  {formatTimestamp(conv.timestamp)}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </StyledDrawer>
  );
}; 