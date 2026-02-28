import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFont } from '../contexts/FontContext';
import './styles/UserPanel.css';

const UserPanel = () => {
    const { currentUser, logout, userHistory } = useAuth();
    const { decreaseFontSize, resetFontSize, increaseFontSize } = useFont();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        generateNotifications();
    }, []);

    const generateNotifications = () => {
        // Sample notifications
        const sampleNotifications = [
            {
                date: "Today - መስከረም 5",
                content: "Today is the commemoration of St. Virgin Mary."
            },
            {
                date: "Tomorrow - መስከረም 6",
                content: "No major saint commemorations tomorrow."
            },
            {
                date: "Upcoming - መስከረም 17",
                content: "Meskel (Finding of the True Cross) is coming soon!"
            }
        ];
        setNotifications(sampleNotifications);
    };

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`user-panel ${isOpen ? 'active' : ''}`} id="user-panel">
            <div className="user-panel-header">
                <h2>User Settings</h2>
                <button className="close-panel" onClick={togglePanel}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <div className="user-info">
                <div className="user-avatar-large">
                    {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.username} />
                    ) : (
                        <i className="fas fa-user"></i>
                    )}
                </div>
                <div className="user-details">
                    <h3>{currentUser?.username || 'Guest User'}</h3>
                    <p>{currentUser?.email || 'Not logged in'}</p>
                </div>
            </div>
            
            <div className="panel-section">
                <h4><i className="fas fa-cog"></i> Settings</h4>
                <div className="font-size-controls">
                    <label>Font Size:</label>
                    <button className="font-size-btn" onClick={decreaseFontSize}>A-</button>
                    <button className="font-size-btn" onClick={resetFontSize}>A</button>
                    <button className="font-size-btn" onClick={increaseFontSize}>A+</button>
                </div>
            </div>
            
            <div className="panel-section">
                <h4><i className="fas fa-bell"></i> Notifications</h4>
                <div className="notifications-list">
                    {notifications.map((notification, index) => (
                        <div key={index} className="notification-item">
                            <div className="notification-date">{notification.date}</div>
                            <div className="notification-content">{notification.content}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            {currentUser && (
                <div className="panel-section">
                    <h4><i className="fas fa-history"></i> Recent Activity</h4>
                    <div className="history-list">
                        {userHistory[currentUser.id]?.slice(0, 5).map((item, index) => (
                            <div key={index} className="history-item">
                                <div className="history-action">{item.action}</div>
                                <div className="history-time">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="panel-section">
                {currentUser ? (
                    <button className="auth-btn" onClick={logout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                ) : (
                    <button className="auth-btn" onClick={() => {
                        togglePanel();
                        document.getElementById('auth-modal')?.classList.add('active');
                    }}>
                        <i className="fas fa-sign-in-alt"></i> Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserPanel;