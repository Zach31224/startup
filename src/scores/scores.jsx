import React from 'react';
import './scores.css';

/**
 * Scores reads top scores from localStorage (will make later)
 * Score items expected: { name, score, date }
 */
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

  const scoreRows = [];
  if (scores && scores.length) {
    for (const [i, score] of scores.entries()) {
      scoreRows.push(
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{score.name}</td>
          <td>{score.score}</td>
          <td>{score.date}</td>
        </tr>
      );
    }
  } else {
    scoreRows.push(
      <tr key="0">
        <td colSpan="4">Be the first to score</td>
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