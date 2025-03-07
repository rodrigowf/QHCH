import { useEffect, useRef } from 'react';

export function Transcript({ messages }) {
    const transcriptRef = useRef(null);

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="conversation">
            <div ref={transcriptRef} className="transcript">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role}-message`}
                    >
                        {message.text}
                    </div>
                ))}
            </div>
        </div>
    );
} 