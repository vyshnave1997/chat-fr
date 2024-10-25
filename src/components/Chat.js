import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const socket = io('https://chat-server-production-d66e.up.railway.app');

const Chat = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [typingStatus, setTypingStatus] = useState('');

  useEffect(() => {
    socket.on('chatMessage', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('previousMessages', (previousMessages) => {
      setMessages(previousMessages);
    });

    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    socket.on('typing', ({ username, isTyping }) => {
      setTypingStatus(isTyping ? `${username} is typing...` : '');
    });

    return () => {
      socket.off('chatMessage');
      socket.off('previousMessages');
      socket.off('userList');
      socket.off('typing');
    };
  }, []);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username) {
      socket.emit('setUsername', username);
      setIsUsernameSet(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      const time = new Date().toLocaleTimeString();
      const data = { username, message, time };
      socket.emit('chatMessage', data);
      setMessage('');
      socket.emit('typing', false); // Stop typing when message is sent
    }
  };

  // Emit typing status when typing
  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', e.target.value.length > 0);
  };

  const handleRefresh = () => {
    socket.emit('refreshMessages');
  };

  useEffect(() => {
    const chatBox = document.querySelector('.message-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      {!isUsernameSet ? (
        <form onSubmit={handleUsernameSubmit} className="username-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name..."
            className="input"
          />
          <button type="submit" className="button">Set</button>
        </form>
      ) : (
        <div className="chat-box">
          <div className="chat-header">
            <h1>Chat Room</h1>
            <button onClick={handleRefresh} className="refresh-button">🔄 Refresh</button>
          </div>

          <div className="active-users">
            <h2>Active Users</h2>
            <ul>
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>

          <div className="message-box">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.type === 'status' ? 'joinmessage' :
                  msg.username === username ? 'message self' : 'message other'
                }
              >
                <span>{msg.message}</span>
                {msg.type !== 'status' && <span className="time">{msg.time}</span>}
              </div>
            ))}
          </div>

          {typingStatus && <p className="typing-indicator">{typingStatus}</p>}

          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder="Type a message"
              className="input"
            />
            <button type="submit" className="button">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
