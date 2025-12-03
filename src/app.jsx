import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Home } from './home/home';
import { Login } from './login/login';
import { Editor } from './editor/editor';
import { Gallery } from './gallery/gallery';
import { Scores } from './scores/scores';
import { AuthState } from './auth';

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Not Found
    </main>
  );
}

export default function App() {
  const [authState, setAuthState] = React.useState(() => {
    const storedUser = localStorage.getItem('pythings.user');
    return storedUser ? AuthState.Authenticated : AuthState.Unauthenticated;
  });
  const [userName, setUserName] = React.useState(() => {
    return localStorage.getItem('pythings.user') || '';
  });

  function handleAuthChange(newUserName, newAuthState) {
    setUserName(newUserName || '');
    setAuthState(newAuthState);
  }

  function handleLogout() {
    localStorage.removeItem('pythings.user');
    setUserName('');
    setAuthState(AuthState.Unauthenticated);
  }

  return (
    <BrowserRouter>
      <div className="body">
        <div className="logo-bar">
          <img src="/Logo2.png" alt="Pythings Logo" className="header-logo" />
        </div>
        <header>
          <nav className="pything-nav">
            <NavLink to="/" className="pything-nav-link">Home</NavLink>
            {authState !== AuthState.Authenticated && (
              <NavLink to="/login" className="pything-nav-link">Login/Register</NavLink>
            )}
            {authState === AuthState.Authenticated && (
              <NavLink to="/editor" className="pything-nav-link">Puzzles</NavLink>
            )}
            <NavLink to="/gallery" className="pything-nav-link">Gallery</NavLink>
            {authState === AuthState.Authenticated && (
              <NavLink to="/scores" className="pything-nav-link">Leaderboard</NavLink>
            )}
            {authState === AuthState.Authenticated && (
              <NavLink to="#" onClick={handleLogout} className="pything-nav-link">Logout</NavLink>
            )}
            <a href="https://github.com/Zach31224/startup" className="pything-nav-link" target="_blank" rel="noreferrer">GitHub Repo</a>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login userName={userName} authState={authState} onAuthChange={handleAuthChange} />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/scores" element={<Scores userName={userName} authState={authState} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer>
          <p><em>Zachary Sandberg</em></p>
          <a href="https://github.com/Zach31224/startup" target="_blank" rel="noreferrer">GitHub Repository</a>
        </footer>
      </div>
    </BrowserRouter>
  );
}