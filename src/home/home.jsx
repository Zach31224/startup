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
  }, []); // Empty dependency array - only run once

  async function fetchQuote() {
    try {
      console.log('Fetching new quote...');
      // Try quotable.io first
      let response = await fetch('https://api.quotable.io/random');
      console.log('Quote API response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Quote data:', data);
        setQuote({
          content: data.content,
          author: data.author,
        });
        return;
      }
    } catch (error) {
      console.log('Quotable API failed, trying alternative...', error);
    }

    // Fallback to different API or static quotes
    try {
      const response = await fetch('https://dummyjson.com/quotes/random');
      if (response.ok) {
        const data = await response.json();
        setQuote({
          content: data.quote,
          author: data.author,
        });
        return;
      }
    } catch (error) {
      console.log('DummyJSON API also failed:', error);
    }

    // Use rotating static quotes as final fallback
    const staticQuotes = [
      { content: 'The only way to learn a new programming language is by writing programs in it.', author: 'Dennis Ritchie' },
      { content: 'Code is poetry.', author: 'Unknown' },
      { content: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
      { content: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
      { content: 'In order to be irreplaceable, one must always be different.', author: 'Coco Chanel' },
      { content: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    ];
    const randomQuote = staticQuotes[Math.floor(Math.random() * staticQuotes.length)];
    setQuote(randomQuote);
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