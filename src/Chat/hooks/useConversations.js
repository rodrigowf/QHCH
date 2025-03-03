import { useState, useEffect } from 'react';
import { CONVERSATIONS_STORAGE_KEY } from '../constants/storage';
import { availableAgents } from '../prompts';

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const storedConversations = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (storedConversations) {
      try {
        setConversations(JSON.parse(storedConversations));
      } catch (error) {
        console.error('Error parsing stored conversations:', error);
        setConversations([]);
      }
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      setSelectedConversation(conversationId);
      return conversation.agentId;
    }
    return null;
  };

  const startNewConversation = () => {
    setMessages([]);
    setSelectedConversation(null);
  };

  const saveConversation = (newMessages, agentId) => {
    const timestamp = new Date().toISOString();
    const userMessages = newMessages.filter(msg => msg.role === 'user');
    const preview = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';
    
    if (selectedConversation) {
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation ? 
          { ...conv, messages: newMessages, timestamp, preview } : 
          conv
      ));
      return;
    }

    const newConversation = {
      id: `conversation-${Date.now()}`,
      timestamp,
      agentId,
      preview,
      agent: availableAgents.find(a => a.id === agentId)?.name || 'Unknown Agent',
      messages: newMessages
    };

    setConversations([newConversation, ...conversations]);
    setSelectedConversation(newConversation.id);
  };

  const handleBackupConversations = (showSnackbar) => {
    try {
      const dataStr = JSON.stringify(conversations, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `qhch-conversations-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showSnackbar('Conversations backed up successfully', 'success');
    } catch (error) {
      console.error('Error backing up conversations:', error);
      showSnackbar('Failed to backup conversations', 'error');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return {
    conversations,
    selectedConversation,
    messages,
    setMessages,
    loadConversation,
    startNewConversation,
    saveConversation,
    handleBackupConversations,
    formatTimestamp,
  };
}; 