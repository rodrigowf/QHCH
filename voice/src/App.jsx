import { useState } from 'react';
import { Status } from './components/Status';
import { Controls } from './components/Controls';
import { Transcript } from './components/Transcript';
import { useVoiceChat } from './hooks/useVoiceChat';
import './App.css';

function App() {
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant. Be concise and friendly in your responses. Communicate clearly and effectively."
  );

  const {
    isConnected,
    isSpeaking,
    messages,
    error,
    connect,
    disconnect,
    updateSystemPrompt,
    clearMessages
  } = useVoiceChat(systemPrompt);

  const handleSystemPromptChange = async (newPrompt) => {
    setSystemPrompt(newPrompt);
    if (isConnected) {
      await updateSystemPrompt(newPrompt);
    }
  };

  return (
    <div className="container">
      <h1>Voice Chat with OpenAI</h1>
      <Status isConnected={isConnected} isSpeaking={isSpeaking} error={error} />
      <Controls
        isConnected={isConnected}
        systemPrompt={systemPrompt}
        onSystemPromptChange={handleSystemPromptChange}
        onConnect={connect}
        onDisconnect={disconnect}
        onClearMessages={clearMessages}
      />
      <Transcript messages={messages} />
    </div>
  );
}

export default App;
