import { Status } from './components/Status';
import { Controls } from './components/Controls';
import { Transcript } from './components/Transcript';
import { useVoiceChat } from './hooks/useVoiceChat';
import './App.css';

function App() {
  const {
    isConnected,
    isSpeaking,
    messages,
    connect,
    disconnect
  } = useVoiceChat();

  return (
    <div className="container">
      <h1>Voice Chat with OpenAI</h1>
      <Status isConnected={isConnected} isSpeaking={isSpeaking} />
      <Controls
        isConnected={isConnected}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <Transcript messages={messages} />
    </div>
  );
}

export default App;
