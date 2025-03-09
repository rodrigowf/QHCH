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
    setMessages([]);  // Clear messages
    setSelectedConversation(null);  // Clear selected conversation
    
    // Clear the conversation from localStorage to prevent auto-loading
    const conversations = JSON.parse(localStorage.getItem(CONVERSATIONS_STORAGE_KEY) || '[]');
    if (conversations.length > 0) {
        localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations.filter(conv => 
            conv.id !== selectedConversation
        )));
    }
  };

  const saveConversation = (newMessages, agentId) => {
    // Don't save empty conversations
    if (!newMessages || newMessages.length === 0) {
        return;
    }

    const timestamp = new Date().toISOString();
    const userMessages = newMessages.filter(msg => msg.role === 'user');
    const preview = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';
    
    // Only update existing conversation if it exists and has messages
    if (selectedConversation) {
        setConversations(prevConversations => prevConversations.map(conv => 
            conv.id === selectedConversation ? 
                { ...conv, messages: newMessages, timestamp, preview } : 
                conv
        ));
        return;
    }

    // Only create new conversation if we have messages
    if (newMessages.length > 0) {
        const newConversation = {
            id: `conversation-${Date.now()}`,
            timestamp,
            agentId,
            preview,
            agent: availableAgents.find(a => a.id === agentId)?.name || 'Unknown Agent',
            messages: newMessages
        };

        setConversations(prevConversations => [newConversation, ...prevConversations]);
        setSelectedConversation(newConversation.id);
    }
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

  const _setMessages = (newMessages) => {
    // Ensure we're working with an array
    const messageArray = Array.isArray(newMessages) ? newMessages : [newMessages];
    
    // Only process messages that have content
    const validMessages = messageArray.filter(msg => 
        msg && msg.role && (msg.content || msg.text)
    );
    
    if (validMessages.length === 0) return;
    
    // Update messages state
    setMessages(prevMessages => {
        // Filter out any duplicates by id and content
        const uniqueMessages = validMessages.filter(newMsg => 
            !prevMessages.some(existingMsg => 
                (existingMsg.id && existingMsg.id === newMsg.id) || 
                (existingMsg.content === newMsg.content || existingMsg.content === newMsg.text)
            )
        );
        
        // Normalize message format
        const normalizedMessages = uniqueMessages.map(msg => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.role,
            content: msg.content || msg.text,
            timestamp: msg.timestamp || Date.now()
        }));
        
        return [...prevMessages, ...normalizedMessages];
    });
  };

  // NEW: Handler to delete a conversation
  const handleDeleteConversation = (conversationId) => {
    setConversations((prevConversations) =>
      prevConversations.filter((conv) => conv.id !== conversationId)
    );
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  return {
    conversations,
    selectedConversation,
    messages,
    setMessages: _setMessages,
    loadConversation,
    startNewConversation,
    saveConversation,
    handleBackupConversations,
    handleDeleteConversation,
    formatTimestamp,
  };
}; 