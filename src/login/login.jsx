import React from 'react';
import './login.css';

export function Login() {
  return (
    <main>
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', minHeight: '40vh'
      }}>
        <form style={{
          background: '#fff', border: '3px solid #114c26', borderRadius: '18px', boxShadow: '2px 4px 0 #114c26',
          padding: '2em', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <label htmlFor="username" style={{
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', marginBottom: '0.3em'
          }}>Username:</label>
          <input id="username" type="text" placeholder="Enter your name" required style={{
            marginBottom: '1em', borderRadius: '8px', border: '2px solid #114c26', padding: '0.5em', width: '100%'
          }} />
          <label htmlFor="password" style={{
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', marginBottom: '0.3em'
          }}>Password:</label>
          <input id="password" type="password" placeholder="Enter your password" required style={{
            marginBottom: '1em', borderRadius: '8px', border: '2px solid #114c26', padding: '0.5em', width: '100%'
          }} />
          <button type="submit" className="editor-run-btn" style={{ marginRight: '8em' }}>Login</button>
          <button type="submit" className="editor-run-btn" style={{ marginLeft: '8em', marginTop: '-2.5em' }}>Register</button>
        </form>
        <p style={{
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', marginTop: '1em'
        }}>
          <em>User info will be displayed here after login.</em>
        </p>
      </div>
    </main>
  );
}