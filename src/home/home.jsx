import React from 'react';
import './home.css';
import { NavLink } from 'react-router-dom';

export function Home() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <section>
        <h2>Welcome, User! <em>(will be changed later)</em></h2>
        <p>
          Pythings is a python learning website. Solve puzzles and make pixel art by writing Python code.<br />
          Try game levels, drawing challenges, or freestyle your own art. See your code run instantly, get feedback, and share creations!
        </p>
        <img src="/public/sceetch.png" alt="Design Sketch" width="300" />
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