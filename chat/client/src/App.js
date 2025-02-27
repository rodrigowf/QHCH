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
  useMediaQuery
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';

const drawerWidth = 300;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch available agents when component mounts
  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        if (data.length > 0) {
          setSelectedAgent(data[0].id);
        }
      })
      .catch(error => console.error('Error fetching agents:', error));

    // Fetch conversations
    fetchConversations();
  }, []);

  const fetchConversations = () => {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        setConversations(data);
      })
      .catch(error => console.error('Error fetching conversations:', error));
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) throw new Error('Failed to load conversation');
      
      const data = await response.json();
      setMessages(data.messages);
      setSelectedAgent(data.agentId);
      setSelectedConversation(conversationId);
      if (isMobile) setDrawerOpen(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
      alert('Failed to load conversation');
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setSelectedConversation(null);
    if (isMobile) setDrawerOpen(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent) return;
    
    const newMessage = { role: 'user', content: input };
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          messages: messages,  // Backend will add system prompt
          agentId: selectedAgent
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Only add user message and assistant reply to the UI
      setMessages([
        ...messages,
        newMessage,
        { role: 'assistant', content: data.reply }
      ]);

      // Refresh conversations list after sending a message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
    setLoading(false);
  };

  const getCurrentAgent = () => {
    return agents.find(agent => agent.id === selectedAgent);
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
              QQSH Chat
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
                {agents.map(agent => (
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
            <ListItem>
              <ListItemButton onClick={startNewConversation}>
                <AddIcon sx={{ mr: 1 }} />
                <ListItemText primary="New Conversation" />
              </ListItemButton>
            </ListItem>
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
                  placeholder={selectedAgent ? "Type your message..." : "Please select an agent first"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={!selectedAgent || loading}
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
                  disabled={!selectedAgent || loading}
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
    </Box>
  );
}

export default App;
