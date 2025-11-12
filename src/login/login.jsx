import React from 'react';
import './login.css';
import { AuthState } from '../auth';

export function Login({ userName: initialUserName = '', authState = AuthState.Unauthenticated, onAuthChange = () => {} }) {
  const [username, setUsername] = React.useState(initialUserName);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isRegistering, setIsRegistering] = React.useState(false);

  React.useEffect(() => {
    setUsername(initialUserName);
  }, [initialUserName]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const endpoint = isRegistering ? '/api/auth/create' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('pythings.user', data.email);
        onAuthChange(data.email, AuthState.Authenticated);
        setPassword(''); // Clear password after successful login
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setError('User already exists. Please login instead.');
        } else if (response.status === 401) {
          setError('Invalid username or password.');
        } else {
          setError(errorData.msg || 'Authentication failed.');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Auth error:', error);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('pythings.user');
    setUsername('');
    setPassword('');
    onAuthChange('', AuthState.Unauthenticated);
  }

  if (authState === AuthState.Authenticated) {
    return (
      <main>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <div style={{ background: '#fff', border: '3px solid #114c26', borderRadius: '18px', boxShadow: '2px 4px 0 #114c26', padding: '2em' }}>
            <h3>Welcome, {username || initialUserName}!</h3>
            <p>Your user data will be expanded later (avatar, achievements, etc.).</p>
            <button className="editor-run-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', minHeight: '40vh' }}>
        <form onSubmit={handleLogin} style={{
          background: '#fff', border: '3px solid #114c26', borderRadius: '18px', boxShadow: '2px 4px 0 #114c26',
          padding: '2em', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <label htmlFor="username" style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', marginBottom: '0.3em' }}>Username:</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Enter your name" required style={{ marginBottom: '1em', borderRadius: '8px', border: '2px solid #114c26', padding: '0.5em', width: '100%' }} />
          <label htmlFor="password" style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', marginBottom: '0.3em' }}>Password:</label>
          <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" required style={{ marginBottom: '1em', borderRadius: '8px', border: '2px solid #114c26', padding: '0.5em', width: '100%' }} />
          {error && <div style={{ color: 'red', marginBottom: '0.5em' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '1em' }}>
            <button type="submit" className="editor-run-btn">
              {isRegistering ? 'Register' : 'Login'}
            </button>
            <button 
              type="button" 
              className="editor-run-btn" 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
            >
              {isRegistering ? 'Switch to Login' : 'Switch to Register'}
            </button>
          </div>
        </form>
        <p style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26', marginTop: '1em' }}>
          <em>User info will be displayed here after login.</em>
        </p>
      </div>
    </main>
  );
}

export default Login;