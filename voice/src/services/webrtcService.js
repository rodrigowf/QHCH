export class WebRTCService {
    constructor(onStatusChange, onSpeechChange, onMessage) {
        this.peerConnection = null;
        this.dataChannel = null;
        this.audioElement = document.createElement('audio');
        this.audioElement.autoplay = true;
        
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
    }

    async connect(apiKey, systemPrompt) {
        try {
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

            // Add local audio track
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, mediaStream);
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

            // Wait for data channel to be ready before setting system prompt
            await dataChannelReady;

            // Set system prompt after connection and data channel are established
            if (systemPrompt) {
                await this.setSystemPrompt(systemPrompt);
            }

            this.onStatusChange(true);
            return true;

        } catch (error) {
            console.error('Connection error:', error);
            await this.disconnect();
            throw error;
        }
    }

    async setSystemPrompt(systemPrompt) {
        if (!this.dataChannel) return;

        const sessionUpdate = {
            type: 'session.update',
            session: {
                instructions: systemPrompt
            }
        };

        this.dataChannel.send(JSON.stringify(sessionUpdate));
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
        this.onStatusChange(false);
    }

    setupDataChannel() {
        this.dataChannel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerEvent(data);
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
        };
    }

    handleServerEvent(event) {
        switch (event.type) {
            case 'input_audio_buffer.speech_started':
                this.onSpeechChange(true);
                break;
            
            case 'input_audio_buffer.speech_stopped':
                this.onSpeechChange(false);
                break;
            
            case 'response.created':
                // Initialize new response
                this.currentResponse = {
                    text: '',
                    role: 'ai',
                    responseId: event.response.id
                };
                break;

            case 'response.text.delta':
                // Accumulate text deltas
                if (this.currentResponse.role === 'ai') {
                    this.currentResponse.text += event.delta;
                }
                break;
            
            case 'response.audio_transcript.delta':
                // Accumulate transcript deltas
                if (this.currentResponse.role !== 'user') {
                    this.currentResponse = {
                        text: event.delta,
                        role: 'user',
                        responseId: null
                    };
                } else {
                    this.currentResponse.text += event.delta;
                }
                break;

            case 'response.text.done':
            case 'response.audio_transcript.done':
                // Send accumulated message when complete
                if (this.currentResponse.text.trim()) {
                    this.onMessage(this.currentResponse.role, this.currentResponse.text.trim());
                    this.currentResponse.text = '';
                }
                break;
            
            default:
                console.log('Received event:', event);
        }
    }
} 