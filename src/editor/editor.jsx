import React from 'react';
import './editor.css';

export function Editor() {
  return (
    <main>
      <div className="editor-container">
        <div className="editor-code-area">
          <textarea className="editor-textarea" rows="20" cols="50" placeholder="Write your Python code here..."></textarea>
          <button className="editor-run-btn">Run Code</button>
          <div>
            <h3 style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', marginBottom: '0.4em'
            }}>Output:</h3>
            <pre className="editor-output"><em>Your code's output will appear here.</em></pre>
          </div>
          <p className="system-event"><em>Third-party API calls and code execution will be implemented here.</em></p>
        </div>
        <img src="/maze.png" className="editor-maze-img" alt="Maze" />
      </div>
    </main>
  );
}