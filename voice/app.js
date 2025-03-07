class VoiceChat {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.audioElement = document.createElement('audio');
        this.audioElement.autoplay = true;
        
        // UI elements
        this.connectBtn = document.getElementById('connectBtn');
        this.apiKeyInput = document.getElementById('apiKey');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.speechStatus = document.getElementById('speechStatus');
        this.transcript = document.getElementById('transcript');
        
        // Bind event listeners
        this.connectBtn.addEventListener('click', () => this.toggleConnection());
        
        // Initialize UI
        this.updateConnectionStatus(false);
    }

    async toggleConnection() {
        if (this.peerConnection) {
            await this.disconnect();
        } else {
            await this.connect();
        }
    }

    async connect() {
        try {
            const apiKey = this.apiKeyInput.value.trim();
            if (!apiKey) {
                alert('Please enter your OpenAI API key');
                return;
            }

            // Create and configure peer connection
            this.peerConnection = new RTCPeerConnection();
            
            // Handle remote audio stream
            this.peerConnection.ontrack = (event) => {
                this.audioElement.srcObject = event.streams[0];
            };

            // Set up data channel for events
            this.dataChannel = this.peerConnection.createDataChannel('oai-events');
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

            this.updateConnectionStatus(true);
            this.connectBtn.textContent = 'Disconnect';
            this.apiKeyInput.disabled = true;

        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect: ' + error.message);
            await this.disconnect();
        }
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
        this.updateConnectionStatus(false);
        this.connectBtn.textContent = 'Connect';
        this.apiKeyInput.disabled = false;
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
        };

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
                this.updateSpeechStatus(true);
                break;
            
            case 'input_audio_buffer.speech_stopped':
                this.updateSpeechStatus(false);
                break;
            
            case 'response.text.delta':
                this.appendMessage('ai', event.delta);
                break;
            
            case 'response.audio_transcript.delta':
                this.appendMessage('user', event.delta);
                break;
            
            default:
                console.log('Received event:', event);
        }
    }

    updateConnectionStatus(connected) {
        this.connectionStatus.textContent = connected ? 'Connected' : 'Not Connected';
        this.connectionStatus.classList.toggle('connected', connected);
    }

    updateSpeechStatus(speaking) {
        this.speechStatus.textContent = speaking ? 'Speaking' : 'Not Speaking';
        this.speechStatus.classList.toggle('speaking', speaking);
    }

    appendMessage(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        messageDiv.textContent = text;
        this.transcript.appendChild(messageDiv);
        this.transcript.scrollTop = this.transcript.scrollHeight;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceChat();
}); 