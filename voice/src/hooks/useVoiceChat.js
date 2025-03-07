import { useState, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtcService';

export function useVoiceChat(systemPrompt) {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const webrtcRef = useRef(null);

    const handleStatusChange = useCallback((status) => {
        setIsConnected(status);
        if (!status) {
            setIsSpeaking(false);
        }
    }, []);

    const handleSpeechChange = useCallback((speaking) => {
        setIsSpeaking(speaking);
    }, []);

    const handleMessage = useCallback((role, text) => {
        setMessages(prev => [...prev, { role, text, timestamp: Date.now() }]);
    }, []);

    const connect = useCallback(async (apiKey) => {
        try {
            setError(null);
            if (!webrtcRef.current) {
                webrtcRef.current = new WebRTCService(
                    handleStatusChange,
                    handleSpeechChange,
                    handleMessage
                );
            }
            await webrtcRef.current.connect(apiKey, systemPrompt);
        } catch (error) {
            setError(error.message);
            console.error('Failed to connect:', error);
            throw error;
        }
    }, [handleStatusChange, handleSpeechChange, handleMessage, systemPrompt]);

    const disconnect = useCallback(async () => {
        try {
            if (webrtcRef.current) {
                await webrtcRef.current.disconnect();
                webrtcRef.current = null;
            }
        } catch (error) {
            setError(error.message);
            console.error('Failed to disconnect:', error);
        }
    }, []);

    const updateSystemPrompt = useCallback(async (newPrompt) => {
        try {
            if (webrtcRef.current && isConnected) {
                await webrtcRef.current.setSystemPrompt(newPrompt);
            }
        } catch (error) {
            setError(error.message);
            console.error('Failed to update system prompt:', error);
        }
    }, [isConnected]);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        isConnected,
        isSpeaking,
        messages,
        error,
        connect,
        disconnect,
        updateSystemPrompt,
        clearMessages
    };
} 