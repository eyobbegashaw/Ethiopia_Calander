import { useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useChat = (chatId) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [sending, setSending] = useState(false);
    const pollingRef = useRef(null);
    const pageRef = useRef(1);

    // Load messages
    const loadMessages = useCallback(async (reset = false) => {
        if (!chatId) return;

        setLoading(true);
        try {
            const params = {
                limit: 50,
                page: reset ? 1 : pageRef.current
            };

            const response = await chatAPI.getMessages(chatId, params);
            
            if (reset) {
                setMessages(response.data.messages);
                pageRef.current = 2;
            } else {
                setMessages(prev => [...response.data.messages, ...prev]);
                pageRef.current++;
            }
            
            setHasMore(response.data.hasMore);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [chatId]);

    // Send message
    const sendMessage = useCallback(async (content, type = 'text', attachments = []) => {
        if (!content.trim() && attachments.length === 0) return;

        setSending(true);
        try {
            const response = await chatAPI.sendMessage(chatId, {
                content,
                contentType: type,
                attachments
            });

            setMessages(prev => [...prev, response.data.message]);
            return response.data.message;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message');
            throw err;
        } finally {
            setSending(false);
        }
    }, [chatId]);

    // Send image
    const sendImage = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        setSending(true);
        try {
            const response = await chatAPI.sendImage(chatId, formData);
            setMessages(prev => [...prev, response.data.message]);
            return response.data.message;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send image');
            throw err;
        } finally {
            setSending(false);
        }
    }, [chatId]);

    // Add reaction
    const addReaction = useCallback(async (messageId, reaction) => {
        try {
            await chatAPI.addReaction(chatId, messageId, { reaction });
            
            // Update local state
            setMessages(prev => prev.map(msg => {
                if (msg._id === messageId) {
                    const reactions = msg.reactions || [];
                    const existingIndex = reactions.findIndex(r => r.user === currentUser?.id);
                    
                    if (existingIndex >= 0) {
                        reactions[existingIndex].reaction = reaction;
                    } else {
                        reactions.push({
                            user: currentUser?.id,
                            reaction,
                            createdAt: new Date()
                        });
                    }
                    
                    return { ...msg, reactions };
                }
                return msg;
            }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add reaction');
        }
    }, [chatId, currentUser]);

    // Delete message
    const deleteMessage = useCallback(async (messageId) => {
        try {
            await chatAPI.deleteMessage(chatId, messageId);
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete message');
        }
    }, [chatId]);

    // Edit message
    const editMessage = useCallback(async (messageId, newContent) => {
        try {
            const response = await chatAPI.editMessage(chatId, messageId, { content: newContent });
            
            setMessages(prev => prev.map(msg => 
                msg._id === messageId 
                    ? { ...msg, content: newContent, isEdited: true }
                    : msg
            ));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to edit message');
        }
    }, [chatId]);

    // Mark as read
    const markAsRead = useCallback(async (messageId) => {
        try {
            await chatAPI.markAsRead(chatId, messageId);
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, [chatId]);

    // Start polling
    useEffect(() => {
        if (!chatId) return;

        loadMessages(true);
        
        pollingRef.current = setInterval(() => {
            loadMessages(false);
        }, 5000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [chatId, loadMessages]);

    return {
        messages,
        loading,
        error,
        hasMore,
        sending,
        loadMessages,
        sendMessage,
        sendImage,
        addReaction,
        deleteMessage,
        editMessage,
        markAsRead
    };
};