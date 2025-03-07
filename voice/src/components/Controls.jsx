import { useState } from 'react';

export function Controls({ isConnected, onConnect, onDisconnect }) {
    const [apiKey, setApiKey] = useState('');

    const handleToggleConnection = async () => {
        if (isConnected) {
            await onDisconnect();
        } else {
            try {
                await onConnect(apiKey);
            } catch (error) {
                alert('Failed to connect: ' + error.message);
            }
        }
    };

    return (
        <div className="controls">
            <input
                type="text"
                className="api-key-input"
                placeholder="Enter your OpenAI API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnected}
            />
            <button
                className="button"
                onClick={handleToggleConnection}
            >
                {isConnected ? 'Disconnect' : 'Connect'}
            </button>
        </div>
    );
} 