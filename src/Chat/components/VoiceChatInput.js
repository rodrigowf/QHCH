import React from 'react';
import {
  Box,
  IconButton,
  CircularProgress,
  keyframes,
  styled,
  useTheme,
  Snackbar,
  Alert,
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
  isMobile,
  error
}) => {
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = React.useState('');
  const [permissionState, setPermissionState] = React.useState('prompt');

  // Check initial permission state
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setPermissionState(result.state);
        
        // Listen for permission changes
        result.onchange = () => {
          setPermissionState(result.state);
        };
      } catch (error) {
        console.warn('Permission query not supported:', error);
      }
    };
    
    checkPermission();
  }, []);

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we just want the permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      if (error.name === 'NotAllowedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setErrorMessage('No microphone found. Please ensure your device has a working microphone.');
      } else {
        setErrorMessage('Failed to access microphone: ' + error.message);
      }
      return false;
    }
  };

  const handleToggleConnection = async () => {
    if (isConnected) {
      await onDisconnect();
    } else {
      try {
        // First ensure we have microphone permission
        if (permissionState !== 'granted') {
          const granted = await requestMicrophoneAccess();
          if (!granted) return;
        }
        
        // Then proceed with connection
        await onConnect(apiKey);
      } catch (error) {
        console.error('Connection error:', error);
        setErrorMessage(error.message || 'Failed to connect. Please try again.');
      }
    }
  };

  // Show different button states based on permission
  const getButtonContent = () => {
    if (loading) {
      return <CircularProgress size={28} color="inherit" />;
    }
    
    if (isConnected) {
      return <MicOffIcon fontSize={isMobile ? "medium" : "large"} />;
    }
    
    if (permissionState === 'denied') {
      return <MicOffIcon fontSize={isMobile ? "medium" : "large"} style={{ color: theme.palette.error.main }} />;
    }
    
    return <MicIcon fontSize={isMobile ? "medium" : "large"} />;
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
            disabled={!apiKey || loading || permissionState === 'denied'}
            sx={{
              width: isMobile ? '64px' : '72px',
              height: isMobile ? '64px' : '72px',
              ...(isMobile && {
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }),
              ...(permissionState === 'denied' && {
                bgcolor: theme.palette.error.main + '!important',
                opacity: 0.7,
              }),
            }}
          >
            {getButtonContent()}
          </VoiceButton>
        </VoiceButtonContainer>
      </CenterContainer>
      
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={6000} 
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorMessage('')} 
          severity="error" 
          sx={{ 
            width: '100%',
            ...(isMobile && {
              fontSize: '0.875rem',
              padding: '6px 12px',
            }),
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </ChatInputContainer>
  );
};