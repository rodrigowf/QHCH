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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
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
  handleDeleteConversation,
  formatTimestamp,
  selectedAgent,
  setSelectedAgent,
  getCurrentAgent,
  handleChangeApiKey,
  toggleDarkMode,
  theme,
}) => {
  // State to track which conversation to delete
  const [conversationToDelete, setConversationToDelete] = React.useState(null);

  return (
    <>
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
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    px: 2,
                  }}
                >
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
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
                  </Box>
                  <IconButton 
                    onClick={(e) => {
                      // Prevent the list item click event from triggering
                      e.stopPropagation();
                      setConversationToDelete(conv);
                    }}
                    edge="end"
                  >
                    <DeleteIcon color="disabled" />
                  </IconButton>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </StyledDrawer>

      {/* Confirmation dialog for deletion */}
      <Dialog
        open={Boolean(conversationToDelete)}
        onClose={() => setConversationToDelete(null)}
      >
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConversationToDelete(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (conversationToDelete) {
                handleDeleteConversation(conversationToDelete.id);
              }
              setConversationToDelete(null);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 