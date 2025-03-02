import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  Box,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  CircularProgress,
  Drawer,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import KeyIcon from '@mui/icons-material/Key';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { agentPrompts, availableAgents } from './prompts';

// Local storage keys
const API_KEY_STORAGE_KEY = 'openai_api_key';
const CONVERSATIONS_STORAGE_KEY = 'qhph_conversations';
const DARK_MODE_STORAGE_KEY = 'qhph_dark_mode';

const drawerWidth = 300;

function Chat({isDarkMode, toggleDarkMode}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('specialist');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(!window.isEmbedded);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#1565c0' : '#2196f3',
        light: isDarkMode ? '#1976d2' : '#64b5f6',
        dark: isDarkMode ? '#0d47a1' : '#1976d2',
      },
      background: {
        default: isDarkMode ? '#0a0a0a' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
        darker: isDarkMode ? '#161616' : '#f0f0f0',
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
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isMobile]);

  // Load API key and conversations from local storage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
        setApiKeyDialogOpen(true);
    }

    // Load conversations from local storage
    const storedConversations = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (storedConversations) {
      try {
        setConversations(JSON.parse(storedConversations));
      } catch (error) {
        console.error('Error parsing stored conversations:', error);
        // Initialize with empty array if parsing fails
        setConversations([]);
      }
    }
  }, []);

  // Save conversations to local storage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, tempApiKey);
      setApiKey(tempApiKey);
      setApiKeyDialogOpen(false);
      showSnackbar('API key saved successfully', 'success');
    } else {
      showSnackbar('Please enter a valid API key', 'error');
    }
  };

  const handleChangeApiKey = () => {
    setTempApiKey(apiKey);
    setApiKeyDialogOpen(true);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      setSelectedAgent(conversation.agentId);
      setSelectedConversation(conversationId);
      if (isMobile) setDrawerOpen(false);
    } else {
      showSnackbar('Failed to load conversation', 'error');
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setSelectedConversation(null);
    if (isMobile) setDrawerOpen(false);
  };

  const saveConversation = (newMessages, agentId) => {
    const timestamp = new Date().toISOString();
    const userMessages = newMessages.filter(msg => msg.role === 'user');
    const preview = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';
    
    const newConversation = {
      id: `conversation-${Date.now()}`,
      timestamp,
      agentId,
      preview,
      agent: availableAgents.find(a => a.id === agentId)?.name || 'Unknown Agent',
      messages: newMessages
    };

    // If we're updating an existing conversation
    if (selectedConversation) {
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation ? 
          { ...conv, messages: newMessages, timestamp, preview } : 
          conv
      ));
      return;
    }

    // Otherwise create a new conversation
    setConversations([newConversation, ...conversations]);
    setSelectedConversation(newConversation.id);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || !apiKey) {
      if (!apiKey) {
        setApiKeyDialogOpen(true);
        return;
      }
      return;
    }
    
    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Get the agent's system prompt
      const systemPrompt = agentPrompts[selectedAgent]?.systemPrompt;
      
      // Build the messages array for the OpenAI API
      let chatMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        newMessage
      ];
      
      // Call OpenAI Chat API directly from the frontend
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "o1",
          messages: chatMessages,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send message');
      }
      
      const data = await response.json();
      
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenAI');
      }
      
      const assistantReply = data.choices[0].message.content;
      const finalMessages = [...updatedMessages, { role: 'assistant', content: assistantReply }];
      
      // Update messages state
      setMessages(finalMessages);
      
      // Save conversation to local storagestorage
      saveConversation(finalMessages, selectedAgent);
      
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
      
      // If the error is related to authentication, prompt for a new API key
      if (error.message.includes('authentication') || error.message.includes('API key')) {
        setApiKeyDialogOpen(true);
      }
    }
    
    setLoading(false);
  };

  const handleBackupConversations = () => {
    try {
      const dataStr = JSON.stringify(conversations, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `qhph-conversations-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showSnackbar('Conversations backed up successfully', 'success');
    } catch (error) {
      console.error('Error backing up conversations:', error);
      showSnackbar('Failed to backup conversations', 'error');
    }
  };

  const getCurrentAgent = () => {
    return availableAgents.find(agent => agent.id === selectedAgent);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

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
      {getCurrentAgent() && (
        <Tooltip title={getCurrentAgent().description}>
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDarkMode ? '#161616' : theme.palette.grey[100]
      }}>
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
                QHPH Chat
              </Typography>
            </Box>
            {!isMobile && controls}
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* Add spacing for the fixed AppBar */}

        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          bgcolor: isDarkMode ? '#161616' : theme.palette.background.default 
        }}>
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
                top: { xs: 0, sm: 64 }, // 64px is the default AppBar height
                height: { xs: '100%', sm: 'calc(100% - 64px)' }, // Subtract AppBar height on desktop
                '& > .MuiToolbar-root': { // Hide the toolbar spacer on desktop
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
            {isMobile && <Toolbar />} {/* Only show toolbar spacer on mobile */}
            <Box sx={{ 
              overflow: 'auto',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: isDarkMode ? '#161616' : theme.palette.background.paper,
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
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.text.primary,
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
                          color: theme.palette.text.primary,
                        }}
                      >
                        {conv.agent}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
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
                          color: theme.palette.text.disabled,
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

          <Container maxWidth="md" sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            py: 3,
            gap: 2,
            height: 'calc(100vh - 60px)',
            bgcolor: isDarkMode ? '#161616' : 'transparent',
            ...(isMobile && {
              padding: '12px',  // Reduce padding on mobile
              maxWidth: '100% !important', // Override Material-UI's maxWidth
            })
          }}>
            <Paper sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: 3,
              borderRadius: isMobile ? 1 : 2,
              bgcolor: isDarkMode ? '#1e1e1e' : theme.palette.background.paper,
              height: '100%',
              overflowY: 'auto'
            }}>
              <List sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                '& > *:not(:last-child)': { mb: 2 }
              }}>
                {messages.map((msg, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      padding: 0
                    }}
                  >
                    <Box sx={{
                      maxWidth: '80%',
                      bgcolor: msg.role === 'user' ? 
                        '#2196f3' : 
                        isDarkMode ? 
                          '#2d2d2d' : 
                          'rgba(0, 0, 0, 0.05)',
                      color: msg.role === 'user' ? 
                        '#ffffff' : 
                        theme.palette.text.primary,
                      borderRadius: 2,
                      px: 2.5,
                      py: 1.5,
                      boxShadow: isDarkMode ? 'none' : 1,
                      border: msg.role !== 'user' && isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                        }}
                      >
                        {msg.content}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
                <div ref={messagesEndRef} />
              </List>

              <Box sx={{
                p: 2,
                borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.palette.divider}`,
                bgcolor: isDarkMode ? '#161616' : theme.palette.background.paper,
              }}>
                <Box sx={{
                  display: 'flex',
                  gap: 1
                }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={apiKey ? "Type your message..." : "Please set your OpenAI API key first"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={!apiKey || loading}
                    multiline
                    maxRows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? '#2d2d2d' : 'rgba(0, 0, 0, 0.02)',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#333333' : 'rgba(0, 0, 0, 0.04)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: isDarkMode ? '#333333' : 'rgba(0, 0, 0, 0.06)',
                        },
                        '& fieldset': {
                          borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : theme.palette.primary.main,
                        }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={!apiKey || loading}
                    sx={{
                      borderRadius: 2,
                      minWidth: '50px',
                      height: '56px',
                      boxShadow: isDarkMode ? 'none' : 2,
                      bgcolor: '#2196f3',
                      '&:hover': {
                        bgcolor: '#1976d2',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* API Key Dialog */}
        <Dialog 
          open={apiKeyDialogOpen} 
          onClose={() => setApiKeyDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: isDarkMode ? '#1e1e1e' : 'white',
              color: isDarkMode ? 'white' : 'inherit',
            }
          }}
        >
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogContent>
            <DialogContentText
              sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
            >
              Please enter your OpenAI API key to use this application. Your key will be stored locally in your browser and never sent to our servers.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="API Key"
              type="password"
              fullWidth
              variant="outlined"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                },
                '& input': {
                  color: isDarkMode ? 'white' : 'inherit',
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApiKeyDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey} color="primary" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ 
              width: '100%',
              bgcolor: isDarkMode ? '#2d2d2d' : undefined,
              color: isDarkMode ? 'white' : undefined,
              '& .MuiAlert-icon': {
                color: isDarkMode ? 'white' : undefined,
              }
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default Chat;
