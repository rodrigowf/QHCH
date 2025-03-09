import { useState, useCallback, useRef, useEffect } from 'react';
import { WebRTCService } from '../services/webrtcService';

export const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

export function useVoiceChat(systemPrompt) {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const webrtcRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    const handleStatusChange = useCallback((status) => {
        setIsConnected(status);
        if (!status) {
            setIsSpeaking(false);
        }
    }, []);

    const handleSpeechChange = useCallback((speaking) => {
        setIsSpeaking(speaking);
    }, []);

    const handleMessage = useCallback((...args) => {
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
            const { role, text, id, timestamp } = args[0];
            
            setMessages(prev => {
                const newMessage = {
                    role,
                    content: text,
                    id,
                    timestamp: timestamp || Date.now()
                };

                // Sort messages by timestamp
                return [...prev, newMessage].sort((a, b) => a.timestamp - b.timestamp);
            });
        }
        // Legacy format handler
        else if (args.length === 2) {
            const [role, text] = args;
            setMessages(prev => [...prev, {
                role,
                content: text,
                timestamp: Date.now(),
                id: `legacy-${Date.now()}`
            }].sort((a, b) => a.timestamp - b.timestamp));
        }
    }, []);

    const setupAudioAnalyser = useCallback((stream) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
        }

        const analyzeAudio = () => {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume level (0-1)
            const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
            setAudioLevel(average / 255);
            
            animationFrameRef.current = requestAnimationFrame(analyzeAudio);
        };

        analyzeAudio();
    }, []);

    const cleanupAudioAnalyser = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    const connect = useCallback(async (apiKey) => {
        try {
            setError(null);
            if (!webrtcRef.current) {
                webrtcRef.current = new WebRTCService(
                    mediaStream,
                    handleStatusChange,
                    handleSpeechChange,
                    handleMessage
                );
            }
            await webrtcRef.current.connect(apiKey, systemPrompt);
            setupAudioAnalyser(mediaStream);
        } catch (error) {
            setError(error.message);
            console.error('Failed to connect:', error);
            throw error;
        }
    }, [handleStatusChange, handleSpeechChange, handleMessage, systemPrompt, setupAudioAnalyser]);

    const disconnect = useCallback(async () => {
        try {
            if (webrtcRef.current) {
                await webrtcRef.current.disconnect();
                webrtcRef.current = null;
                cleanupAudioAnalyser();
            }
        } catch (error) {
            setError(error.message);
            console.error('Failed to disconnect:', error);
        }
    }, [cleanupAudioAnalyser]);

    useEffect(() => {
        return () => {
            cleanupAudioAnalyser();
        };
    }, [cleanupAudioAnalyser]);

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
        clearMessages,
        audioLevel
    };
} 