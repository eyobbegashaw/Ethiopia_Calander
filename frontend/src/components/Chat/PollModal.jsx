import React, { useState } from 'react';
import { chatAPI } from '../../services/api';
import '../styles/Chat.css';

const PollModal = ({ chatId, onClose, onPollCreated }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [duration, setDuration] = useState(60); // minutes
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [anonymous, setAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);

    const durations = [
        { value: 5, label: '5 minutes' },
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 60, label: '1 hour' },
        { value: 180, label: '3 hours' },
        { value: 1440, label: '24 hours' },
        { value: 10080, label: '7 days' }
    ];

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const createPoll = async () => {
        if (!question.trim() || options.some(opt => !opt.trim())) return;

        setLoading(true);
        try {
            const response = await chatAPI.createPoll(chatId, {
                question,
                options: options.filter(opt => opt.trim()),
                duration,
                settings: {
                    allowMultiple,
                    anonymous
                }
            });
            onPollCreated(response.data.message);
            onClose();
        } catch (error) {
            console.error('Error creating poll:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="poll-modal-overlay" onClick={onClose}>
            <div className="poll-modal-content" onClick={e => e.stopPropagation()}>
                <div className="poll-modal-header">
                    <h3><i className="fas fa-poll"></i> Create a Poll</h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="poll-form">
                    <div className="form-group">
                        <label>Question</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question..."
                            maxLength="200"
                        />
                    </div>

                    <div className="form-group">
                        <label>Options</label>
                        {options.map((option, index) => (
                            <div key={index} className="option-input">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    maxLength="100"
                                />
                                <button
                                    className="remove-option"
                                    onClick={() => removeOption(index)}
                                    disabled={options.length <= 2}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                        
                        {options.length < 10 && (
                            <button className="add-option" onClick={addOption}>
                                <i className="fas fa-plus"></i> Add Option
                            </button>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration</label>
                            <select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}>
                                {durations.map(d => (
                                    <option key={d.value} value={d.value}>
                                        {d.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="poll-settings">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={allowMultiple}
                                onChange={(e) => setAllowMultiple(e.target.checked)}
                            />
                            Allow multiple answers
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={anonymous}
                                onChange={(e) => setAnonymous(e.target.checked)}
                            />
                            Anonymous voting
                        </label>
                    </div>
                </div>

                <div className="poll-preview">
                    <h4>Preview</h4>
                    <div className="preview-card">
                        <p className="preview-question">{question || 'Your poll question will appear here'}</p>
                        <div className="preview-options">
                            {options.filter(opt => opt.trim()).map((opt, idx) => (
                                <div key={idx} className="preview-option">
                                    {opt || `Option ${idx + 1}`}
                                </div>
                            ))}
                        </div>
                        <div className="preview-footer">
                            <span>{duration} minutes</span>
                            <span>{allowMultiple ? 'Multiple answers' : 'Single answer'}</span>
                            {anonymous && <span>Anonymous</span>}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button 
                        className="create-btn" 
                        onClick={createPoll}
                        disabled={loading || !question.trim() || options.filter(opt => opt.trim()).length < 2}
                    >
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin"></i> Creating...</>
                        ) : (
                            <><i className="fas fa-poll"></i> Create Poll</>
                        )}
                    </button>
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PollModal;