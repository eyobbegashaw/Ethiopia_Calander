import React, { useState } from 'react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../styles/Chat.css';

const CreateGroup = ({ onClose, onGroupCreated, remainingSlots }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'general',
        tags: '',
        settings: {
            isPrivate: false,
            requireApproval: true,
            allowMemberPolls: true,
            allowMemberQuizzes: true
        }
    });
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (remainingSlots <= 0) {
            setError(`You can only create up to 3 groups. You have ${remainingSlots} slots remaining.`);
            return;
        }

        if (!formData.name.trim()) {
            setError('Group name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name.trim());
            data.append('description', formData.description.trim());
            data.append('category', formData.category);
            
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
            data.append('tags', JSON.stringify(tagsArray));
            data.append('settings', JSON.stringify(formData.settings));
            
            if (avatar) {
                data.append('avatar', avatar);
            }
            
            const response = await chatAPI.createGroup(data);
            
            // The server should automatically add the creator as a member
            if (response.data.group) {
                alert('Group created successfully! You are now a member.');
                onGroupCreated(response.data.group);
                onClose();
            } else {
                throw new Error('No group data received');
            }
        } catch (err) {
            console.error('Error creating group:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create group';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Avatar image must be less than 5MB');
                return;
            }
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="create-group-modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Group</h2>
                    <button className="close-modal" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}
                
                <div className="group-limit-warning">
                    <i className="fas fa-info-circle"></i>
                    <span>You can create up to 3 groups. {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining.</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Avatar Upload */}
                    <div className="form-group avatar-upload">
                        <label>Group Avatar (Optional)</label>
                        <div className="avatar-preview" onClick={() => document.getElementById('avatar-input').click()}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Group avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <i className="fas fa-camera"></i>
                                    <span>Upload</span>
                                </div>
                            )}
                        </div>
                        <input
                            id="avatar-input"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Group Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                            placeholder="Enter group name"
                            maxLength="50"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe the purpose of your group"
                            rows="3"
                            maxLength="200"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="general">General Discussion</option>
                            <option value="biblical">Biblical Study</option>
                            <option value="history">Church History</option>
                            <option value="prayer">Prayer Group</option>
                            <option value="study">Scripture Study</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Tags (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={e => setFormData({...formData, tags: e.target.value})}
                            placeholder="e.g., bible, prayer, study"
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.settings.isPrivate}
                                onChange={e => setFormData({
                                    ...formData,
                                    settings: {
                                        ...formData.settings,
                                        isPrivate: e.target.checked
                                    }
                                })}
                            />
                            Private Group (members need approval to join)
                        </label>
                    </div>

                    {formData.settings.isPrivate && (
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.requireApproval}
                                    onChange={e => setFormData({
                                        ...formData,
                                        settings: {
                                            ...formData.settings,
                                            requireApproval: e.target.checked
                                        }
                                    })}
                                />
                                Require admin approval for new members
                            </label>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.settings.allowMemberPolls}
                                onChange={e => setFormData({
                                    ...formData,
                                    settings: {
                                        ...formData.settings,
                                        allowMemberPolls: e.target.checked
                                    }
                                })}
                            />
                            Allow members to create polls
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.settings.allowMemberQuizzes}
                                onChange={e => setFormData({
                                    ...formData,
                                    settings: {
                                        ...formData.settings,
                                        allowMemberQuizzes: e.target.checked
                                    }
                                })}
                            />
                            Allow members to share quizzes
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" disabled={loading || remainingSlots <= 0}>
                            {loading ? (
                                <><i className="fas fa-spinner fa-spin"></i> Creating...</>
                            ) : (
                                <><i className="fas fa-plus-circle"></i> Create Group</>
                            )}
                        </button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroup;
