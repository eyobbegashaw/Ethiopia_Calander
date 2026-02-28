import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import '../styles/Chat.css';

const Chat = () => {
    const [activeChat, setActiveChat] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'room'

    const handleSelectChat = (group) => {
        setActiveChat(group);
        setView('room');
    };

    const handleBack = () => {
        setView('list');
        setActiveChat(null);
    };

    return (
        <section className="card chat-section">
            <h2 className="section-title">
                <i className="fas fa-comments"></i> Community Chat
            </h2>
            
            {view === 'list' ? (
                <ChatList onSelectChat={handleSelectChat} />
            ) : (
                <ChatRoom 
                    group={activeChat} 
                    onBack={handleBack}
                />
            )}
        </section>
    );
};

export default Chat;