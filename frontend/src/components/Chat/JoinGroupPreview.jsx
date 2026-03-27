import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import '../styles/Chat.css';

const JoinGroupPreview = ({ group, onClose, onJoin }) => {
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        loadRecentMessages();
    }, [group]);

    useEffect(() => {
        scrollToBottom();
    }, [recentMessages]);

    const loadRecentMessages = async () => {
        try {
            const response = await chatAPI.getGroupPreviewMessages(group._id);
            setRecentMessages(response.data.messages || []);
        } catch (err) {
            console.error('Error loading preview messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="join-preview-overlay" onClick={onClose}>
            <div className="join-preview-container" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="preview-header">
                    <button className="back-btn" onClick={onClose}>
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div className="group-info">
                        <div className="group-avatar large">
                            {group.avatar ? (
                                <img src={group.avatar} alt={group.name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {group.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="info-text">
                            <h2>{group.name}</h2>
                            <p>{group.memberCount} members</p>
                            {group.description && <p className="description">{group.description}</p>}
                        </div>
                    </div>
                </div>

                {/* Messages Preview - Read Only */}
                <div className="preview-messages">
                    <div className="preview-badge">
                        <i className="fas fa-eye"></i> Preview Mode - Join to participate
                    </div>
                    
                    {loading ? (
                        <div className="loading-messages">
                            <i className="fas fa-spinner fa-spin"></i> Loading messages...
                        </div>
                    ) : (
                        <div className="messages-list">
                            {recentMessages.map(msg => (
                                <div key={msg._id} className="preview-message">
                                    <div className="message-avatar">
                                        {msg.sender?.avatar ? (
                                            <img src={msg.sender.avatar} alt={msg.sender.username} />
                                        ) : (
                                            <div className="avatar-placeholder small">
                                                {msg.sender?.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            <span className="sender-name">{msg.sender?.username}</span>
                                            <span className="message-time">{formatTime(msg.createdAt)}</span>
                                        </div>
                                        <div className="message-text">{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Fixed Join Button */}
                <div className="preview-footer">
                    <button className="join-group-btn" onClick={onJoin}>
                        <i className="fas fa-sign-in-alt"></i> Join Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinGroupPreview;
