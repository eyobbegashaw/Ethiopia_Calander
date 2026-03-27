import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../styles/Chat.css';

const PrivateChat = ({ user, onBack, toggleSidebar, showSidebar }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [chatId, setChatId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            initializeChat();
            const interval = setInterval(loadMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            const response = await chatAPI.getOrCreatePrivateChat(user._id);
            setChatId(response.data.chat._id);
            setMessages(response.data.chat.messages || []);
        } catch (err) {
            console.error('Error initializing private chat:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        if (!chatId) return;
        
        try {
            const response = await chatAPI.getMessages(chatId);
            setMessages(response.data.messages);
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !chatId) return;

        setSending(true);
        try {
            const response = await chatAPI.sendMessage(chatId, {
                content: newMessage,
                contentType: 'text'
            });
            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString();
    };

    const renderMessage = (msg) => {
        const isOwnMessage = msg.sender._id === currentUser?.id;

        return (
            <div key={msg._id} className={`message private-message ${isOwnMessage ? 'own' : ''}`}>
                {!isOwnMessage && (
                    <div className="message-sender-avatar">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.username} />
                        ) : (
                            <div className="avatar-placeholder small">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}
                <div className="message-content-wrapper">
                    {!isOwnMessage && (
                        <div className="sender-name">{user.username}</div>
                    )}
                    <div className="message-bubble">
                        <div className="message-text">{msg.content}</div>
                    </div>
                    <div className="message-footer">
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="chat-room private-chat-room">
            {/* Header */}
            <div className="chat-room-header">
                <div className="header-left">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        <i className={`fas fa-${showSidebar ? 'times' : 'bars'}`}></i>
                    </button>
                    <button className="back-btn-mobile" onClick={onBack}>
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div className="user-info">
                        <div className="user-avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.username} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="info-text">
                            <h3>{user.username}</h3>
                            <p>Private chat</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
                {loading ? (
                    <div className="loading-messages">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                ) : (
                    <>
                        {messages.length === 0 && (
                            <div className="no-messages">
                                <i className="fas fa-comment-dots"></i>
                                <p>No messages yet. Start a conversation!</p>
                            </div>
                        )}
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Form */}
            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${user.username}...`}
                    className="message-input"
                />
                <button type="submit" disabled={sending || !newMessage.trim()}>
                    <i className={`fas ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                </button>
            </form>
        </div>
    );
};

export default PrivateChat;
