import { useState } from 'react';
import { agentPrompts } from '../prompts';

export const useChat = (apiKey, messages, setMessages, saveConversation, showSnackbar) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('specialist');

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || !apiKey) {
      if (!apiKey) {
        showSnackbar('Please set your API key first', 'error');
        return;
      }
      return;
    }
    
    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = agentPrompts[selectedAgent]?.systemPrompt;
      
      let chatMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        newMessage
      ];
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "o1",
          messages: chatMessages,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send message');
      }
      
      const data = await response.json();
      
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenAI');
      }
      
      const assistantReply = data.choices[0].message.content;
      const finalMessages = [...updatedMessages, { role: 'assistant', content: assistantReply }];
      
      setMessages(finalMessages);
      saveConversation(finalMessages, selectedAgent);
      
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
      
      if (error.message.includes('authentication') || error.message.includes('API key')) {
        showSnackbar('Invalid API key. Please check your API key settings.', 'error');
      }
    }
    
    setLoading(false);
  };

  return {
    input,
    setInput,
    loading,
    selectedAgent,
    setSelectedAgent,
    handleSend,
  };
}; 