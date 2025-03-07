export function Status({ isConnected, isSpeaking }) {
    return (
        <div className="status-container">
            <div className={`status ${isConnected ? 'connected' : ''}`}>
                {isConnected ? 'Connected' : 'Not Connected'}
            </div>
            <div className={`status ${isSpeaking ? 'speaking' : ''}`}>
                {isSpeaking ? 'Speaking' : 'Not Speaking'}
            </div>
        </div>
    );
} 