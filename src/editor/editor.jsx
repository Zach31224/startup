import React from 'react';
import './editor.css';
import { saveScoreEntry } from '../utils/scores';

export function Editor() {
  const [code, setCode] = React.useState(() => {
    try {
      return localStorage.getItem('pythings.editor.code') || '';
    } catch {
      return '';
    }
  });

  const [elapsed, setElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [output, setOutput] = React.useState('');
  const intervalRef = React.useRef(null);
  const textareaRef = React.useRef(null);
  const gutterRef = React.useRef(null);

  React.useEffect(() => {
    try {
      localStorage.setItem('pythings.editor.code', code);
    } catch {}
  }, [code]);

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

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function handleStart() {
    // start fresh: reset elapsed and begin timing
    setElapsed(0);
    setOutput('');
    setRunning(true);
  }

  function handleFinish() {
    // only finish if timer is running (or if elapsed > 0)
    if (!running && elapsed === 0) {
      setOutput('No run in progress to finish.');
      return;
    }

    setRunning(false);

    const name = localStorage.getItem('pythings.user') || 'Anonymous';
    const now = new Date().toLocaleString();

    // Save a score entry with the elapsed time in the time_taken field
    try {
      saveScoreEntry({ name, score: 100, date: now, time_taken: elapsed });
      setOutput(`Finished: ${formatTime(elapsed)} — saved score for ${name}.`);
    } catch (e) {
      // fallback: manual localStorage write if util fails
      try {
        const raw = localStorage.getItem('pythings.scores');
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({ name, score: 100, date: now, time_taken: elapsed });
        localStorage.setItem('pythings.scores', JSON.stringify(arr));
        setOutput(`Finished: ${formatTime(elapsed)} — saved score for ${name} (fallback).`);
      } catch {
        setOutput(`Finished: ${formatTime(elapsed)} — failed to save score.`);
      }
    }
  }

  function handleReset() {
    setRunning(false);
    setElapsed(0);
    setOutput('');
  }

  function handleRun() {
    const lines = code.split('\n').length;
    const chars = code.length;
    const now = new Date().toLocaleString();
    const simulatedOutput = `Simulated run — ${lines} line(s), ${chars} char(s). (${now}) Elapsed: ${formatTime(elapsed)}`;
    setOutput(simulatedOutput);
    try {
      const raw = localStorage.getItem('pythings.submissions');
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ code, date: now, elapsed });
      const truncated = arr.slice(0, 50);
      localStorage.setItem('pythings.submissions', JSON.stringify(truncated));
    } catch {}
  }

  const lineCount = Math.max(1, code.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  function handleScroll(e) {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  }

  function handleKeyDown(e) {
    if (!textareaRef.current) return;

    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (e.key === 'Tab') {
      e.preventDefault();
      const tab = '  ';
      const newValue = code.slice(0, start) + tab + code.slice(end);
      setCode(newValue);
      window.requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + tab.length;
      });
    } else if (e.key === 'Enter') {
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const line = code.slice(lineStart, start);
      const indentMatch = line.match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : '';
      const insert = '\n' + indent;
      e.preventDefault();
      const newValue = code.slice(0, start) + insert + code.slice(end);
      setCode(newValue);
      window.requestAnimationFrame(() => {
        const pos = start + insert.length;
        el.selectionStart = el.selectionEnd = pos;
      });
    } else if ((e.key === ']' || e.key === '[') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = code.indexOf('\n', start);
      const realLineEnd = lineEnd === -1 ? code.length : lineEnd;
      const lineText = code.slice(lineStart, realLineEnd);
      if (e.key === ']') {
        const newLine = '  ' + lineText;
        const newValue = code.slice(0, lineStart) + newLine + code.slice(realLineEnd);
        setCode(newValue);
        window.requestAnimationFrame(() => {
          const delta = 2;
          el.selectionStart = start + delta;
          el.selectionEnd = end + delta;
        });
      } else {
        const newLine = lineText.replace(/^ {0,2}/, '');
        const removed = lineText.length - newLine.length;
        const newValue = code.slice(0, lineStart) + newLine + code.slice(realLineEnd);
        setCode(newValue);
        window.requestAnimationFrame(() => {
          const delta = -removed;
          el.selectionStart = Math.max(lineStart, start + delta);
          el.selectionEnd = Math.max(lineStart, end + delta);
        });
      }
    }
  }

  return (
    <main className="editor-root">
      <div className="editor-header">
        <div className="timer">
          <span className="timer-badge">{formatTime(elapsed)}</span>
          <div className="timer-controls">
            {!running && <button className="editor-run-btn" onClick={handleStart}>Start</button>}
            {running && <button className="editor-run-btn" onClick={handleFinish}>Finish</button>}
            <button className="editor-run-btn" onClick={handleReset}>Reset</button>
            <button className="editor-run-btn" onClick={handleRun}>Run</button>
          </div>
        </div>
        <div className="editor-meta">
          <small>Auto-saves draft to localStorage</small>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-code-area" aria-label="Code editor">
          <div className="code-editor-wrapper">
            <div className="gutter" ref={gutterRef} aria-hidden>
              {lineNumbers.map((n) => (
                <div key={n} className="gutter-line">{n}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck={false}
              placeholder="# Write your code here..."
            />
          </div>

          <div className="editor-actions">
            <button className="editor-run-btn" onClick={handleRun}>Run</button>
            <button className="editor-run-btn" onClick={() => { setCode(''); localStorage.removeItem('pythings.editor.code'); }}>Clear</button>
            <div className="small-note">Lines: {lineCount}</div>
          </div>
        </div>

        <aside className="editor-preview">
          <h3>Output</h3>
          <pre className="output-box" aria-live="polite">{output || '(no output yet)'}</pre>

          <h4>Submissions (most recent)</h4>
          <div className="submissions">
            {(() => {
              try {
                const raw = localStorage.getItem('pythings.submissions');
                const arr = raw ? JSON.parse(raw) : [];
                if (!arr.length) return <div className="muted">No submissions yet</div>;
                return arr.slice(0, 6).map((s, i) => (
                  <div key={i} className="submission">
                    <div className="submission-meta">{s.date} — {s.elapsed ? formatTime(s.elapsed) : '—'}</div>
                    <pre className="submission-code">{s.code.slice(0, 200)}{s.code.length > 200 ? '…' : ''}</pre>
                  </div>
                ));
              } catch {
                return <div className="muted">Unable to load submissions</div>;
              }
            })()}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Editor;