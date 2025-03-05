import React, { useState } from 'react';

const LogRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [logs, setLogs] = useState([]);

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  const captureLog = (level, ...args) => {
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
    const logEntry = `[${new Date().toISOString()}] [${level.toUpperCase()}]: ${message}`;

    setLogs(prevLogs => [...prevLogs, logEntry]);
    originalLog.apply(console, args);
  };

  const startRecording = () => {
    console.log('Log recording started...');
    console.log = (...args) => captureLog('log', ...args);
    console.warn = (...args) => captureLog('warn', ...args);
    console.error = (...args) => captureLog('error', ...args);
  };

  const stopRecordingAndCopy = () => {
    console.log('Log recording stopped. Copying logs to clipboard...');
    
    // Restore original console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;

    const fullText = "Browser console.logs```\n" + logs.join('\n') + "\n```";

    // Copy logs to clipboard
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Logs copied to clipboard!');
    });

    setLogs([]); // Clear logs after copying
  };

  return (
    <button
      onClick={() => {
        if (recording) {
          stopRecordingAndCopy();
        } else {
          startRecording();
        }
        setRecording(!recording);
      }}
      style={{
        position: 'fixed',
        top: '14px',
        left: '20px',
        padding: '10px 20px',
        backgroundColor: recording ? 'red' : 'green',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        zIndex: 999
      }}
    >
      {recording ? 'Stop & Copy Logs' : 'Start Log Recording'}
    </button>
  );
};

export default LogRecorder;
