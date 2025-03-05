import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { ChatInputContainer, ChatInputInnerBox } from '../styled/ChatInput.styled';

// Configuration constants
const PAUSE_INTERVAL = 2000; // 2 seconds of silence to trigger segment finalization
const AUDIO_CHUNK_INTERVAL = 250; // MediaRecorder timeslice (ms)

export const ChatInput = ({
  isDarkMode,
  isMobile,
  input,
  setInput,
  loading,
  apiKey,
  handleSend,
}) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false); // Add this ref to track current recording state

  // Refs for processing
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null); // to hold the active audio stream
  const pauseTimeoutRef = useRef(null);
  const audioChunksRef = useRef([]);

  // We keep two types of text:
  // • finalizedTextRef: text that has already been processed by Whisper.
  // • pending segment: accumulated speech recognition (split in confirmed text and interim results).
  const finalizedTextRef = useRef(input || ""); // all finalized (and punctuated) text
  const segmentTextRef = useRef(""); // confirmed text for current segment
  const interimTextRef = useRef(""); // live interim recognition for current segment

  // Update ref when state changes
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Helper: clear pending buffers.
  const resetSegmentBuffers = () => {
    segmentTextRef.current = "";
    interimTextRef.current = "";
  };

  // Start SpeechRecognition (stays running continuously)
  const startSpeechRecognition = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser.");
      throw new Error("Speech Recognition not supported");
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        segmentTextRef.current += finalTranscript;
      }
      interimTextRef.current = interimTranscript;

      const pendingSegment = segmentTextRef.current + interimTextRef.current;
      setInput(finalizedTextRef.current + pendingSegment);

      // Reset pause timer
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (pendingSegment.trim().length > 0) {
        pauseTimeoutRef.current = setTimeout(() => {
          console.log("Pause timer triggered, isRecording:", isRecordingRef.current);
          if (isRecordingRef.current) {
            finalizeSegment();
          }
        }, PAUSE_INTERVAL);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      console.log("SpeechRecognition ended, isRecording:", isRecordingRef.current);
      if (isRecordingRef.current) {
        console.log("Restarting SpeechRecognition...");
        try {
          recognition.start();
        } catch (error) {
          console.error("Error restarting SpeechRecognition:", error);
        }
      }
    };

    try {
      await recognition.start();
      recognitionRef.current = recognition;
      console.log("SpeechRecognition started successfully, isRecording:", isRecordingRef.current);
    } catch (error) {
      console.error("Error starting SpeechRecognition:", error);
      throw error; // Propagate error to toggleRecording
    }
  };

  // Start MediaRecorder for capturing audio corresponding to the pending segment.
  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Save the stream for reuse in subsequent segments.
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start(AUDIO_CHUNK_INTERVAL);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Restart only the MediaRecorder (keeping SpeechRecognition running continuously)
  const restartMediaRecorder = async () => {
    try {
      console.log("Restarting MediaRecorder - Starting...");
      
      // First, properly stop and cleanup the existing recorder
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current = null;
      }

      // Always get a fresh stream - this ensures we have an active audio context
      console.log("Getting fresh audio stream...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      console.log("Creating new MediaRecorder...");
      const newRecorder = new MediaRecorder(stream);
      
      // Set up data collection
      newRecorder.ondataavailable = (e) => {
        console.log("MediaRecorder data available:", e.data.size);
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // Start recording with timeslices
      newRecorder.start(AUDIO_CHUNK_INTERVAL);
      console.log("New MediaRecorder started:", newRecorder.state);
      
      mediaRecorderRef.current = newRecorder;
    } catch (error) {
      console.error("Error restarting MediaRecorder:", error);
    }
  };

  // Finalize the current pending segment.
  // Stop only the MediaRecorder (but keep SpeechRecognition running), then process audio & text with Whisper.
  const finalizeSegment = async (finalizeForSend = false) => {
    console.log("Finalizing segment...", {
      recorderState: mediaRecorderRef.current?.state,
      audioChunks: audioChunksRef.current.length,
      pendingText: segmentTextRef.current + interimTextRef.current,
      finalizeForSend,
      isRecording: isRecordingRef.current
    });

    return new Promise(async (resolve) => {
      const pendingSegment = segmentTextRef.current + interimTextRef.current;
      
      if (!pendingSegment.trim()) {
        resetSegmentBuffers();
        if (!finalizeForSend && isRecordingRef.current) {
          await restartMediaRecorder();
        }
        resolve();
        return;
      }

      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.requestData();
          
          mediaRecorderRef.current.onstop = async () => {
            await processAudioAndText(pendingSegment, finalizeForSend);
            resolve();
          };
          
          mediaRecorderRef.current.stop();
        } else {
          await processAudioAndText(pendingSegment, finalizeForSend);
          resolve();
        }
      } catch (error) {
        console.error("Error in finalizeSegment:", error);
        resolve();
      }
    });
  };

  // Process the audio blob with matching text through the Whisper API.
  const processAudioAndText = async (pendingSegment, finalizeForSend) => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log("Processing segment:", {
        audioSize: audioBlob.size,
        chunksCount: audioChunksRef.current.length,
        pendingText: pendingSegment,
        currentFinalized: finalizedTextRef.current,
        isRecording: isRecordingRef.current,
        finalizeForSend
      });

      // Clear for next segment
      audioChunksRef.current = [];

      if (audioBlob.size > 0 && pendingSegment.trim()) {
        const correctedText = await sendSegmentToWhisper(audioBlob, pendingSegment);
        console.log("Received from Whisper:", correctedText);

        // Add a space before appending if there's already text and it doesn't end with a space
        if (finalizedTextRef.current && !finalizedTextRef.current.endsWith(' ')) {
          finalizedTextRef.current += ' ';
        }
        finalizedTextRef.current += correctedText;
        setInput(finalizedTextRef.current);
        resetSegmentBuffers();
      }

      // Only restart if we're still recording and not finalizing for send
      if (!finalizeForSend && isRecordingRef.current) {
        console.log("Restarting MediaRecorder after processing...");
        await restartMediaRecorder();
      } else {
        console.log("Not restarting MediaRecorder:", { finalizeForSend, isRecording: isRecordingRef.current });
      }
    } catch (error) {
      console.error("Error processing segment:", error);
      setInput(finalizedTextRef.current + pendingSegment);
      
      if (!finalizeForSend && isRecordingRef.current) {
        console.log("Attempting to restart MediaRecorder after error...");
        await restartMediaRecorder();
      }
    }
  };

  // Call the Whisper API directly using the user's API key.
  const sendSegmentToWhisper = async (audioBlob, text) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'segment.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append(
        'prompt',
        `Please provide the following text with proper punctuation and capitalization, maintaining the exact same words: "${text}"`
      );
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        return data.text; // Corrected text from Whisper
      } else {
        const errorData = await response.json();
        console.error("Whisper API error:", errorData);
        return text;
      }
    } catch (error) {
      console.error("Error sending segment to Whisper:", error);
      return text;
    }
  };

  // Stop recording entirely (finalizes any pending segment).
  const stopSpeechRecognition = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      // First finalize any pending segment
      await finalizeSegment(true);
    }

    // Then stop all recording components
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Finally update the recording state
    setIsRecording(false);
  };

  // When user clicks Send, finalize any pending segment and then stop.
  const handleSendClick = async () => {
    if (isRecordingRef.current) {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      await finalizeSegment(true);
      await stopSpeechRecognition();
    }
    handleSend();
  };

  // Toggle recording; on start, initialize both SpeechRecognition (once) and MediaRecorder.
  const toggleRecording = async () => {
    if (isRecordingRef.current) {
      await stopSpeechRecognition();
    } else {
      try {
        // Set recording state first
        setIsRecording(true);
        isRecordingRef.current = true;

        // Preserve any manually entered text as finalized
        finalizedTextRef.current = input;
        resetSegmentBuffers();

        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        // Start recording components
        await startMediaRecorder();
        await startSpeechRecognition();

        console.log("Recording started successfully, isRecording:", isRecordingRef.current);
      } catch (error) {
        console.error("Error starting recording:", error);
        setIsRecording(false);
        isRecordingRef.current = false;
        await stopSpeechRecognition();
      }
    }
  };

  // Cleanup on component unmount.
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChatInputContainer isDarkMode={isDarkMode} theme={theme}>
      <ChatInputInnerBox>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={
            apiKey ? "Type your message..." : "Please set your OpenAI API key first"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendClick();
            }
          }}
          disabled={!apiKey || loading}
          multiline
          maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: isDarkMode ? '#2d2d2d' : 'rgba(0, 0, 0, 0.02)',
              '&:hover': {
                backgroundColor: isDarkMode ? '#333333' : 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-focused': {
                backgroundColor: isDarkMode ? '#333333' : 'rgba(0, 0, 0, 0.06)',
              },
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : theme.palette.primary.main,
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSendClick}
          disabled={!apiKey || loading}
          sx={{
            borderRadius: 2,
            minWidth: '50px',
            height: '56px',
            boxShadow: isDarkMode ? 'none' : 2,
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: '#1976d2',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </Button>
        {!isMobile && (
          <Button
            variant="contained"
            onClick={toggleRecording}
            disabled={!apiKey || loading}
            sx={{
              borderRadius: 2,
              minWidth: '50px',
              height: '56px',
              boxShadow: isDarkMode ? 'none' : 2,
              bgcolor: isRecording ? '#d32f2f' : theme.palette.primary.main,
              '&:hover': {
                bgcolor: isRecording ? '#b71c1c' : '#1976d2',
              },
              marginRight: 1,
            }}
          >
            {isRecording ? <MicOffIcon /> : <MicIcon />}
          </Button>
        )}
      </ChatInputInnerBox>
    </ChatInputContainer>
  );
};