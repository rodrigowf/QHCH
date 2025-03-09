import React from 'react';
import {
  Box,
  IconButton,
  CircularProgress,
  keyframes,
  styled,
  useTheme,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { ChatInputContainer } from '../styled/ChatInput.styled';

// Keyframes for a glowing pulse around the button.
const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 5px 0 rgba(244, 67, 54, 0.3);
  }
  50% {
    box-shadow: 0 0 15px 5px rgba(244, 67, 54, 0.5);
  }
  100% {
    box-shadow: 0 0 5px 0 rgba(244, 67, 54, 0.3);
  }
`;

// Wrapper to center the button across the available width.
const CenterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(2),
}));

// Container for the button and its animated rings.
const VoiceButtonContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

// A ring whose scale dynamically reflects the real-time audio input level.
const InputLevelRing = styled('div')(({ theme, isDarkMode, audioLevel }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  border: `2px solid ${isDarkMode ? theme.palette.primary.light : theme.palette.primary.main}`,
  transform: `scale(${1 + audioLevel * 0.5})`,
  opacity: 0.7,
  transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
}));

// A pulsing glow effect that adds a modern, dynamic look.
const GlowRing = styled('div')(({ theme, isDarkMode }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  animation: `${pulseGlow} 2s infinite`,
}));

// The voice button with a modern gradient and smooth hover scale.
const VoiceButton = styled(IconButton)(({ theme, isConnected, isDarkMode }) => ({
  width: '72px',
  height: '72px',
  transition: 'all 0.3s ease',
  background: isConnected 
    ? `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
    : `linear-gradient(45deg, ${isDarkMode ? theme.palette.primary.main : theme.palette.primary.main}, ${isDarkMode ? theme.palette.primary.dark : theme.palette.primary.dark})`,
  color: '#fff',
  '&:hover': {
    background: isConnected 
      ? `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`
      : `linear-gradient(45deg, ${isDarkMode ? theme.palette.primary.dark : theme.palette.primary.dark}, ${isDarkMode ? theme.palette.primary.main : theme.palette.primary.main})`,
    transform: 'scale(1.05)',
  },
  '&:disabled': {
    backgroundColor: isDarkMode ? '#404040' : '#e0e0e0',
  },
  boxShadow: isDarkMode 
    ? '0 4px 12px rgba(118, 182, 253, 0.3)' 
    : '0 4px 12px rgba(76, 103, 151, 0.3)',
}));

export const VoiceChatInput = ({
  isDarkMode,
  isConnected,
  isSpeaking,
  loading,
  apiKey,
  onConnect,
  onDisconnect,
  audioLevel = 0,
}) => {
  const theme = useTheme();

  const handleToggleConnection = async () => {
    if (isConnected) {
      await onDisconnect();
    } else {
      try {
        await onConnect(apiKey);
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    }
  };

  return (
    <ChatInputContainer isDarkMode={isDarkMode} theme={theme}>
      <CenterContainer>
        <VoiceButtonContainer>
          {isConnected && isSpeaking && (
            <>
              <InputLevelRing isDarkMode={isDarkMode} audioLevel={audioLevel} />
              <GlowRing isDarkMode={isDarkMode} />
            </>
          )}
          <VoiceButton
            isConnected={isConnected}
            isDarkMode={isDarkMode}
            onClick={handleToggleConnection}
            disabled={!apiKey || loading}
          >
            {loading ? (
              <CircularProgress size={28} color="inherit" />
            ) : isConnected ? (
              <MicOffIcon fontSize="large" />
            ) : (
              <MicIcon fontSize="large" />
            )}
          </VoiceButton>
        </VoiceButtonContainer>
      </CenterContainer>
    </ChatInputContainer>
  );
}; 