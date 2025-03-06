import { useState, useEffect } from 'react';
import { API_KEY_STORAGE_KEY } from '../constants/storage';

const partial = "sk-proj-9HVaN0HgUpQQVKEO3lyx0Fyo58Lq98ahHMZtjAzIH6SBlXSlcLsrwXUfccfrnocF-"

export const useApiKey = (initialKey = null) => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    if (initialKey) { // Allow me to share my own api key with friends without fully exposing it
      setTempApiKey(partial + initialKey);
      handleSaveApiKey(console.log);
    } else {
      const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedApiKey) {
        setApiKey(storedApiKey);
      } else {
        setApiKeyDialogOpen(true);
      }
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

  return {
    apiKey,
    apiKeyDialogOpen,
    setApiKeyDialogOpen,
    tempApiKey,
    setTempApiKey,
    handleSaveApiKey,
    handleChangeApiKey,
  };
}; 