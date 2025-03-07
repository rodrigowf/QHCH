import { useState } from 'react';

export function Controls({ 
  isConnected, 
  systemPrompt,
  onSystemPromptChange,
  onConnect, 
  onDisconnect,
  onClearMessages
}) {
    const [apiKey, setApiKey] = useState('');
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [tempPrompt, setTempPrompt] = useState(systemPrompt);

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

    const handlePromptEdit = () => {
        if (isEditingPrompt) {
            onSystemPromptChange(tempPrompt);
        }
        setIsEditingPrompt(!isEditingPrompt);
    };

    const handlePromptKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePromptEdit();
        }
    };

    return (
        <div className="controls">
            <div className="control-group">
                <div className="api-key-group">
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
            </div>

            <div className="control-group">
                <div className="system-prompt">
                    {isEditingPrompt ? (
                        <textarea
                            className="system-prompt-input"
                            value={tempPrompt}
                            onChange={(e) => setTempPrompt(e.target.value)}
                            onKeyDown={handlePromptKeyDown}
                            placeholder="Enter system prompt..."
                            rows={4}
                            autoFocus
                        />
                    ) : (
                        <div className="system-prompt-display">
                            {systemPrompt}
                        </div>
                    )}
                    <div className="prompt-controls">
                        <button
                            className="button"
                            onClick={handlePromptEdit}
                        >
                            {isEditingPrompt ? 'Save' : 'Edit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="clear-conversation-group">
                <button
                    className="button clear-button"
                    onClick={onClearMessages}
                >
                    Clear Conversation
                </button>
            </div>
        </div>
    );
} 