import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  ThemeProvider,
  CssBaseline,
  Toolbar,
} from '@mui/material';

import { AppHeader } from './components/AppHeader';
import { ChatDrawer } from './components/ChatDrawer';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { CustomSnackbar } from './components/CustomSnackbar';

import { useApiKey } from './hooks/useApiKey';
import { useConversations } from './hooks/useConversations';
import { useChat } from './hooks/useChat';
import { createAppTheme } from './theme/createAppTheme';

function Chat({ isDarkMode, toggleDarkMode, isMobile }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isSpoken, setIsSpoken] = useState(false);

  const theme = createAppTheme(isDarkMode);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const {
    apiKey,
    apiKeyDialogOpen,
    setApiKeyDialogOpen,
    tempApiKey,
    setTempApiKey,
    handleSaveApiKey,
    handleChangeApiKey,
  } = useApiKey();

  const {
    conversations,
    selectedConversation,
    messages,
    setMessages,
    loadConversation,
    startNewConversation,
    saveConversation,
    handleBackupConversations,
    formatTimestamp,
  } = useConversations();

  const {
    input,
    setInput,
    loading,
    selectedAgent,
    setSelectedAgent,
    getCurrentAgent,
    handleSend,
  } = useChat(apiKey, messages, setMessages, saveConversation, showSnackbar);

  React.useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isMobile]);

  const handleBackupClick = () => {
    handleBackupConversations(showSnackbar);
  };

  const handleLoadConversation = (conversationId) => {
    const agentId = loadConversation(conversationId);
    if (agentId) {
      setSelectedAgent(agentId);
      if (isMobile) setDrawerOpen(false);
    }
  };

  const handleStartNewConversation = () => {
    startNewConversation();
    if (isMobile) setDrawerOpen(false);
  };

  const handleApiKeySave = () => {
    handleSaveApiKey(showSnackbar);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDarkMode ? '#161616' : theme.palette.grey[100]
      }}>
        <AppHeader
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isMobile={isMobile}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          selectedAgent={selectedAgent}
          getCurrentAgent={getCurrentAgent}
          setSelectedAgent={setSelectedAgent}
          handleChangeApiKey={handleChangeApiKey}
          isThinking={loading}
        />

        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          bgcolor: isDarkMode ? '#161616' : 'linear-gradient(135deg, #29435d 0%, #3498db 100%)',
          position: 'fixed',
          top: isMobile ? '50px' : '65px',
          width: '100vw',
          height: 'calc(100% - 65px)',
          overflow: 'hidden',
        }}>
          <ChatDrawer
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            conversations={conversations}
            selectedConversation={selectedConversation}
            loadConversation={handleLoadConversation}
            startNewConversation={handleStartNewConversation}
            handleBackupConversations={handleBackupClick}
            formatTimestamp={formatTimestamp}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            getCurrentAgent={getCurrentAgent}
            handleChangeApiKey={handleChangeApiKey}
            toggleDarkMode={toggleDarkMode}
            theme={theme}
          />

          <Container maxWidth="md" sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            py: isMobile ? 0 : 2,
            gap: 2,
            height: '100%',
            bgcolor: isDarkMode ? '#161616' : 'transparent',
            overflow: 'hidden',
            ...(isMobile && {
              padding: 0,
              maxWidth: '100% !important',
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
              <MessageList
                messages={messages}
                isDarkMode={isDarkMode}
                isSpoken={isSpoken}
              />

              <ChatInput
                isDarkMode={isDarkMode}
                input={input}
                setInput={setInput}
                loading={loading}
                apiKey={apiKey}
                handleSend={handleSend}
                isMobile={isMobile}
                setIsSpoken={setIsSpoken}
              />
            </Paper>
          </Container>
        </Box>

        <ApiKeyDialog
          isDarkMode={isDarkMode}
          open={apiKeyDialogOpen}
          onClose={() => setApiKeyDialogOpen(false)}
          tempApiKey={tempApiKey}
          setTempApiKey={setTempApiKey}
          onSave={handleApiKeySave}
        />

        <CustomSnackbar
          isDarkMode={isDarkMode}
          open={snackbarOpen}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          severity={snackbarSeverity}
        />
      </Box>
    </ThemeProvider>
  );
}

export default Chat;
