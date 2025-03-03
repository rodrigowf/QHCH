import React from 'react';
import {
  Drawer,
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
  controls,
}) => {
  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: isDarkMode ? '#161616' : 'white',
          top: { xs: 0, sm: 64 },
          height: { xs: '100%', sm: 'calc(100% - 64px)' },
          '& > .MuiToolbar-root': {
            display: { sm: 'none' }
          }
        },
      }}
      PaperProps={{
        sx: {
          bgcolor: isDarkMode ? '#161616' : 'white',
        }
      }}
    >
      {isMobile && <Toolbar />}
      <Box sx={{ 
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDarkMode ? '#161616' : 'background.paper',
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}>
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
        </Box>
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
      {isMobile && controls}
    </Drawer>
  );
}; 