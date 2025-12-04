import React from 'react';
import './scores.css';
import { AuthState } from '../auth';

export function Scores({ userName = '', authState = 'unauthenticated' }) {
  const [scores, setScores] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    loadScores();
    
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'scoreSubmitted') {
        setNotifications(prev => [...prev, msg]);
        loadScores();
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n !== msg));
        }, 5000);
      }
    };
    
    return () => {
      socket.close();
    };
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
          <td style={{ padding: '0.5em 2em' }}>{i + 1}</td>
          <td style={{ padding: '0.5em 2em' }}>{score.email || score.name}</td>
          <td style={{ padding: '0.5em 2em' }}>{score.score}</td>
          <td style={{ padding: '0.5em 2em' }}>{formatDate(score.date)}</td>
          <td style={{ padding: '0.5em 2em' }}>{score.game || 'puzzle'}</td>
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
      
      {notifications.map((notif, i) => (
        <div key={i} style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '0.75em', 
          marginBottom: '1em', 
          borderRadius: '4px',
          border: '1px solid #c3e6cb',
          textAlign: 'center'
        }}>
          🎉 {notif.user} just scored {notif.score} points on {notif.game}!
        </div>
      ))}

      <table style={{ margin: '0 auto', fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', borderSpacing: '2em 0.5em' }}>
        <thead>
          <tr>
            <th style={{ padding: '0.5em 2em' }}>#</th>
            <th style={{ padding: '0.5em 2em' }}>Player</th>
            <th style={{ padding: '0.5em 2em' }}>Score</th>
            <th style={{ padding: '0.5em 2em' }}>Date</th>
            <th style={{ padding: '0.5em 2em' }}>Game</th>
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