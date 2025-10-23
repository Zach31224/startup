import React from 'react';
import './editor.css';

export function Editor() {
  return (
    <main>
      <Timer />
      <div className="editor-container">
        <div className="editor-code-area">
          <textarea className="editor-textarea" rows="20" cols="40" placeholder="Write your Python code here..."></textarea>
          <button className="editor-run-btn">Run Code</button>
          <div>
            <h3 style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', marginBottom: '0.4em'
            }}>Output:</h3>
            <pre className="editor-output"><em>Your code's output will appear here.</em></pre>
          </div>
          <p className="system-event"><em>Third-party API calls and code execution will be implemented here.</em></p>
        </div>
        <img src="/Maze.png" className="editor-maze-img" alt="Maze" />
      </div>
    </main>
  );
}

export function Timer() {
  const [elapsed, setElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  const editorDisabled = false;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function handleStart() {
    setRunning(true);
  }

  function handlePause() {
    setRunning(false);
  }

  function handleReset() {
    setRunning(false);
    setElapsed(0);
  }

  return (
    <div className="editor-header">
      <div className="timer">
        <span className="timer-badge">{formatTime(elapsed)}</span>
        <div className="timer-controls">
          {!running && <button className="editor-run-btn" onClick={handleStart}>Start</button>}
          {running && <button className="editor-run-btn" onClick={handlePause}>Pause</button>}
          <button className="editor-run-btn" onClick={handleReset}>Reset</button>
        </div>
      </div>
      <div className="editor-meta">
        <small>Auto-saves draft to localStorage</small>
      </div>
    </div>
  );
}