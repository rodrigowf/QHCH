import React, { useState } from 'react';
import { Box, IconButton, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ContentPage from './Content/Page';
import Chat from './Chat/Main';
import './global.css';
import './responsive.css';
import './scroll.css';

const MergedApp = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const toggleChat = () => {
    setChatOpen(prevState => !prevState);
  };

  return (
    <Box className={isDarkMode ? 'dark-mode' : ''} sx={{ position: 'relative' }}>
      {!chatOpen ? (
        <ContentPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}/>
      ) : (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1500,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Close Chat Button */}
          <Box sx={{ alignSelf: 'flex-end', p: 1 }}>
            <IconButton onClick={toggleChat} aria-label="Close Chat" sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'grey.300' }}}>
              <CloseIcon />
            </IconButton>
          </Box>
          {/* Chat App Component */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Chat isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}/>
          </Box>

          </Box>
      )}
      {/* Floating Chat Toggle Button when chat is closed */}
      <Button
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 2000,
          bgcolor: !chatOpen ? '#57f' : '#f57',
          padding: 1.5,
          textTransform: 'none',
          color: '#fff',
          borderRadius: '16px',
          '&:hover': { bgcolor: !chatOpen ? '#35d' : '#d35' }
        }}
        aria-label="Open Chat"
      >
        {!chatOpen ? <><ChatIcon />&nbsp; Chat with QHPH</> : <><CloseIcon />&nbsp; Close Chat</>}
      </Button>
    </Box>
  );
};

export default MergedApp; 