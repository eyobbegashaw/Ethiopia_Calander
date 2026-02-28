import React, { useState } from 'react';
import { chatAPI } from '../../services/api';
import '../styles/Chat.css';

const CreateGroup = ({ onClose, onGroupCreated }) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };
            
            await chatAPI.createGroup(data);
            onGroupCreated();
            onClose();
        } catch (err) {
            console.error('Error creating group:', err);
            alert('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-group-modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Create New Group</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Group Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                            placeholder="Enter group name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe the purpose of your group"
                            rows="3"
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
                        <label>
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
                            Private Group (requires approval to join)
                        </label>
                    </div>

                    <div className="form-group">
                        <label>
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

                    <div className="form-group">
                        <label>
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
                        <label>
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
                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Group'}
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