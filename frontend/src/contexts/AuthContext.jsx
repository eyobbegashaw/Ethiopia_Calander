import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI, historyAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userHistory, setUserHistory] = useState([]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Check for OAuth redirect
    useEffect(() => {
        const handleOAuthRedirect = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const userParam = urlParams.get('user');
            
            if (token && userParam) {
                try {
                    const user = JSON.parse(decodeURIComponent(userParam));
                    localStorage.setItem('token', token);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    setToken(token);
                    setCurrentUser(user);
                    setShowAuthModal(false);
                    
                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    console.error('Error parsing OAuth user data:', error);
                }
            }
        };

        handleOAuthRedirect();
    }, []);

    // Check if user is logged in on initial load
    useEffect(() => {
        const loadUser = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('currentUser');

            if (savedToken && savedUser) {
                try {
                    // Verify token with backend
                    const response = await authAPI.getMe();
                    setCurrentUser(response.data.user);
                    
                    // Load user history
                    await loadUserHistory();
                    
                    setShowAuthModal(false);
                } catch (error) {
                    console.error('Error loading user:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    setToken(null);
                    setShowAuthModal(true);
                }
            } else {
                setShowAuthModal(true);
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const loadUserHistory = async () => {
        try {
            const response = await historyAPI.getHistory({ limit: 50 });
            setUserHistory(response.data.history);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const login = async (username, password) => {
        setError(null);
        try {
            const response = await authAPI.login({ username, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            setToken(token);
            setCurrentUser(user);
            await loadUserHistory();
            setShowAuthModal(false);
            
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const signup = async (userData) => {
        setError(null);
        try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            setToken(token);
            setCurrentUser(user);
            setShowAuthModal(false);
            
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Signup failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            setToken(null);
            setCurrentUser(null);
            setUserHistory([]);
            setShowAuthModal(true);
        }
    };

    const googleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };

    const saveToHistory = async (type, action, metadata = {}) => {
        if (!currentUser) return;

        try {
            await historyAPI.saveHistory({ type, action, metadata });
            await loadUserHistory();
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    };

    const updateProfile = async (updates) => {
        try {
            const response = await userAPI.updateProfile(updates);
            setCurrentUser(response.data.user);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed';
            return { success: false, error: message };
        }
    };

    const updateAvatar = async (avatar) => {
        try {
            const response = await userAPI.updateAvatar({ avatar });
            setCurrentUser(response.data.user);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Avatar update failed';
            return { success: false, error: message };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            await authAPI.changePassword({ currentPassword, newPassword });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Password change failed';
            return { success: false, error: message };
        }
    };

    const clearHistory = async () => {
        try {
            await historyAPI.clearHistory();
            setUserHistory([]);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Clear history failed';
            return { success: false, error: message };
        }
    };

    const refreshToken = async () => {
        try {
            const response = await authAPI.refreshToken();
            const { token: newToken } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            return { success: true };
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return { success: false };
        }
    };

    const value = {
        currentUser,
        userHistory,
        showAuthModal,
        setShowAuthModal,
        login,
        signup,
        logout,
        googleLogin,
        saveToHistory,
        updateProfile,
        updateAvatar,
        changePassword,
        clearHistory,
        refreshToken,
        loading,
        error,
        isAuthenticated: !!currentUser,
        token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};