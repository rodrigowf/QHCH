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

  // Add error handling for voice mode
  const handleVoiceModeToggle = async () => {
    try {
      if (isVoiceMode && isConnected) {
        await disconnectVoice();
      } else {
        // Request permissions early on mobile
        if (isMobile) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (error) {
            showSnackbar('Please grant microphone permissions to use voice mode', 'error');
            return;
          }
        }
      }
      setIsVoiceMode((prev) => !prev);
      localStorage.setItem(VOICE_MODE_STORAGE_KEY, JSON.stringify(!isVoiceMode));
    } catch (error) {
      console.error('Error toggling voice mode:', error);
      showSnackbar('Failed to toggle voice mode: ' + error.message, 'error');
    }
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
          toggleVoiceMode={handleVoiceModeToggle}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
            pt: `${isMobile ? '50px' : '65px'}`,
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              height: '100%',
              py: isMobile ? 0 : 2,
              px: isMobile ? 1 : 3,
            }}
          >
            <Paper
              elevation={isDarkMode ? 0 : 2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: isDarkMode ? 'background.paper' : '#fff',
                borderRadius: isMobile ? 1 : 2,
                overflow: 'hidden',
                position: 'relative',
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
                  setIsVoiceMode={handleVoiceModeToggle}
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
