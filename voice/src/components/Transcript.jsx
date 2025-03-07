import { useEffect, useRef } from 'react';

export function Transcript({ messages }) {
    const transcriptRef = useRef(null);

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [messages]);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="conversation">
            <div ref={transcriptRef} className="transcript">
                {messages.map((message, index) => (
                    <div
                        key={`${message.timestamp}-${index}`}
                        className={`message ${message.role}-message`}
                    >
                        <div className="message-header">
                            <span className="message-role">
                                {message.role === 'ai' ? 'AI' : 'You'}
                            </span>
                            <span className="message-time">
                                {formatTimestamp(message.timestamp)}
                            </span>
                        </div>
                        <div className="message-content">
                            {message.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 