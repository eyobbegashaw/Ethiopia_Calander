import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CreateGroup from './CreateGroup';
import JoinGroupPreview from './JoinGroupPreview';
import '../styles/Chat.css';

const ChatList = ({ onSelectGroup, onSelectPrivateChat, activeChat, activePrivateChat, onCloseSidebar }) => {
    const { currentUser } = useAuth();
    const [groups, setGroups] = useState([]);
    const [privateChats, setPrivateChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showJoinPreview, setShowJoinPreview] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [canCreateGroup, setCanCreateGroup] = useState(true);
    const [groupCount, setGroupCount] = useState(0);
    const [joiningGroupId, setJoiningGroupId] = useState(null);

    useEffect(() => {
        loadGroups();
        loadPrivateChats();
        if (currentUser) {
            checkGroupCreationLimit();
        }
    }, [currentUser]);

    const loadGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await chatAPI.getGroups();
            // Process groups to add isMember flag
            const processedGroups = response.data.groups.map(group => ({
                ...group,
                isMember: group.isMember || false,
                pendingRequest: group.pendingRequest || false
            }));
            setGroups(processedGroups);
        } catch (err) {
            console.error('Error loading groups:', err);
            setError('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    const loadPrivateChats = async () => {
        if (!currentUser) return;
        try {
            const response = await chatAPI.getPrivateChats();
            setPrivateChats(response.data.chats || []);
        } catch (err) {
            console.error('Error loading private chats:', err);
        }
    };

    const checkGroupCreationLimit = async () => {
        try {
            const response = await chatAPI.getUserGroupCount();
            setGroupCount(response.data.count);
            setCanCreateGroup(response.data.count < 3);
        } catch (err) {
            console.error('Error checking group limit:', err);
        }
    };

    // Handle group click - if member, go directly to chat, else show preview
    const handleGroupClick = (group) => {
        if (group.isMember) {
            // Already a member - go directly to chat
            onSelectGroup(group);
            if (window.innerWidth <= 768) {
                onCloseSidebar();
            }
        } else {
            // Not a member - show join preview
            setShowJoinPreview(group);
            if (window.innerWidth <= 768) {
                onCloseSidebar();
            }
        }
    };

    const handleJoinGroup = async (groupId) => {
        if (joiningGroupId) return;
        
        setJoiningGroupId(groupId);
        try {
            const response = await chatAPI.joinGroup(groupId);
            
            if (response.data.pending) {
                alert('Join request sent to admin! You will be notified when approved.');
                setShowJoinPreview(null);
                await loadGroups(); // Reload to update pending status
            } else if (response.data.group) {
                // Successfully joined
                const joinedGroup = response.data.group;
                await loadGroups(); // Reload groups to update membership status
                setShowJoinPreview(null);
                // Select the newly joined group
                onSelectGroup(joinedGroup);
                alert('Successfully joined the group!');
            }
        } catch (err) {
            console.error('Error joining group:', err);
            const errorMessage = err.response?.data?.message || 'Failed to join group';
            
            if (errorMessage === 'Already a member') {
                // If already a member, reload groups and open the group
                await loadGroups();
                const group = groups.find(g => g._id === groupId);
                if (group) {
                    setShowJoinPreview(null);
                    onSelectGroup(group);
                }
            } else {
                alert(errorMessage);
            }
        } finally {
            setJoiningGroupId(null);
        }
    };

    const handleCreateGroupSuccess = (newGroup) => {
        loadGroups();
        checkGroupCreationLimit();
        setShowCreateGroup(false);
        // Auto-select the newly created group
        if (newGroup) {
            onSelectGroup(newGroup);
        }
    };

    const filteredGroups = groups.filter(group => {
        if (filter === 'my' && !group.isMember) return false;
        if (filter === 'public' && group.settings?.isPrivate) return false;
        if (searchTerm) {
            return group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   group.description?.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
    });

    // Separate groups into "My Groups" and "Other Groups"
    const myGroups = filteredGroups.filter(group => group.isMember);
    const otherGroups = filteredGroups.filter(group => !group.isMember && !group.pendingRequest);

    return (
        <>
            <div className="chat-list-container">
                <div className="chat-list-header">
                    <div className="header-left">
                        <i className="fas fa-comments"></i>
                        <h2>Chats</h2>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="create-group-btn"
                            onClick={() => setShowCreateGroup(true)}
                            disabled={!canCreateGroup}
                            title={!canCreateGroup ? `You can only create up to 3 groups (currently have ${groupCount}/3)` : 'Create new group'}
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <div className="chat-filters">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-tabs">
                        <button 
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={filter === 'my' ? 'active' : ''}
                            onClick={() => setFilter('my')}
                        >
                            My Groups
                        </button>
                        <button 
                            className={filter === 'public' ? 'active' : ''}
                            onClick={() => setFilter('public')}
                        >
                            Public
                        </button>
                    </div>
                </div>

                {/* Private Chats Section */}
                {privateChats.length > 0 && filter === 'all' && (
                    <div className="private-chats-section">
                        <h3 className="section-header">
                            <i className="fas fa-user-friends"></i> Private Messages
                        </h3>
                        <div className="private-chats-list">
                            {privateChats.map(chat => (
                                <div 
                                    key={chat._id} 
                                    className={`private-chat-item ${activePrivateChat?._id === chat.user._id ? 'active' : ''}`}
                                    onClick={() => onSelectPrivateChat(chat.user)}
                                >
                                    <div className="avatar">
                                        {chat.user.avatar ? (
                                            <img src={chat.user.avatar} alt={chat.user.username} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {chat.user.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="chat-info">
                                        <h4>{chat.user.username}</h4>
                                        <p className="last-message">{chat.lastMessage?.content || 'No messages yet'}</p>
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <div className="unread-badge">{chat.unreadCount}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* My Groups Section - Direct access for members */}
                {myGroups.length > 0 && (filter === 'all' || filter === 'my') && (
                    <div className="groups-section">
                        <h3 className="section-header">
                            <i className="fas fa-star"></i> Your Communities
                        </h3>
                        <div className="groups-list">
                            {myGroups.map(group => (
                                <div 
                                    key={group._id} 
                                    className={`group-item member-group ${activeChat?._id === group._id ? 'active' : ''}`}
                                    onClick={() => handleGroupClick(group)}
                                >
                                    <div className="group-avatar">
                                        {group.avatar ? (
                                            <img src={group.avatar} alt={group.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {group.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="group-info">
                                        <div className="group-name-row">
                                            <h4>{group.name}</h4>
                                            {group.settings?.isPrivate && (
                                                <i className="fas fa-lock private-icon" title="Private Group"></i>
                                            )}
                                            <span className="member-badge">
                                                <i className="fas fa-check-circle"></i> Member
                                            </span>
                                        </div>
                                        <p className="group-description">{group.description}</p>
                                        <div className="group-meta">
                                            <span><i className="fas fa-users"></i> {group.memberCount}</span>
                                            <span><i className="fas fa-comment"></i> {group.messageCount || 0}</span>
                                            {group.unreadCount > 0 && (
                                                <span className="unread-indicator">
                                                    <i className="fas fa-circle"></i> {group.unreadCount} unread
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="group-actions">
                                        <button 
                                            className="chat-btn"
                                            onClick={() => handleGroupClick(group)}
                                        >
                                            <i className="fas fa-comments"></i> Open Chat
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Groups Section - Need to join */}
                {otherGroups.length > 0 && (filter === 'all' || filter === 'public') && (
                    <div className="groups-section">
                        <h3 className="section-header">
                            <i className="fas fa-globe"></i> Discover Communities
                        </h3>
                        <div className="groups-list">
                            {otherGroups.map(group => (
                                <div 
                                    key={group._id} 
                                    className={`group-item discover-group`}
                                >
                                    <div className="group-avatar">
                                        {group.avatar ? (
                                            <img src={group.avatar} alt={group.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {group.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="group-info">
                                        <div className="group-name-row">
                                            <h4>{group.name}</h4>
                                            {group.settings?.isPrivate && (
                                                <i className="fas fa-lock private-icon" title="Private Group"></i>
                                            )}
                                        </div>
                                        <p className="group-description">{group.description}</p>
                                        <div className="group-meta">
                                            <span><i className="fas fa-users"></i> {group.memberCount}</span>
                                            <span><i className="fas fa-comment"></i> {group.messageCount || 0}</span>
                                        </div>
                                    </div>
                                    <div className="group-actions">
                                        <button 
                                            className="join-btn"
                                            onClick={() => handleGroupClick(group)}
                                            disabled={joiningGroupId === group._id}
                                        >
                                            {joiningGroupId === group._id ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Joining...</>
                                            ) : (
                                                <><i className="fas fa-sign-in-alt"></i> Join</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="chat-loading">
                        <i className="fas fa-spinner fa-spin"></i> Loading groups...
                    </div>
                )}

                {/* No Groups State */}
                {!loading && filteredGroups.length === 0 && (
                    <div className="no-groups">
                        <i className="fas fa-comments"></i>
                        <p>No groups found</p>
                        {canCreateGroup && (
                            <button 
                                className="create-first-btn"
                                onClick={() => setShowCreateGroup(true)}
                            >
                                Create your first group
                            </button>
                        )}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="chat-error">
                        <i className="fas fa-exclamation-circle"></i> {error}
                        <button onClick={loadGroups} className="retry-btn">
                            Retry
                        </button>
                    </div>
                )}
            </div>

            {showCreateGroup && (
                <CreateGroup 
                    onClose={() => setShowCreateGroup(false)}
                    onGroupCreated={handleCreateGroupSuccess}
                    remainingSlots={3 - groupCount}
                />
            )}

            {showJoinPreview && (
                <JoinGroupPreview 
                    group={showJoinPreview}
                    onClose={() => setShowJoinPreview(null)}
                    onJoin={() => handleJoinGroup(showJoinPreview._id)}
                    joining={joiningGroupId === showJoinPreview._id}
                />
            )}
        </>
    );
};

export default ChatList;
