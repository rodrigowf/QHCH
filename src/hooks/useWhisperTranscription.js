import { useState, useEffect } from 'react';
import { initSync, SessionBuilder } from 'whisper-wasm';

export const useWhisperTranscription = () => {
  const [session, setSession] = useState(null);
  const [wasmInitialized, setWasmInitialized] = useState(false);

  useEffect(() => {
    const initWasm = async () => {
      try {
        // Fetch the WASM binary from the public folder. Ensure 'whisper.wasm' is placed there.
        const response = await fetch('/whisper.wasm');
        const wasmBinary = await response.arrayBuffer();
        // Initialize the WASM module with the binary
        initSync(wasmBinary);
        setWasmInitialized(true);
      } catch (err) {
        console.error('Error initializing WASM module', err);
      }
    };
    initWasm();
  }, []);

  useEffect(() => {
    if (wasmInitialized) {
      // Create a transcription session using SessionBuilder (configure options if necessary)
      const newSession = new SessionBuilder()
        // .setDecodeOptions({...})  // Optionally configure decoding options
        .build();
      setSession(newSession);
    }
  }, [wasmInitialized]);

  // A helper function to transcribe an audio buffer (assumed to be a Float32Array)
  const transcribeAudioChunk = async (audioBuffer) => {
    if (!session) {
      throw new Error('Transcription session is not ready yet');
    }
    // Use the 'run' method on the session to transcribe the audio buffer
    const result = await session.run(audioBuffer);
    return result;
  };

  return { transcribeAudioChunk, session };
}; 