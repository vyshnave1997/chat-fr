import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import './Chat.css'; // Import the updated WhatsApp-style CSS

const socket = io('http://localhost:5000'); // Connect to the server

const Chat = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    socket.on('chatMessage', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('chatMessage');
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

  const onEmojiClick = (event, emojiObject) => {
    setMessage(message + emojiObject.emoji);
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
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-button">😊</button>
            <button type="submit" className="button">▶</button>
          </form>

          {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} className="emoji-picker" />}
        </div>
      )}
    </div>
  );
};

export default Chat;
