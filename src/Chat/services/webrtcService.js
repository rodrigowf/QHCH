export class WebRTCService {
    constructor(mediaStream, onStatusChange, onSpeechChange, onMessage) {
        this.peerConnection = null;
        this.dataChannel = null;
        this.audioElement = document.createElement('audio');
        this.audioElement.autoplay = true;
        // Enable playback on mobile
        this.audioElement.playsInline = true;
        this.audioElement.muted = false;
        this.mediaStream = mediaStream;
        
        // Callbacks
        this.onStatusChange = onStatusChange;
        this.onSpeechChange = onSpeechChange;
        this.onMessage = onMessage;

        // State management
        this.currentResponse = {
            text: '',
            role: null,
            responseId: null
        };

        // Add connection state tracking
        this.isConnecting = false;

        // Add system prompt tracking
        this.currentSystemPrompt = null;
    }

    async connect(apiKey, systemPrompt) {
        // Prevent multiple simultaneous connection attempts
        if (this.isConnecting) {
            console.log('Connection already in progress');
            return false;
        }

        try {
            this.isConnecting = true;
            
            // Ensure cleanup of any existing connection
            await this.disconnect();

            // Mobile-friendly audio constraints with fallback options
            const audioConstraints = {
                audio: {
                    echoCancellation: { ideal: true },
                    noiseSuppression: { ideal: true },
                    autoGainControl: { ideal: true },
                    // Start with lower quality for mobile
                    sampleRate: { ideal: 44100, min: 22050 },
                    channelCount: { ideal: 1 },
                    // Add mobile-specific constraints
                    googEchoCancellation: { ideal: true },
                    googAutoGainControl: { ideal: true },
                    googNoiseSuppression: { ideal: true },
                    googHighpassFilter: { ideal: true }
                }
            };

            // Verify and request permissions if needed
            if (!this.mediaStream || !this.mediaStream.active) {
                try {
                    this.mediaStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
                } catch (mediaError) {
                    if (mediaError.name === 'NotAllowedError') {
                        throw new Error('Microphone access denied. Please grant microphone permissions in your browser settings.');
                    } else if (mediaError.name === 'NotFoundError') {
                        throw new Error('No microphone found. Please ensure your device has a working microphone.');
                    } else if (mediaError.name === 'NotReadableError') {
                        throw new Error('Cannot access microphone. It may be in use by another application.');
                    }
                    throw mediaError;
                }
            }
            
            // Create and configure peer connection with mobile-optimized settings
            const configuration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ],
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require',
                iceCandidatePoolSize: 1
            };
            
            this.peerConnection = new RTCPeerConnection(configuration);
            
            // Enhanced error handling for connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                console.log('Connection state:', this.peerConnection.connectionState);
                switch (this.peerConnection.connectionState) {
                    case 'connected':
                        console.log('WebRTC connection established');
                        break;
                    case 'disconnected':
                    case 'failed':
                        console.error('WebRTC connection failed or disconnected');
                        this.disconnect();
                        this.onStatusChange(false);
                        break;
                    case 'closed':
                        console.log('WebRTC connection closed');
                        this.onStatusChange(false);
                        break;
                }
            };

            // Handle remote audio stream with enhanced mobile support
            this.peerConnection.ontrack = (event) => {
                if (this.audioElement.srcObject !== event.streams[0]) {
                    this.audioElement.srcObject = event.streams[0];
                    
                    // Ensure audio playback works on mobile
                    const playPromise = this.audioElement.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn('Audio playback failed:', error);
                            // Try to recover from common mobile audio issues
                            this.audioElement.muted = false;
                            this.audioElement.play().catch(console.error);
                        });
                    }
                }
            };

            // Set up data channel for events with mobile-optimized settings
            this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
                ordered: true,
                maxRetransmits: 3
            });
            
            // Create a promise that resolves when the data channel opens
            const dataChannelReady = new Promise((resolve) => {
                this.dataChannel.onopen = () => {
                    console.log('Data channel opened');
                    resolve();
                };
            });
            
            this.setupDataChannel();

            // Add local audio track for microphone input in the browser
            this.mediaStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.mediaStream);
            });

            // Create and set local description
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // Send offer to OpenAI's Realtime API
            const response = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/sdp'
                },
                body: offer.sdp
            });

            if (!response.ok) {
                throw new Error('Failed to connect to OpenAI');
            }

            // Set remote description from OpenAI's answer
            const answer = {
                type: 'answer',
                sdp: await response.text()
            };
            await this.peerConnection.setRemoteDescription(answer);

            // Wait for data channel to be ready before setting system prompt and transcription config
            await dataChannelReady;
            
            console.log("System Prompt:", systemPrompt);

            // Set system prompt after connection is ready
            if (systemPrompt) {
                await this.setSystemPrompt(systemPrompt);
            }

            // Send session update to enable input audio transcription
            const sessionUpdate = {
                type: 'session.update',
                session: {
                    input_audio_transcription: {
                        model: 'whisper-1'
                    },
                    instructions: systemPrompt
                }
            };
            this.dataChannel.send(JSON.stringify(sessionUpdate));
            console.log("Sent session update:", sessionUpdate);

            this.onStatusChange(true);

            // Add mobile-specific error handling for audio element
            this.audioElement.onerror = (error) => {
                console.error('Audio element error:', error);
                this.onStatusChange(false);
            };

            return true;

        } catch (error) {
            console.error('Connection error:', error);
            await this.disconnect();
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    async setSystemPrompt(systemPrompt) {
        if (!this.dataChannel) return;
        
        // Don't update if the prompt hasn't changed
        if (this.currentSystemPrompt === systemPrompt) {
            console.log('System prompt unchanged, skipping update');
            return;
        }

        const sessionUpdate = {
            type: 'session.update',
            session: {
                instructions: systemPrompt
            }
        };

        this.dataChannel.send(JSON.stringify(sessionUpdate));
        this.currentSystemPrompt = systemPrompt;
    }

    async disconnect() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        
        this.audioElement.srcObject = null;
        this.currentResponse = {
            text: '',
            role: null,
            responseId: null
        };
        this.currentSystemPrompt = null;  // Reset system prompt on disconnect
        this.currentUserTranscript = "";  // Reset any stored user transcript
        this.isConnecting = false;
        this.onStatusChange(false);
    }

    setupDataChannel() {
        this.dataChannel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received WebRTC event:', data);
            this.handleEvent(data);
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
        };
    }

    handleEvent(event) {
        console.log('Processing event:', event.type, event);

        switch (event.type) {
            case 'conversation.item.created':
                // Handle new conversation items (user messages)
                const newItem = event.item;
                if (newItem.role === 'user' && newItem.content && newItem.content[0]) {
                    const transcript = newItem.content[0].transcript || "";
                    this.onMessage?.({
                        id: `user-${newItem.id}`,
                        text: transcript,
                        role: 'user',
                        timestamp: Date.now()
                    });
                }
                break;

            case 'response.created':
                // Reset current response state for new response
                this.currentResponse = {
                    text: '',
                    role: 'assistant',
                    responseId: event.response.id,
                    timestamp: Date.now() + 100
                };
                break;

            case 'response.audio_transcript.delta':
                const delta = event.delta;
                if (this.currentResponse.responseId === event.response_id) {
                    this.currentResponse.text += delta;
                }
                break;

            case 'response.audio_transcript.done':
                if (this.currentResponse.text.trim()) {
                    this.onMessage?.({
                        id: this.currentResponse.responseId,
                        text: this.currentResponse.text.trim(),
                        role: 'assistant',
                        timestamp: this.currentResponse.timestamp
                    });
                }
                // Reset for next response
                this.currentResponse = { 
                    text: '', 
                    role: null, 
                    responseId: null,
                    timestamp: null
                };
                break;

            case 'input_audio_buffer.speech_started':
                this.onSpeechChange(true);
                break;
            
            case 'input_audio_buffer.speech_stopped':
                this.onSpeechChange(false);
                break;
            
            case 'session.created':
            case 'session.updated':
            case 'conversation.item.input_audio_transcription.completed':
                const transcript = event.transcript;
                if (transcript) {
                    this.onMessage?.({
                        id: `user-${event.item_id}`,
                        text: transcript.trim(),
                        role: 'user',
                        timestamp: Date.now()
                    });
                }
                break;

            default:
                console.log('Unhandled event type:', event.type, event);
        }
    }

    handleTranscriptDelta(delta, responseId, itemId) {
        // Optional: Handle real-time transcript updates if needed
        console.log('Transcript delta:', delta);
    }

    handleNewResponse(response) {
        console.log('New response created:', response);
        // Initialize new response for the assistant
        this.currentResponse = {
            text: '',
            role: 'assistant',
            responseId: response.id
        };
    }

    setOnMessageCallback(cb) {
        this.onMessage = cb;
    }
} 