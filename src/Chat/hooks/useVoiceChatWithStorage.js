import { useCallback, useEffect } from 'react';
import { useVoiceChat, mediaStream } from './useVoiceChat';

const truncateInstructions = (obj) => {
  if (obj?.session?.instructions) {
    const instructions = obj.session.instructions;
    return { ...obj, session: {...obj.session, instructions: instructions.substring(0, 50) + '...' } }
  }
  return obj;
};

const originalConsoleLog = console.log;

console.log = (...args) => {
  const processedArgs = args.map(arg => 
    typeof arg === 'object' ? truncateInstructions(arg) : arg
  );
  originalConsoleLog(...processedArgs);
};


export function useVoiceChatWithStorage(systemPrompt, saveConversation, selectedAgent) {
  const {
    isConnected,
    isSpeaking,
    messages,
    error,
    connect,
    disconnect,
    updateSystemPrompt,
    clearMessages
  } = useVoiceChat(systemPrompt);

  // Save messages to storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveConversation(messages, selectedAgent);
    }
  }, [messages, saveConversation, selectedAgent]);

  // Override connect to ensure we have the latest system prompt
  const handleConnect = useCallback(async (apiKey) => {
    try {
      // Ensure any existing connection is cleaned up
      if (isConnected) {
        await disconnect();
      }
      await connect(apiKey);
    } catch (error) {
      throw error;
    }
  }, [connect, disconnect, isConnected]);

  // Update system prompt when agent changes
  useEffect(() => {
    if (isConnected && systemPrompt) {
      console.log("Updating System Prompt for agent change");
      updateSystemPrompt(systemPrompt).catch(error => {
        console.error('Failed to update system prompt:', error);
      });
    }
  }, [isConnected, systemPrompt, updateSystemPrompt]);

  return {
    mediaStream,
    isConnected,
    isSpeaking,
    messages,
    error,
    connect: handleConnect,
    disconnect,
    updateSystemPrompt,
    clearMessages
  };
} 