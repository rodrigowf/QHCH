import React, { useEffect, useState, useMemo } from 'react';
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
import { VoiceChatInput } from './components/VoiceChatInput';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { CustomSnackbar } from './components/CustomSnackbar';

import { useApiKey } from './hooks/useApiKey';
import { useConversations } from './hooks/useConversations';
import { useChat } from './hooks/useChat';
import { useVoiceChatWithStorage } from './hooks/useVoiceChatWithStorage';
import { createAppTheme } from './theme/createAppTheme';
import { agentPrompts } from './prompts';

const VOICE_MODE_STORAGE_KEY = 'qhch_voice_mode';

function Chat({ isDarkMode, toggleDarkMode, isMobile, initialApiKey }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isSpoken, setIsSpoken] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(() => {
    const stored = localStorage.getItem(VOICE_MODE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  });

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
  } = useApiKey(initialApiKey);

  const {
    conversations,
    selectedConversation,
    messages,
    setMessages,
    loadConversation,
    startNewConversation,
    saveConversation,
    handleBackupConversations,
    handleDeleteConversation,
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

  // Voice chat integration
  const systemPrompt = useMemo(
    () =>
      selectedAgent
        ? agentPrompts[selectedAgent]?.systemPrompt
        : agentPrompts['specialist'].systemPrompt,
    [selectedAgent]
  );

  const {
    mediaStream,
    isConnected,
    isSpeaking,
    error: voiceError,
    messages: voiceMessages,
    connect: connectVoice,
    disconnect: disconnectVoice,
    updateSystemPrompt,
  } = useVoiceChatWithStorage(systemPrompt, saveConversation, selectedAgent);

  // Update messages when voice messages change
  useEffect(() => {
    if (isVoiceMode && voiceMessages.length > 0) {
      setMessages(voiceMessages);
    }
  }, [isVoiceMode, voiceMessages]);

  // Handle voice mode toggle
  const toggleVoiceMode = async () => {
    if (isVoiceMode && isConnected) {
      await disconnectVoice();
    } else if (!isVoiceMode) {
      // Clear messages when switching to voice mode
      setMessages([]);
    }
    setIsVoiceMode((prev) => !prev);
    localStorage.setItem(VOICE_MODE_STORAGE_KEY, JSON.stringify(!isVoiceMode));
  };

  useEffect(() => {
    if(isVoiceMode) setAutoPlayEnabled(false);
  }, [isVoiceMode]);

  // Update system prompt when agent changes
  useEffect(() => {
    if (isConnected && systemPrompt) {
      updateSystemPrompt(systemPrompt).catch((error) => {
        console.error('Failed to update system prompt:', error);
        showSnackbar('Failed to update system prompt', 'error');
      });
    }
  }, [systemPrompt, isConnected, updateSystemPrompt]);

  // Disconnect voice chat when component unmounts
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectVoice().catch(console.error);
      }
    };
  }, [isConnected, disconnectVoice]);

  // Handle agent change
  const handleAgentChange = (newAgentId) => {
    setSelectedAgent(newAgentId);
    if (isVoiceMode && isConnected) {
      const newPrompt = agentPrompts[newAgentId].systemPrompt;
      updateSystemPrompt(newPrompt).catch((error) => {
        console.error('Failed to update system prompt:', error);
        showSnackbar('Failed to update system prompt', 'error');
      });
    }
  };

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

  const toggleAutoPlay = () => {
    setAutoPlayEnabled((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: isDarkMode ? '#161616' : theme.palette.grey[100],
        }}
      >
        <AppHeader
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isMobile={isMobile}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          selectedAgent={selectedAgent}
          getCurrentAgent={getCurrentAgent}
          setSelectedAgent={handleAgentChange}
          handleChangeApiKey={handleChangeApiKey}
          isThinking={loading}
          autoPlayEnabled={autoPlayEnabled}
          toggleAutoPlay={toggleAutoPlay}
          isVoiceMode={isVoiceMode}
          toggleVoiceMode={toggleVoiceMode}
        />

        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            bgcolor: isDarkMode ? '#161616' : 'linear-gradient(135deg, #29435d 0%, #3498db 100%)',
            position: 'fixed',
            top: isMobile ? '50px' : '65px',
            width: '100vw',
            height: 'calc(100% - 65px)',
            overflow: 'hidden',
          }}
        >
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
            handleDeleteConversation={handleDeleteConversation}
            formatTimestamp={formatTimestamp}
            selectedAgent={selectedAgent}
            setSelectedAgent={handleAgentChange}
            getCurrentAgent={getCurrentAgent}
            handleChangeApiKey={handleChangeApiKey}
            toggleDarkMode={toggleDarkMode}
            theme={theme}
          />

          <Container
            maxWidth="md"
            sx={{
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
              }),
            }}
          >
            <Paper
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: 3,
                borderRadius: isMobile ? 1 : 2,
                bgcolor: isDarkMode ? '#1e1e1e' : theme.palette.background.paper,
                height: '100%',
                overflowY: 'auto',
              }}
            >
              <MessageList
                messages={messages}
                isDarkMode={isDarkMode}
                isMobile={isMobile}
                isSpoken={isSpoken}
                autoPlayEnabled={autoPlayEnabled}
              />

              {isVoiceMode ? (
                <VoiceChatInput
                  isDarkMode={isDarkMode}
                  isMobile={isMobile}
                  isConnected={isConnected}
                  isSpeaking={isSpeaking}
                  error={voiceError}
                  loading={loading}
                  apiKey={apiKey}
                  onConnect={connectVoice}
                  onDisconnect={disconnectVoice}
                  mediaStream={mediaStream}
                />
              ) : (
                <ChatInput
                  isDarkMode={isDarkMode}
                  input={input}
                  setInput={setInput}
                  loading={loading}
                  apiKey={apiKey}
                  handleSend={handleSend}
                  isMobile={isMobile}
                  setIsSpoken={setIsSpoken}
                  setIsAdvancedVoiceMode={setIsVoiceMode}
                />
              )}
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
