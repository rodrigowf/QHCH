import React, { useRef, useEffect } from 'react';
import { ListItem } from '@mui/material';
import { StyledList, MessageBox } from '../styled/MessageList.styled';
import { useTheme } from '@mui/material';

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
    <StyledList>
      {messages.map((msg, index) => (
        <ListItem
          key={index}
          style={{
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            padding: 0
          }}
        >
          <MessageBox role={msg.role} isDarkMode={isDarkMode} theme={theme}>
            {msg.content}
          </MessageBox>
        </ListItem>
      ))}
      <div ref={messagesEndRef} />
    </StyledList>
  );
}; 