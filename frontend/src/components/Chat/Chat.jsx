import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import PrivateChat from './PrivateChat';
import { useAuth } from '../../contexts/AuthContext';
import '../styles/Chat.css';

const Chat = () => {
    const { currentUser } = useAuth();
    const [activeChat, setActiveChat] = useState(null);
    const [activePrivateChat, setActivePrivateChat] = useState(null);
    const [view, setView] = useState('list'); // 'list', 'group', 'private'
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        // Close sidebar on mobile when chat opens
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setShowSidebar(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSelectGroup = (group) => {
        setActiveChat(group);
        setActivePrivateChat(null);
        setView('group');
        if (window.innerWidth <= 768) {
            setShowSidebar(false);
        }
    };

    const handleSelectPrivateChat = (user) => {
        setActivePrivateChat(user);
        setActiveChat(null);
        setView('private');
        if (window.innerWidth <= 768) {
            setShowSidebar(false);
        }
    };

    const handleBack = () => {
        setView('list');
        setActiveChat(null);
        setActivePrivateChat(null);
        setShowSidebar(true);
    };

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    return (
        <div className="telegram-chat-container">
            {/* Sidebar */}
            <div className={`chat-sidebar ${showSidebar ? 'visible' : 'hidden'}`}>
                <ChatList 
                    onSelectGroup={handleSelectGroup}
                    onSelectPrivateChat={handleSelectPrivateChat}
                    activeChat={activeChat}
                    activePrivateChat={activePrivateChat}
                    onCloseSidebar={() => setShowSidebar(false)}
                />
            </div>

            {/* Main Chat Area */}
            <div className="chat-main-area">
                {view === 'list' && (
                    <div className="welcome-screen">
                        <div className="welcome-content">
                            <i className="fas fa-comments welcome-icon"></i>
                            <h3>Welcome to Community Chat</h3>
                            <p>Select a group to start chatting or create your own community</p>
                        </div>
                    </div>
                )}

                {view === 'group' && activeChat && (
                    <ChatRoom 
                        group={activeChat}
                        onBack={handleBack}
                        onStartPrivateChat={handleSelectPrivateChat}
                        toggleSidebar={toggleSidebar}
                        showSidebar={showSidebar}
                    />
                )}

                {view === 'private' && activePrivateChat && (
                    <PrivateChat 
                        user={activePrivateChat}
                        onBack={handleBack}
                        toggleSidebar={toggleSidebar}
                        showSidebar={showSidebar}
                    />
                )}
            </div>
        </div>
    );
};

export default Chat;
