import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Chat.css'; // Import the updated WhatsApp-style CSS

const socket = io('https://chat-server-production-d66e.up.railway.app'); // Connect to the server

const Chat = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isUsernameSet, setIsUsernameSet] = useState(false);

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

    return () => {
      socket.off('chatMessage');
      socket.off('previousMessages');
      socket.off('userList');
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
    }
  };

  const handleRefresh = () => {
    socket.emit('refreshMessages'); // Emit event to refresh messages from database
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
            <h1>Lets Talk !</h1>
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
              <div key={index} className={`message ${msg.username === username ? 'self' : 'other'}`}>
                <span>{msg.message}</span>
                <span className="time">{msg.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
