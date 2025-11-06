import React from 'react';
import './home.css';
import { NavLink } from 'react-router-dom';

export function Home() {
  const [quote, setQuote] = React.useState({
    content: 'Loading inspirational quote...',
    author: '',
  });

  React.useEffect(() => {
    fetchQuote();
  }, []);

  async function fetchQuote() {
    try {
      const response = await fetch('https://api.quotable.io/random?tags=technology|education|inspirational');
      if (response.ok) {
        const data = await response.json();
        setQuote({
          content: data.content,
          author: data.author,
        });
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      setQuote({
        content: 'Code is poetry.',
        author: 'Unknown',
      });
    }
  }

  return (
    <main className="container-fluid bg-secondary text-center">
      <section>
        <h2>Welcome, User! <em>(will be changed later)</em></h2>
        <p>
          Pythings is a python learning website. Solve puzzles and make pixel art by writing Python code.<br />
          Try game levels, drawing challenges, or freestyle your own art. See your code run instantly, get feedback, and share creations!
        </p>
        
        {/* Third-party API integration - inspirational quote */}
        <div style={{
          margin: '2em auto',
          padding: '1.5em',
          maxWidth: '600px',
          background: '#fff',
          border: '3px solid #114c26',
          borderRadius: '12px',
          boxShadow: '2px 4px 0 #114c26',
        }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1em', marginBottom: '0.5em' }}>
            "{quote.content}"
          </p>
          <p style={{ fontWeight: 'bold', color: '#114c26' }}>
            — {quote.author}
          </p>
          <button 
            className="editor-run-btn" 
            onClick={fetchQuote}
            style={{ marginTop: '1em' }}
          >
            New Quote
          </button>
        </div>

        <img src="/sceetch.png" alt="Design Sketch" width="300" />
        <ul>
          <li><strong>Login:</strong> <NavLink to="/login">Go to Login</NavLink></li>
          <li><strong>Editor:</strong> <NavLink to="/editor">Try coding!</NavLink></li>
          <li><strong>Gallery:</strong> <NavLink to="/gallery">See community art</NavLink></li>
          <li><strong>Leaderboard:</strong> <NavLink to="/scores">See scores</NavLink></li>
        </ul>
      </section>
    </main>
  );
}