import React from 'react';
import './scores.css';

export function Scores({ userName = '', authState = 'unauthenticated' }) {
  const [scores, setScores] = React.useState([]);

  React.useEffect(() => {
    const raw = localStorage.getItem('pythings.scores');
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      setScores(parsed);
    } catch (err) {
      console.error('Failed to parse scores', err);
      setScores([]);
    }
  }, []);

  function formatTime(sec) {
    if (sec === undefined || sec === null) return '-';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const scoreRows = [];
  if (scores && scores.length) {
    for (const [i, score] of scores.entries()) {
      scoreRows.push(
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{score.name}</td>
          <td>{score.score}</td>
          <td>{score.date}</td>
          <td>{formatTime(score.time_taken)}</td>
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
      <table style={{ margin: '0 auto', fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Score</th>
            <th>Date</th>
            <th>Time taken</th>
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