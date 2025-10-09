import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Home } from './home/home';
import { Login } from './login/login';
import { Editor } from './editor/editor';
import { Gallery } from './gallery/gallery';
import { Scores } from './scores/scores';

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Not Found
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="body">
        <header>
          <h1>Pythings – Creative Code Puzzles</h1>
          <nav className="pything-nav">
            <NavLink to="/" className="pything-nav-link">Home</NavLink>
            <NavLink to="/login" className="pything-nav-link">Login/Register</NavLink>
            <NavLink to="/editor" className="pything-nav-link">Editor</NavLink>
            <NavLink to="/gallery" className="pything-nav-link">Gallery</NavLink>
            <NavLink to="/scores" className="pything-nav-link">Leaderboard</NavLink>
            <a href="https://github.com/Zach31224/startup" className="pything-nav-link" target="_blank">GitHub Repo</a>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer>
          <p><em>Zachary Sandberg</em></p>
          <a href="https://github.com/Zach31224/startup" target="_blank">GitHub Repository</a>
        </footer>
      </div>
    </BrowserRouter>
  );
}