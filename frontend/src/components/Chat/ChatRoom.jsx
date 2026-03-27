import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import PollModal from './PollModal';
import QuizModal from './QuizModal';
import MessageContextMenu from './MessageContextMenu';
import '../styles/Chat.css';

const ChatRoom = ({ group, onBack, onStartPrivateChat, toggleSidebar, showSidebar }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [groupInfo, setGroupInfo] = useState(group);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const contextMenuRef = useRef(null);

    useEffect(() => {
        if (group) {
            loadMessages();
            loadGroupInfo();
            const interval = setInterval(loadMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [group]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setShowContextMenu(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const loadMessages = async () => {
        const targetId = group.chatId || group._id;
        if (!targetId) return;

        try {
            const response = await chatAPI.getMessages(targetId);
            setMessages(response.data.messages);
        } catch (err) {
            console.error('Error loading messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadGroupInfo = async () => {
        try {
            const response = await chatAPI.getGroupInfo(group._id);
            setGroupInfo(response.data.group);
        } catch (err) {
            console.error('Error loading group info:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const targetId = group.chatId || group._id;
        setSending(true);
        try {
            const response = await chatAPI.sendMessage(targetId, {
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

    const handleEditMessage = async (messageId, newContent) => {
        try {
            const response = await chatAPI.editMessage(group.chatId || group._id, messageId, {
                content: newContent
            });
            setMessages(prev => prev.map(msg => 
                msg._id === messageId ? { ...msg, content: newContent, isEdited: true, editedAt: new Date() } : msg
            ));
            setEditingMessage(null);
        } catch (err) {
            console.error('Error editing message:', err);
            alert('Failed to edit message');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        
        try {
            await chatAPI.deleteMessage(group.chatId || group._id, messageId);
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        } catch (err) {
            console.error('Error deleting message:', err);
            alert('Failed to delete message');
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm(`Are you sure you want to leave "${group.name}"?`)) return;
        
        try {
            await chatAPI.leaveGroup(group._id);
            onBack();
        } catch (err) {
            console.error('Error leaving group:', err);
            alert('Failed to leave group');
        }
    };

    const handleReaction = async (messageId, reaction) => {
        try {
            await chatAPI.addReaction(group.chatId || group._id, messageId, { reaction });
            loadMessages();
        } catch (err) {
            console.error('Error adding reaction:', err);
        }
    };

    const handleContextMenu = (e, message) => {
        e.preventDefault();
        // Only allow editing/deleting own messages
        if (message.sender._id === currentUser?.id) {
            setShowContextMenu({
                x: e.clientX,
                y: e.clientY,
                messageId: message._id,
                content: message.content
            });
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
            <div 
                key={msg._id} 
                className={`message ${isOwnMessage ? 'own' : ''}`}
                onContextMenu={(e) => handleContextMenu(e, msg)}
            >
                {!isOwnMessage && (
                    <div 
                        className="message-sender-avatar"
                        onClick={() => onStartPrivateChat(msg.sender)}
                        title={`Start private chat with ${msg.sender.username}`}
                    >
                        {msg.sender.avatar ? (
                            <img src={msg.sender.avatar} alt={msg.sender.username} />
                        ) : (
                            <div className="avatar-placeholder small">
                                {msg.sender.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}
                <div className="message-content-wrapper">
                    {!isOwnMessage && (
                        <div 
                            className="sender-name"
                            onClick={() => onStartPrivateChat(msg.sender)}
                        >
                            {msg.sender.username}
                        </div>
                    )}
                    
                    <div className="message-bubble">
                        {editingMessage === msg._id ? (
                            <div className="edit-message-form">
                                <input
                                    type="text"
                                    defaultValue={msg.content}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleEditMessage(msg._id, e.target.value);
                                        }
                                    }}
                                    autoFocus
                                />
                                <button onClick={() => setEditingMessage(null)}>Cancel</button>
                            </div>
                        ) : (
                            <div className="message-text">{msg.content}</div>
                        )}
                        
                        {msg.isEdited && (
                            <span className="edited-badge">(edited)</span>
                        )}
                    </div>

                    <div className="message-footer">
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                        {msg.reactions?.length > 0 && (
                            <div className="message-reactions">
                                {Object.entries(
                                    msg.reactions.reduce((acc, r) => {
                                        acc[r.reaction] = (acc[r.reaction] || 0) + 1;
                                        return acc;
                                    }, {})
                                ).map(([reaction, count]) => (
                                    <button
                                        key={reaction}
                                        className="reaction-badge"
                                        onClick={() => handleReaction(msg._id, reaction)}
                                    >
                                        {reaction} {count}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="chat-room telegram-room">
            {/* Header */}
            <div className="chat-room-header">
                <div className="header-left">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        <i className={`fas fa-${showSidebar ? 'times' : 'bars'}`}></i>
                    </button>
                    <button className="back-btn-mobile" onClick={onBack}>
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div className="group-info" onClick={() => setShowGroupInfo(!showGroupInfo)}>
                        <div className="group-avatar">
                            {groupInfo.avatar ? (
                                <img src={groupInfo.avatar} alt={groupInfo.name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {groupInfo.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="info-text">
                            <h3>{groupInfo.name}</h3>
                            <p>{groupInfo.memberCount} members</p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <button className="action-btn" onClick={() => setShowPollModal(true)}>
                        <i className="fas fa-poll"></i>
                    </button>
                    <button className="action-btn" onClick={() => setShowQuizModal(true)}>
                        <i className="fas fa-question-circle"></i>
                    </button>
                    <button className="action-btn" onClick={() => fileInputRef.current.click()}>
                        <i className="fas fa-paperclip"></i>
                    </button>
                    <button className="action-btn danger" onClick={handleLeaveGroup}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                        // Handle file upload
                        console.log('File selected:', e.target.files[0]);
                    }}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Group Info Panel */}
            {showGroupInfo && (
                <div className="group-info-panel">
                    <div className="info-content">
                        <div className="group-avatar large">
                            {groupInfo.avatar ? (
                                <img src={groupInfo.avatar} alt={groupInfo.name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {groupInfo.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h3>{groupInfo.name}</h3>
                        <p className="group-description">{groupInfo.description || 'No description'}</p>
                        <div className="group-stats">
                            <div className="stat">
                                <i className="fas fa-users"></i>
                                <span>{groupInfo.memberCount} Members</span>
                            </div>
                            <div className="stat">
                                <i className="fas fa-calendar"></i>
                                <span>Created {new Date(groupInfo.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button className="close-info" onClick={() => setShowGroupInfo(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="messages-container">
                {loading ? (
                    <div className="loading-messages">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                ) : (
                    <>
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
                    placeholder="Type a message..."
                    className="message-input"
                />
                <button type="submit" disabled={sending || !newMessage.trim()}>
                    <i className={`fas ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                </button>
            </form>

            {/* Context Menu */}
            {showContextMenu && (
                <div 
                    ref={contextMenuRef}
                    className="message-context-menu"
                    style={{ top: showContextMenu.y, left: showContextMenu.x }}
                >
                    <button onClick={() => {
                        setEditingMessage(showContextMenu.messageId);
                        setShowContextMenu(null);
                    }}>
                        <i className="fas fa-edit"></i> Edit
                    </button>
                    <button onClick={() => {
                        handleDeleteMessage(showContextMenu.messageId);
                        setShowContextMenu(null);
                    }}>
                        <i className="fas fa-trash"></i> Delete
                    </button>
                </div>
            )}

            {/* Modals */}
            {showPollModal && (
                <PollModal 
                    chatId={group.chatId || group._id}
                    onClose={() => setShowPollModal(false)}
                    onPollCreated={loadMessages}
                />
            )}

            {showQuizModal && (
                <QuizModal 
                    chatId={group.chatId || group._id}
                    onClose={() => setShowQuizModal(false)}
                    onQuizSent={loadMessages}
                />
            )}
        </div>
    );
};

export default ChatRoom;
