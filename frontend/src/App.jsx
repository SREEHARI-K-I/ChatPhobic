import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// Dynamic detection: Uses Render's live URL or falls back to localhost for local testing
const IS_PROD = import.meta.env.PROD;
const BASE_URL = IS_PROD ? window.location.origin : 'http://localhost:5000';

const SOCKET_URL = BASE_URL;
const API_URL = `${BASE_URL}/api/messages`;
const AUTH_URL = `${BASE_URL}/api/auth/login`;
const REGISTER_URL = `${BASE_URL}/api/auth/register`; // ensure you updated this path variable if split

// ==========================================
// 1. LOGIN COMPONENT
// ==========================================
function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false); // Controls current form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    const url = isSignUp 
      ? REGISTER_URL 
      : AUTH_URL;

    try {
      const response = await axios.post(url, {
        username: username.trim(),
        password: password
      });

      if (isSignUp) {
        // If successfully registered, notify user and switch view to log in
        setSuccessMessage('Account created! You can now log in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        // If successfully logged in, pass user back up to App layer
        if (response.data.success) {
          onLoginSuccess(response.data.username);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed.');
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.authWrapper}>
        <form onSubmit={handleSubmit} style={styles.loginCard}>
          <h1 style={styles.logoText}>ChatPhobic</h1>
          <p style={styles.loginSubtitle}>
            {isSignUp ? 'Create a new account to join' : 'Log into your global channel'}
          </p>
          
          {error && <div style={styles.errorBox}>{error}</div>}
          {successMessage && <div style={styles.successBox}>{successMessage}</div>}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.loginInput}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.loginInput}
            required
          />
          <button type="submit" style={styles.loginButton}>
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div style={styles.toggleCard}>
          <p style={styles.toggleText}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <span 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }} 
              style={styles.toggleLink}
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. CHATROOM COMPONENT
// ==========================================
function ChatRoom({ username, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get(API_URL)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching logs:", err));

    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    socketRef.current.emit('send_message', {
      username: username,
      text: inputMessage.trim()
    });
    setInputMessage('');
  };

  return (
    <div style={styles.chatContainer}>
      <header style={styles.chatHeader}>
        <div style={styles.activeUserRow}>
          <div style={styles.avatarPlaceholder}>
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={styles.headerTitle}>{username}</div>
            <div style={styles.headerStatus}>Active now</div>
          </div>
        </div>
        {/* Sleek Dark Mode Logout Button */}
        <button onClick={onLogout} style={styles.logoutButton}>
          Log Out
        </button>
      </header>

      <div style={styles.chatWindow}>
        {messages.map((msg) => {
          const isMe = msg.username === username;
          return (
            <div key={msg.id} style={{ ...styles.messageRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={styles.bubbleWrapper}>
                {!isMe && <span style={styles.senderLabel}>{msg.username}</span>}
                <div style={{
                  ...styles.bubble,
                  background: isMe ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : '#262626',
                  color: '#ffffff'
                }}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={styles.chatInput}
          />
          <button type="submit" style={styles.sendButton} disabled={!inputMessage.trim()}>Send</button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// 3. MAIN APP ROOT ORCHESTRATOR
// ==========================================
export default function App() {
  const [activeUser, setActiveUser] = useState(null);

  return (
    <div>
      {!activeUser ? (
        <Login onLoginSuccess={(username) => setActiveUser(username)} />
      ) : (
        <ChatRoom username={activeUser} onLogout={() => setActiveUser(null)} />
      )}
    </div>
  );
}

// ==========================================
// 4. DESIGN PARADIGM STYLES
// ==========================================
const styles = {
  loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  authWrapper: { display: 'flex', flexDirection: 'column', gap: '10px', width: '350px' },
  loginCard: { width: '100%', padding: '40px', borderRadius: '1px', background: '#000000', border: '1px solid #262626', textAlign: 'center', boxSizing: 'border-box' },
  logoText: { fontFamily: 'cursive, sans-serif', fontSize: '3.2rem', color: '#ffffff', margin: '10px 0 20px 0', fontWeight: 'normal' },
  loginSubtitle: { color: '#a8a8a8', fontSize: '0.9rem', marginBottom: '20px' },
  loginInput: { width: '100%', padding: '10px', margin: '6px 0', border: '1px solid #262626', borderRadius: '3px', backgroundColor: '#121212', color: '#ffffff', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' },
  loginButton: { width: '100%', padding: '8px 0', backgroundColor: '#0095f6', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', marginTop: '15px' },
  errorBox: { backgroundColor: '#ed4956', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '15px' },
  successBox: { backgroundColor: '#2db742', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '15px' },
  toggleCard: { padding: '20px', background: '#000000', border: '1px solid #262626', textAlign: 'center' },
  toggleText: { color: '#ffffff', margin: 0, fontSize: '0.9rem' },
  toggleLink: { color: '#0095f6', fontWeight: '600', cursor: 'pointer', marginLeft: '5px' },
  
  chatContainer: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000000', color: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  chatHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #262626', backgroundColor: '#000000' },
  logoutButton: { backgroundColor: 'transparent', color: '#ed4956', border: '1px solid #262626', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'background 0.2s' },
  activeUserRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatarPlaceholder: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#313131', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', border: '1px solid #262626' },
  headerTitle: { fontWeight: '600', fontSize: '1rem' },
  headerStatus: { fontSize: '0.78rem', color: '#a8a8a8' },
  chatWindow: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' },
  messageRow: { display: 'flex', width: '100%' },
  bubbleWrapper: { display: 'flex', flexDirection: 'column', maxWidth: '65%' },
  senderLabel: { fontSize: '0.75rem', color: '#a8a8a8', marginBottom: '3px', marginLeft: '4px' },
  bubble: { padding: '11px 16px', borderRadius: '22px', fontSize: '0.92rem', lineHeight: '1.4', wordBreak: 'break-word' },
  inputArea: { padding: '16px 20px', backgroundColor: '#000000' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #262626', borderRadius: '24px', padding: '6px 16px', backgroundColor: '#000000' },
  chatInput: { flex: 1, padding: '8px 0', border: 'none', backgroundColor: 'transparent', color: '#ffffff', outline: 'none', fontSize: '0.9rem' },
  sendButton: { border: 'none', backgroundColor: 'transparent', color: '#0095f6', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', paddingLeft: '10px' }
};
