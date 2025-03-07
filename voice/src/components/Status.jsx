export function Status({ isConnected, isSpeaking, error }) {
    return (
        <div className="status-container">
            <div className={`status ${isConnected ? 'connected' : ''}`}>
                {isConnected ? 'Connected' : 'Not Connected'}
            </div>
            <div className={`status ${isSpeaking ? 'speaking' : ''}`}>
                {isSpeaking ? 'Speaking' : 'Not Speaking'}
            </div>
            {error && (
                <div className="status error">
                    Error: {error}
                </div>
            )}
        </div>
    );
} 