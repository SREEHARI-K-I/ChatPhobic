import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api/messages';

export default function ChatRoom({ username }) {
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

    return () => socketRef.current.disconnect();
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
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.activeUserRow}>
          <div style={styles.avatarPlaceholder}>
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={styles.headerTitle}>{username}</div>
            <div style={styles.headerStatus}>Active now</div>
          </div>
        </div>
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

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000000', color: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #262626', backgroundColor: '#000000' },
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