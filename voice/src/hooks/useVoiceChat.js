import { useState, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtcService';

export function useVoiceChat() {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const webrtcRef = useRef(null);

    const handleStatusChange = useCallback((status) => {
        setIsConnected(status);
    }, []);

    const handleSpeechChange = useCallback((speaking) => {
        setIsSpeaking(speaking);
    }, []);

    const handleMessage = useCallback((role, text) => {
        setMessages(prev => [...prev, { role, text }]);
    }, []);

    const connect = useCallback(async (apiKey) => {
        try {
            if (!webrtcRef.current) {
                webrtcRef.current = new WebRTCService(
                    handleStatusChange,
                    handleSpeechChange,
                    handleMessage
                );
            }
            await webrtcRef.current.connect(apiKey);
        } catch (error) {
            console.error('Failed to connect:', error);
            throw error;
        }
    }, [handleStatusChange, handleSpeechChange, handleMessage]);

    const disconnect = useCallback(async () => {
        if (webrtcRef.current) {
            await webrtcRef.current.disconnect();
            webrtcRef.current = null;
        }
    }, []);

    return {
        isConnected,
        isSpeaking,
        messages,
        connect,
        disconnect
    };
} 