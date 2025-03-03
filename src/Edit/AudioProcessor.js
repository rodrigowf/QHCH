import { getChatResponse } from './ChatManager';

const API_KEY = process.env.REACT_APP_GPT4O_API_KEY;
const TRANSCRIPTION_API_URL = "https://api.openai.com/v1/audio/transcriptions";

function createWavHeader(sampleLength) {
    console.log('Creating WAV header', { sampleLength });
    try {
        const numChannels = 1;
        const sampleRate = 16000;
        const bitsPerSample = 16;
        const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
        const blockAlign = (numChannels * bitsPerSample) / 8;
        const subChunk2Size = sampleLength * numChannels * (bitsPerSample / 8);
        const chunkSize = 36 + subChunk2Size;

        const buffer = new ArrayBuffer(44);
        const view = new DataView(buffer);

        function writeString(view, offset, str) {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        }

        // RIFF Chunk Descriptor
        writeString(view, 0, "RIFF");
        view.setUint32(4, chunkSize, true);
        writeString(view, 8, "WAVE");

        // fmt sub-chunk
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);

        // data sub-chunk
        writeString(view, 36, "data");
        view.setUint32(40, subChunk2Size, true);

        console.log('WAV header created successfully');
        return new Uint8Array(buffer);
    } catch (error) {
        console.error('Error creating WAV header', error);
        throw error;
    }
}

function concatUint8Arrays(a, b) {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

async function processAudioChunk(audioBuffer) {
    console.log('\n=== PROCESSING AUDIO CHUNK ===');
    console.log(`Input buffer type: ${audioBuffer.constructor.name}`);
    console.log(`Input buffer size: ${audioBuffer.length} bytes`);
    console.log(`Audio duration: ${audioBuffer.length / 32000} seconds`);

    const tempKey = `temp_audio_${Date.now()}`;
    console.log('Creating temporary audio data with key:', tempKey);

    try {
        // Create WAV header and file
        const header = createWavHeader(audioBuffer.length / 2);
        const wavFile = concatUint8Arrays(header, audioBuffer);

        // Convert wavFile to Blob so it can be sent via FormData
        const wavBlob = new Blob([wavFile], { type: "audio/wav" });
        
        // Prepare form data for transcription
        const formData = new FormData();
        formData.append("file", wavBlob, "audio.wav");
        formData.append("model", "whisper-1");
        formData.append("language", "en");
        formData.append("response_format", "text");
        formData.append("temperature", "0.3");
        formData.append("prompt", "The audio contains spoken words. Please accurately transcribe them.");

        console.log('Sending to OpenAI for transcription...');
        const response = await fetch(TRANSCRIPTION_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`
                // Note: Do not set Content-Type for FormData; the browser will set it automatically.
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Transcription API error: ${response.status} ${errorText}`);
        }

        // Since we use "response_format": "text", this returns simple text
        const transcription = await response.text();
        console.log('Received transcription:', transcription);

        let chatResponse;
        if (transcription && transcription.trim()) {
            console.log('Transcription successful:', transcription);
            chatResponse = await getChatResponse(transcription);
        } else {
            console.log('Empty transcription received');
            chatResponse = "I couldn't understand what you said. Could you please try speaking again?";
        }

        return {
            transcription,
            response: chatResponse || "I understand your request but I'm not sure how to help. Could you please rephrase?"
        };
    } catch (error) {
        console.error('Error in processAudioChunk:', error);
        return {
            transcription: "Error processing audio",
            response: "I encountered an error while processing your speech. Could you please try again?"
        };
    } finally {
        console.log('Cleaned up temporary audio data', { key: tempKey });
    }
}

export {
    createWavHeader,
    processAudioChunk
};
