import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 60000, // Increased from 10000 to 60000 (60 seconds)
    withCredentials: true // Important for cookies/session
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (import.meta.env.DEV) {
            console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`API Response: ${response.config.url}`, response.data);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle timeout errors specifically
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error.message);
            return Promise.reject({
                ...error,
                message: 'The request took too long to complete. Please try again.'
            });
        }
        
        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh token
                const response = await authAPI.refreshToken();
                const { token } = response.data;
                
                localStorage.setItem('token', token);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Request error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh-token'),
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
    changePassword: (data) => api.put('/auth/change-password', data)
};

// User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    updateAvatar: (avatar) => api.put('/users/avatar', avatar),
    getStats: () => api.get('/users/stats'),
    getFriends: () => api.get('/users/friends'),
    addFriend: (userId) => api.post('/users/friends/request', { userId }),
    acceptFriend: (userId) => api.post(`/users/friends/accept/${userId}`),
    rejectFriend: (userId) => api.post(`/users/friends/reject/${userId}`),
    removeFriend: (userId) => api.delete(`/users/friends/${userId}`),
    blockUser: (userId) => api.post(`/users/block/${userId}`),
    unblockUser: (userId) => api.delete(`/users/block/${userId}`),
    getGroups: () => api.get('/users/groups'),
    getAchievements: () => api.get('/users/achievements')
};

// History API
export const historyAPI = {
    getHistory: (params) => api.get('/history', { params }),
    saveHistory: (data) => api.post('/history', data),
    clearHistory: () => api.delete('/history'),
    deleteHistoryItem: (id) => api.delete(`/history/${id}`),
    exportHistory: (format) => api.get('/history/export', { params: { format } })
};

// Calendar API
export const calendarAPI = {
    getSaintsByDate: (month, day) => api.get(`/calendar/saints/${month}/${day}`),
    searchSaints: (query) => api.get('/calendar/saints/search', { params: query }),
    getSaintOfTheDay: () => api.get('/calendar/saints/today'),
    getReadingsByDate: (month, day) => api.get(`/calendar/readings/${month}/${day}`),
    getHolidaysByYear: (year) => api.get(`/calendar/holidays/${year}`),
    getUpcomingFeasts: (days) => api.get('/calendar/upcoming', { params: { days } }),
    convertDate: (data) => api.post('/calendar/convert', data)
};

// Quiz API
export const quizAPI = {
    generateQuiz: (data) => api.post('/quiz/generate', data, {
        timeout: 120000 // 2 minutes specifically for quiz generation
    }),
    getQuestions: (params) => api.get('/quiz/questions', { params }),
    submitAttempt: (data) => api.post('/quiz/submit', data),
    getHistory: () => api.get('/quiz/history')
};

// Chat API
export const chatAPI = {
    // Groups
    createGroup: (data) => api.post('/chat/groups', data),
    getGroups: (params) => api.get('/chat/groups', { params }),
    joinGroup: (groupId) => api.post(`/chat/groups/${groupId}/join`),
    leaveGroup: (groupId) => api.post(`/chat/groups/${groupId}/leave`),
    
    // Messages
    getMessages: (chatId, params) => api.get(`/chat/${chatId}/messages`, { params }),
    sendMessage: (chatId, data) => api.post(`/chat/${chatId}/messages`, data),
    addReaction: (chatId, messageId, data) => 
        api.post(`/chat/${chatId}/messages/${messageId}/reactions`, data),
    
    // Polls
    createPoll: (chatId, data) => api.post(`/chat/${chatId}/polls`, data),
    votePoll: (messageId, data) => api.post(`/chat/messages/${messageId}/vote`, data)
};

export default api;