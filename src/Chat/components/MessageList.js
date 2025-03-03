import React, { useRef, useEffect } from 'react';
import {
  List,
  ListItem,
  Box,
  Typography,
  useTheme,
} from '@mui/material';

export const MessageList = ({ messages, isDarkMode }) => {
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
            bgcolor: msg.role === 'user' ? 
              '#2196f3' : 
              isDarkMode ? 
                '#2d2d2d' : 
                'rgba(0, 0, 0, 0.05)',
            color: msg.role === 'user' ? 
              '#ffffff' : 
              theme.palette.text.primary,
            borderRadius: 2,
            px: 2.5,
            py: 1.5,
            boxShadow: isDarkMode ? 'none' : 1,
            border: msg.role !== 'user' && isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {msg.content}
            </Typography>
          </Box>
        </ListItem>
      ))}
      <div ref={messagesEndRef} />
    </List>
  );
}; 