import React, { useRef, useEffect, useState } from 'react';
import { ListItem, IconButton } from '@mui/material';
import { StyledList, MessageBox } from '../styled/MessageList.styled';
import { useTheme } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PauseIcon from '@mui/icons-material/Pause';

export const MessageList = ({ messages, isDarkMode, autoPlayEnabled, isMobile }) => {
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef();
  const [activeSpeech, setActiveSpeech] = useState(null);

  const getChunks = (text) => {
    const parts = text.split(/(?<=[.!?])(\s+)/);
    const chunks = [];
    for (let i = 0; i < parts.length; i += 2) {
      let sentence = parts[i];
      if (i + 1 < parts.length) {
        sentence += parts[i + 1];
      }
      chunks.push(sentence);
    }
    return chunks.length > 0 ? chunks : [text];
  };

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const speakMessage = (text, messageIndex) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setActiveSpeech({ messageIndex, chunkIndex: 0 });
      const chunks = getChunks(text);

      chunks.forEach((chunk, i) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => {
          setActiveSpeech({ messageIndex, chunkIndex: i });
          setIsSpeaking(true);
          isSpeakingRef.current = true;
        };

        utterance.onend = () => {
          if (i === chunks.length - 1) {
            setActiveSpeech(null);
            setIsSpeaking(false);
            isSpeakingRef.current = false;
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error', event);
          setActiveSpeech(null);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        };

        if (!isSpeakingRef.current) return;
        window.speechSynthesis.speak(utterance);
      });
    } else {
      console.error('Speech synthesis not supported in this browser.');
    }
  };

  const pauseSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveSpeech(null);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-play new assistant messages if enabled
  useEffect(() => {
    if (autoPlayEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        speakMessage(lastMessage.content, messages.length - 1);
      }
    }
  }, [messages, autoPlayEnabled]);

  return (
    <StyledList sx={{
      flexGrow: 1,
      overflowY: 'auto',
      height: '100%',
      paddingBottom: '4px',
    }}>
      {messages.map((msg, index) => (
        <ListItem
          key={index}
          style={{
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            padding: 0
          }}
        >
          {msg.role === 'assistant' ? (
            <div style={{ display: 'flex', alignItems: 'start' }}>
              <MessageBox
                role={msg.role}
                isDarkMode={isDarkMode}
                isMobile={isMobile}
                theme={theme}
                style={{ position: 'relative' }}
              >
                {activeSpeech && activeSpeech.messageIndex === index ? (
                  getChunks(msg.content).map((chunk, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor:
                          activeSpeech.chunkIndex === i ? isDarkMode ? '#1a441a' : '#ffff99' : 'transparent',
                        transition: 'background-color 0.3s ease',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {chunk}
                    </span>
                  ))
                ) : (
                  msg.content
                )}
              </MessageBox>
              <IconButton
                onClick={() =>
                  isSpeaking ? pauseSpeech() : speakMessage(msg.content, index)
                }
                size="small"
                style={{ marginLeft: '8px' }}
              >
                {isSpeaking ? <PauseIcon /> : <VolumeUpIcon />}
              </IconButton>
            </div>
          ) : (
            <MessageBox role={msg.role} isDarkMode={isDarkMode} theme={theme} isMobile={isMobile}>
              {msg.content}
            </MessageBox>
          )}
        </ListItem>
      ))}
      <div ref={messagesEndRef} />
    </StyledList>
  );
}; 