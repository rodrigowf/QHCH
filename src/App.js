import React, { useEffect, useState } from 'react';
import { Box, IconButton, Button, useMediaQuery, CircularProgress } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ContentPage from './Content/Page';
import Chat from './Chat/Main';
import LogRecorder from './LogRecorder';


const DARK_MODE_STORAGE_KEY = 'qhch_dark_mode';
const CHAT_OPEN_STORAGE_KEY = 'qhch_chat_open';


const App = () => {
  const [chatOpen, setChatOpen] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const queryParams = new URLSearchParams(window.location.search);
  const page = queryParams.get('page');
  const initialApiKey = queryParams.get('key');

  useEffect(() => {
    if(page === "chat") {
      localStorage.setItem(CHAT_OPEN_STORAGE_KEY, "true");
      setChatOpen(true);
    } else if (page === "main") {
      localStorage.setItem(CHAT_OPEN_STORAGE_KEY, "false");
      setChatOpen(false);
    } else {
      const storedChatOpen = localStorage.getItem(CHAT_OPEN_STORAGE_KEY);
      if (storedChatOpen !== null) {
        setChatOpen(storedChatOpen === 'true');
      }
    }
  }, []);

  useEffect(() => {
    if(chatOpen !== null){
      localStorage.setItem(CHAT_OPEN_STORAGE_KEY, chatOpen.toString());
    }
  }, [chatOpen]);

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

  if (isMobile === null || isDarkMode === null || isMobile === undefined || isMobile === null) {
    return (
      <div style={{
        background: '#161616',
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress 
          sx={{ 
            color: '#fff',
            width: '160px !important',
            height: '160px !important',
            opacity: 0.8,
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
          }} 
        />
      </div>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {(chatOpen === false) ? (
        <ContentPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isMobile={isMobile}/>
      ) : (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: '100%',
            // height: 'calc(var(--vh, 1vh) * 100)',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Chat App Component */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Chat isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isMobile={isMobile} initialApiKey={initialApiKey}/>
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
          bgcolor: !chatOpen ? '#36fa' : isMobile ? 'transparent' : '#a146',
          padding: 1.5,
          paddingRight: !isMobile ? 3 : 1.5,
          textTransform: 'none',
          color: '#fff',
          borderRadius: '16px',
          '&:hover': { bgcolor: !chatOpen ? '#36f' : '#a143' }
        }}
        aria-label="Open Chat"
      >
        {!chatOpen ? <><ChatIcon sx={{mx: 1}}/>{!isMobile ? " Chat with QHCH" : ""}</> : <><CloseIcon sx={{mx: 1}}/>{!isMobile ? " Close Chat " : ""}</>}
      </Button>

      {/* <LogRecorder /> */}

    </Box>
  );
};

export default App; 