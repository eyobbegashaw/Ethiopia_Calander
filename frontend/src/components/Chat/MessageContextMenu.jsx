import React from 'react';
import '../styles/Chat.css';

const MessageContextMenu = ({ x, y, onEdit, onDelete, onClose }) => {
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.context-menu')) {
                onClose();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [onClose]);

    return (
        <div className="context-menu" style={{ top: y, left: x }}>
            <button onClick={onEdit}>
                <i className="fas fa-edit"></i> Edit
            </button>
            <button onClick={onDelete}>
                <i className="fas fa-trash"></i> Delete
            </button>
        </div>
    );
};

export default MessageContextMenu;
