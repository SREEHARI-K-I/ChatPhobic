import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username: username.trim(),
        password: password
      });
      if (response.data.success) {
        onLoginSuccess(response.data.username);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.logoText}>ChatPhobic</h1>
        <p style={styles.subtitle}>Sign up or log into the global channel</p>
        
        {error && <div style={styles.errorBox}>{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Log In</button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  card: { width: '350px', padding: '40px', borderRadius: '1px', background: '#000000', border: '1px solid #262626', textAlign: 'center' },
  logoText: { fontFamily: '"Grand Hotel", cursive, sans-serif', fontSize: '3.2rem', color: '#ffffff', margin: '10px 0 20px 0', fontWeight: 'normal' },
  subtitle: { color: '#a8a8a8', fontSize: '0.9rem', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', margin: '6px 0', border: '1px solid #262626', borderRadius: '3px', backgroundColor: '#121212', color: '#ffffff', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' },
  button: { width: '100%', padding: '8px 0', backgroundColor: '#0095f6', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', marginTop: '15px' },
  errorBox: { backgroundColor: '#ed4956', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '15px' }
};