import React from 'react';
import './scores.css';
import { AuthState } from '../auth';

export function Scores({ userName = '', authState = 'unauthenticated' }) {
  const [scores, setScores] = React.useState([]);
  const [newScore, setNewScore] = React.useState('');
  const [gameName, setGameName] = React.useState('');

  React.useEffect(() => {
    loadScores();
  }, []);

  async function loadScores() {
    try {
      const response = await fetch('/api/scores', {
        credentials: 'include',
      });
      if (response.ok) {
        const scoresData = await response.json();
        setScores(scoresData);
      } else if (response.status === 401) {
        console.log('Not authenticated - cannot load scores');
        setScores([]);
      }
    } catch (error) {
      console.error('Failed to load scores:', error);
      setScores([]);
    }
  }

  async function submitScore(e) {
    e.preventDefault();
    if (!newScore.trim() || isNaN(newScore)) return;

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          score: parseInt(newScore),
          game: gameName || 'puzzle'
        }),
      });

      if (response.ok) {
        setNewScore('');
        setGameName('');
        loadScores(); // Reload scores
      } else if (response.status === 401) {
        console.error('Not authenticated - cannot submit score');
        alert('Please login to submit scores');
      } else {
        console.error('Failed to submit score');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  const scoreRows = [];
  // Only show top 10 scores
  const topScores = scores.slice(0, 10);
  
  if (topScores && topScores.length) {
    for (const [i, score] of topScores.entries()) {
      scoreRows.push(
        <tr key={score.id || i}>
          <td>{i + 1}</td>
          <td>{score.email || score.name}</td>
          <td>{score.score}</td>
          <td>{formatDate(score.date)}</td>
          <td>{score.game || 'puzzle'}</td>
        </tr>
      );
    }
  } else {
    scoreRows.push(
      <tr key="0">
        <td colSpan="5">Be the first to score</td>
      </tr>
    );
  }

  return (
    <main>
      <h2>Leaderboard</h2>
      
      {authState === AuthState.Authenticated && (
        <form onSubmit={submitScore} style={{ marginBottom: '2em', padding: '1em', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '0 auto 2em auto' }}>
          <h3>Submit Your Score</h3>
          <input
            type="number"
            placeholder="Your score"
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            style={{ width: '100%', padding: '0.5em', margin: '0.25em 0', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <input
            type="text"
            placeholder="Game/Puzzle name (optional)"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            style={{ width: '100%', padding: '0.5em', margin: '0.25em 0', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" className="editor-run-btn" style={{ marginTop: '0.5em' }}>Submit Score</button>
        </form>
      )}

      <table style={{ margin: '0 auto', fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Score</th>
            <th>Date</th>
            <th>Game</th>
          </tr>
        </thead>
        <tbody>
          {scoreRows}
        </tbody>
      </table>
    </main>
  );
}

export default Scores;