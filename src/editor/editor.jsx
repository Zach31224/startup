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
  const [challenges, setChallenges] = React.useState([]);
  const [selectedChallenge, setSelectedChallenge] = React.useState(null);
  const [testResults, setTestResults] = React.useState(null);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const intervalRef = React.useRef(null);
  const textareaRef = React.useRef(null);
  const gutterRef = React.useRef(null);
  const [notifications, setNotifications] = React.useState([]);
  const socketRef = React.useRef(null);

  React.useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'challengeCompleted') {
        setNotifications(prev => [...prev, msg]);
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n !== msg));
        }, 5000);
      }
    };
    
    return () => {
      socket.close();
    };
  }, []);

  React.useEffect(() => {
    async function loadChallenges() {
      try {
        // Load official challenges
        const officialResponse = await fetch('/api/challenges');
        let allChallenges = [];
        
        if (officialResponse.ok) {
          const officialData = await officialResponse.json();
          allChallenges = officialData.map(c => ({ ...c, type: 'official' }));
        }
        
        // Load community challenges
        const communityResponse = await fetch('/api/community-challenges');
        if (communityResponse.ok) {
          const communityData = await communityResponse.json();
          const formattedCommunity = communityData.map(c => ({
            id: c._id,
            title: c.title,
            description: c.description,
            difficulty: c.difficulty,
            starterCode: c.starterCode || '# Write your code here\n',
            testCases: c.testCases,
            hints: c.hints || [],
            author: c.author,
            type: 'community'
          }));
          allChallenges = [...allChallenges, ...formattedCommunity];
        }
        
        setChallenges(allChallenges);
        // Auto-select first challenge
        if (allChallenges.length > 0) {
          setSelectedChallenge(allChallenges[0]);
          setCode(allChallenges[0].starterCode || '');
        }
      } catch (error) {
        console.error('Failed to load challenges:', error);
      }
    }
    loadChallenges();
  }, []);

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



  async function handleRun() {
    if (!code.trim()) {
      setOutput('Error: No code to execute');
      return;
    }

    setIsExecuting(true);
    setOutput('Executing...');
    setTestResults(null);

    try {
      if (selectedChallenge && selectedChallenge.testCases) {
        // Run test cases for the challenge
        const results = [];
        let allPassed = true;

        for (const testCase of selectedChallenge.testCases) {
          const response = await fetch('/api/execute-python', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              code: code,
              input: testCase.input || ''
            })
          });

          if (response.ok) {
            const result = await response.json();
            // Trim whitespace for comparison to avoid issues with trailing newlines/spaces
            const actualOutput = (result.output || '').trim();
            const expectedOutput = (testCase.expectedOutput || '').trim();
            const passed = result.success && actualOutput === expectedOutput;
            results.push({
              description: testCase.description,
              passed,
              expected: testCase.expectedOutput,
              actual: result.output,
              error: result.error
            });
            if (!passed) allPassed = false;
          } else {
            const error = await response.json();
            results.push({
              description: testCase.description,
              passed: false,
              error: error.message || 'Execution failed'
            });
            allPassed = false;
          }
        }

        setTestResults({ results, allPassed });
        
        if (allPassed) {
          // Calculate score based on difficulty and time
          let baseScore = 100; // beginner
          if (selectedChallenge.difficulty === 'intermediate') {
            baseScore = 500;
          } else if (selectedChallenge.difficulty === 'advanced') {
            baseScore = 1000;
          }
          
          // Subtract 10 points per second elapsed
          const timePenalty = elapsed * 10;
          const calculatedScore = Math.max(0, baseScore - timePenalty);
          
          setOutput(`✅ All tests passed! Challenge complete! Score: ${calculatedScore}`);
          await saveScore(calculatedScore);
          
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: 'challengeCompleted',
              challenge: selectedChallenge.title,
              difficulty: selectedChallenge.difficulty,
              score: calculatedScore,
              time: elapsed
            }));
          }
        } else {
          setOutput(`❌ Some tests failed. Keep trying!`);
        }
      } else {
        // Freestyle mode - just run the code
        const response = await fetch('/api/execute-python', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code, input: '' })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setOutput(result.output || '(no output)');
          } else {
            setOutput(`Error:\n${result.error || 'Unknown error'}`);
          }
        } else {
          const error = await response.json();
          setOutput(`Execution failed: ${error.message || 'Unknown error'}`);
        }
      }

      // Save to submissions
      const now = new Date().toLocaleString();
      try {
        const raw = localStorage.getItem('pythings.submissions');
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift({ code, date: now, elapsed });
        const truncated = arr.slice(0, 50);
        localStorage.setItem('pythings.submissions', JSON.stringify(truncated));
      } catch {}

    } catch (error) {
      console.error('Run error:', error);
      setOutput(`Network error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  }

  async function saveScore(score) {
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          score: score,
          game: selectedChallenge?.title || 'Freestyle',
        }),
      });
      if (!response.ok && response.status !== 401) {
        console.error('Failed to save score');
      }
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }

  function handleChallengeSelect(challenge) {
    setSelectedChallenge(challenge);
    setCode(challenge.starterCode || '');
    setOutput('');
    setTestResults(null);
    setElapsed(0);
    setRunning(true); // Auto-start timer when challenge is selected
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
      {notifications.map((notif, i) => (
        <div key={i} style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '0.75em', 
          marginBottom: '1em', 
          borderRadius: '4px',
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          🏆 Someone just completed "{notif.challenge}" ({notif.difficulty}) with a score of {notif.score} in {notif.time}s!
        </div>
      ))}
      
      <div className="editor-header">
        <div className="timer">
          <span className="timer-badge">{formatTime(elapsed)}</span>
        </div>
        <div className="editor-meta">
          <small>Timer starts when you select a challenge</small>
        </div>
      </div>

      <div className="puzzle-header">
        <p className="honor-code-note">
          <em>For now, we can't check your code to make sure you follow all of the instructions. 
          We only check your output. Do the right thing, and follow the instructions. 
          Jesus knows when you cheat. :)</em>
        </p>
        
        <div className="challenge-selector">
          <label htmlFor="challenge-select"><strong>Select Challenge:</strong></label>
          <select 
            id="challenge-select"
            value={selectedChallenge?.id || ''}
            onChange={(e) => {
              const challenge = challenges.find(c => c.id === e.target.value);
              if (challenge) handleChallengeSelect(challenge);
            }}
            className="challenge-dropdown"
          >
            <optgroup label="Official Challenges">
              {challenges.filter(c => c.type === 'official').map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.difficulty})
                </option>
              ))}
            </optgroup>
            <optgroup label="Community Challenges">
              {challenges.filter(c => c.type === 'community').map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.difficulty}) - by {c.author}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        
        {selectedChallenge && (
          <>
            <h2>
              {selectedChallenge.title}
              {selectedChallenge.type === 'community' && (
                <span className="community-badge"> 👥 Community</span>
              )}
            </h2>
            <p>{selectedChallenge.description}</p>
            {selectedChallenge.type === 'community' && (
              <p className="challenge-author">Created by: {selectedChallenge.author}</p>
            )}
            {selectedChallenge.hints && selectedChallenge.hints.length > 0 && (
              <details className="hints-section">
                <summary>💡 Hints</summary>
                <ul>
                  {selectedChallenge.hints.map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
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
            <button 
              className="editor-run-btn" 
              onClick={handleRun}
              disabled={isExecuting}
            >
              {isExecuting ? 'Running...' : 'Run Code'}
            </button>
            <button className="editor-run-btn" onClick={() => { setCode(selectedChallenge?.starterCode || ''); }}>Reset Code</button>
            <button className="editor-run-btn" onClick={() => { setCode(''); localStorage.removeItem('pythings.editor.code'); }}>Clear All</button>
            <div className="small-note">Lines: {lineCount}</div>
          </div>
        </div>

        <aside className="editor-preview">
          <h3>Output</h3>
          <pre className="output-box" aria-live="polite">{output || '(no output yet)'}</pre>

          {testResults && (
            <div className="test-results">
              <h4>Test Results</h4>
              {testResults.results.map((result, i) => (
                <div key={i} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                  <div className="test-header">
                    {result.passed ? '✅' : '❌'} {result.description}
                  </div>
                  {!result.passed && (
                    <div className="test-details">
                      <div><strong>Expected:</strong> <code>{result.expected}</code></div>
                      <div><strong>Got:</strong> <code>{result.actual || result.error}</code></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

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