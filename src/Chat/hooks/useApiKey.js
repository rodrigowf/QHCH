import { useState, useEffect } from 'react';
import { API_KEY_STORAGE_KEY } from '../constants/storage';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setApiKeyDialogOpen(true);
    }
  }, []);

  const handleSaveApiKey = (showSnackbar) => {
    if (tempApiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, tempApiKey);
      setApiKey(tempApiKey);
      setApiKeyDialogOpen(false);
      showSnackbar('API key saved successfully', 'success');
    } else {
      showSnackbar('Please enter a valid API key', 'error');
    }
  };

  const handleChangeApiKey = () => {
    setTempApiKey(apiKey);
    setApiKeyDialogOpen(true);
  };

  const externallySetApiKey = (key) => {
    setTempApiKey(key);
    handleSaveApiKey(console.log);
  }

  return {
    apiKey,
    setApiKey: externallySetApiKey,
    apiKeyDialogOpen,
    setApiKeyDialogOpen,
    tempApiKey,
    setTempApiKey,
    handleSaveApiKey,
    handleChangeApiKey,
  };
}; 