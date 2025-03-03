import React, { useEffect, useState } from 'react';
import { Box, IconButton, Button, useMediaQuery } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ContentPage from './Content/Page';
import Chat from './Chat/Main';

const DARK_MODE_STORAGE_KEY = 'qhch_dark_mode';


const MergedApp = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const storedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (storedDarkMode) {
      setIsDarkMode(storedDarkMode === 'true');
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
      }
    }
  }, []);
  
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, newMode.toString());
  };

  const toggleChat = () => {
    setChatOpen(prevState => !prevState);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {!chatOpen ? (
        <ContentPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isMobile={isMobile}/>
      ) : (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
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
            <Chat isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isMobile={isMobile}/>
          </Box>

          </Box>
      )}
      {/* Floating Chat Toggle Button when chat is closed */}
      <Button
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: (isMobile && chatOpen) ? 'auto' : 16,
          top: (isMobile && chatOpen) ? 5 : 'auto',
          right: 16,
          zIndex: 2,
          bgcolor: !chatOpen ? '#36fa' : '#f36a',
          padding: 1.5,
          textTransform: 'none',
          color: '#fff',
          borderRadius: '16px',
          '&:hover': { bgcolor: !chatOpen ? '#36f' : '#f36' }
        }}
        aria-label="Open Chat"
      >
        {!chatOpen ? <><ChatIcon sx={{mx: 1}}/>{!isMobile ? " Chat with QHCH" : ""}</> : <><CloseIcon sx={{mx: 1}}/>{!isMobile ? " Close Chat" : ""}</>}
      </Button>
    </Box>
  );
};

export default MergedApp; 