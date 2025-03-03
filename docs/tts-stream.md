whisper is a speech-to-text model.

tts-1 and tts-1-hd are the models that are used to synthesize speech using text.

There’s a difference between how audio is streamed compared to text streaming. The text generation models use Server Sent Events (SSE) for streaming while the speech synthesis models use Chunk Transfer Encoding which means that audio can be played as the chunks arrive.

On TTS models, the first chunks of playable audio arrive around 3-4 seconds.

From my experience, TTS models do some sort of context aware speech synthesis where the sysnthesized audio varies very differently in speech intonation and emotion if the context changes. Hence sending the text in smaller chunks, will mean losing out on the context based intonation.

It will also eat away at your RPM rate-limits.

Here’s how I stream TTS audio:

python```
from openai import OpenAI
import io
import pyaudio
import wave

client = OpenAI()

# Define a suitable buffer size for audio chunks (e.g., 4096 bytes)
BUFFER_SIZE = 100  # This is just an example size

def byte_stream_generator(response):
    """
    Generator function that yields a stream of bytes from the response.

    :param response: The response object from the OpenAI API call.
    """
    try:
        for byte_chunk in response.iter_bytes(chunk_size=BUFFER_SIZE):
            if byte_chunk:  # Only yield non-empty byte chunks
                yield byte_chunk
            else:
                print("Skipped an empty or corrupted packet")
    except Exception as e:
        print(f"Error while streaming bytes: {e}")

with client.audio.speech.with_streaming_response.create(
    model="tts-1-hd",
    voice="nova",
    input='(goofily): We saw you the other day at the beach making a sand castle. (with awe): "IT WAS THE BIGGEST sand castle I ever saw"',
    response_format= "wav",
) as response:
    try:
        # Initialize PyAudio
        p = pyaudio.PyAudio()

        # Open the stream
        stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, output=True)

        # Initialize the WAV header
        wav_header = None

        for audio_chunk in byte_stream_generator(response=response):
            # Check if this is the first chunk (WAV header)
            if wav_header is None:
                wav_header = audio_chunk
                # Extract the WAV format parameters from the header
                wav_format = wave.open(io.BytesIO(wav_header), 'rb')
                channels, samp_width, framerate, nframes, comptype, compname = wav_format.getparams()
                # Reopen the stream with the correct parameters
                stream = p.open(format=p.get_format_from_width(samp_width), channels=channels, rate=framerate, output=True)
            else:
                # Write the audio chunk to the stream
                stream.write(audio_chunk)

        # Close the stream and PyAudio
        stream.stop_stream()
        stream.close()
        p.terminate()
    except Exception as e:
        print(f"Error during playback: {e}")

print("Playback finished.")
```