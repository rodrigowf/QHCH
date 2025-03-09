export class WebRTCService {
    constructor(mediaStream, onStatusChange, onSpeechChange, onMessage) {
        this.peerConnection = null;
        this.dataChannel = null;
        this.audioElement = document.createElement('audio');
        this.audioElement.autoplay = true;
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
            
            // Create and configure peer connection
            this.peerConnection = new RTCPeerConnection();
            
            // Handle remote audio stream
            this.peerConnection.ontrack = (event) => {
                this.audioElement.srcObject = event.streams[0];
            };

            // Set up data channel for events
            this.dataChannel = this.peerConnection.createDataChannel('oai-events');
            
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