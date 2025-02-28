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
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import KeyIcon from '@mui/icons-material/Key';
import { agentPrompts, availableAgents } from './prompts';

// Local storage keys
const API_KEY_STORAGE_KEY = 'openai_api_key';
const CONVERSATIONS_STORAGE_KEY = 'qhph_conversations';

const drawerWidth = 300;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('specialist');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load API key and conversations from local storage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Show API key dialog if no API key is found
      if (window.onChatToggle) {
        window.onChatToggle = (isOpen) => setApiKeyDialogOpen(isOpen);   
      } else {
        setApiKeyDialogOpen(true);
      }
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

  useEffect(() => {
    if (apiKey) {
      window.onChatToggle = () => {};
    }
  }, [apiKey])

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
      
      // Save conversation to local storage
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

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.grey[100]
    }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: theme.palette.primary.main,
          boxShadow: 3,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ 
              minWidth: 200, 
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 1,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }
              },
              '& .MuiInputLabel-root': {
                color: 'white',
                '&.Mui-focused': {
                  color: 'white'
                }
              },
              '& .MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
                '&:not(.Mui-focused)': {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }}>
              <InputLabel sx={{ 
                '&.MuiInputLabel-shrink': {
                  background: theme.palette.primary.main,
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
                      maxHeight: 300
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
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Add spacing for the fixed AppBar */}

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
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
              bgcolor: 'white',
              top: { xs: 0, sm: 64 }, // 64px is the default AppBar height
              height: { xs: '100%', sm: 'calc(100% - 64px)' }, // Subtract AppBar height on desktop
              '& > .MuiToolbar-root': { // Hide the toolbar spacer on desktop
                display: { sm: 'none' }
              }
            },
          }}
        >
          {isMobile && <Toolbar />} {/* Only show toolbar spacer on mobile */}
          <Box sx={{ 
            overflow: 'auto',
            height: '100%', // Make sure the Box takes full height
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              px: 2,
              py: 1
            }}>
              <ListItemButton onClick={startNewConversation}>
                <AddIcon sx={{ mr: 1 }} />
                <ListItemText primary="New Conversation" />
              </ListItemButton>
              <Tooltip title="Backup Conversations">
                <IconButton onClick={handleBackupConversations}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {conversations.map((conv) => (
                <ListItem key={conv.id} disablePadding>
                  <ListItemButton 
                    selected={selectedConversation === conv.id}
                    onClick={() => loadConversation(conv.id)}
                    sx={{ 
                      display: 'block',
                      py: 1,
                      px: 2,
                      '&.Mui-selected': {
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {conv.agent}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {conv.preview}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {formatTimestamp(conv.timestamp)}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Container maxWidth="md" sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          py: 3,
          gap: 2
        }}>
          <Paper sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 3,
            borderRadius: 2,
            bgcolor: 'white'
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
                    bgcolor: msg.role === 'user' ? theme.palette.primary.main : theme.palette.grey[200],
                    color: msg.role === 'user' ? 'white' : 'black',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: 1
                  }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>

            <Box sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'white'
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
                      borderRadius: 2
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
                    boxShadow: 2
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
      <Dialog open={apiKeyDialogOpen} onClose={() => setApiKeyDialogOpen(false)}>
        <DialogTitle>OpenAI API Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
