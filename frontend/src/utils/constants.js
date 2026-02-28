// Ethiopian months with Amharic and English names
export const ETHIOPIAN_MONTHS = [
    { amharic: 'መስከረም', english: 'Meskerem', number: 1, days: 30 },
    { amharic: 'ጥቅምት', english: 'Tikimt', number: 2, days: 30 },
    { amharic: 'ኅዳር', english: 'Hidar', number: 3, days: 30 },
    { amharic: 'ታኅሣሥ', english: 'Tahsas', number: 4, days: 30 },
    { amharic: 'ጥር', english: 'Tir', number: 5, days: 30 },
    { amharic: 'የካቲት', english: 'Yekatit', number: 6, days: 30 },
    { amharic: 'መጋቢት', english: 'Megabit', number: 7, days: 30 },
    { amharic: 'ሚያዝያ', english: 'Miazia', number: 8, days: 30 },
    { amharic: 'ግንቦት', english: 'Ginbot', number: 9, days: 30 },
    { amharic: 'ሰኔ', english: 'Sene', number: 10, days: 30 },
    { amharic: 'ሐምሌ', english: 'Hamle', number: 11, days: 30 },
    { amharic: 'ነሐሴ', english: 'Nehase', number: 12, days: 30 },
    { amharic: 'ጳጉሜ', english: 'Pagume', number: 13, days: 5 } // 6 in leap year
];

// Ethiopian weekdays
export const ETHIOPIAN_WEEKDAYS = [
    { amharic: 'ሰኞ', english: 'Monday' },
    { amharic: 'ማክሰኞ', english: 'Tuesday' },
    { amharic: 'ረቡዕ', english: 'Wednesday' },
    { amharic: 'ሐሙስ', english: 'Thursday' },
    { amharic: 'ዓርብ', english: 'Friday' },
    { amharic: 'ቅዳሜ', english: 'Saturday' },
    { amharic: 'እሁድ', english: 'Sunday' }
];

// Gregorian months
export const GREGORIAN_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Ethiopian Orthodox holidays
export const MAJOR_HOLIDAYS = [
    { name: 'አዲስ አመት', english: 'New Year', month: 1, day: 1 },
    { name: 'መስቀል', english: 'Finding of True Cross', month: 1, day: 17 },
    { name: 'ገና', english: 'Christmas', month: 4, day: 29 },
    { name: 'ጥምቀት', english: 'Epiphany', month: 5, day: 11 },
    { name: 'ዓደዋ', english: 'Victory of Adwa', month: 7, day: 23 },
    { name: 'ፋሲካ', english: 'Easter', month: 9, day: 11 },
    { name: 'ደብረ ዘይት', english: 'Mount of Olives', month: 10, day: 8 }
];

// Chat categories
export const CHAT_CATEGORIES = [
    { value: 'general', label: 'General Discussion', icon: '💬' },
    { value: 'biblical', label: 'Biblical Study', icon: '📖' },
    { value: 'history', label: 'Church History', icon: '🏛️' },
    { value: 'prayer', label: 'Prayer Group', icon: '🙏' },
    { value: 'study', label: 'Scripture Study', icon: '📚' },
    { value: 'youth', label: 'Youth Group', icon: '🌟' },
    { value: 'music', label: 'Church Music', icon: '🎵' }
];

// Quiz categories
export const QUIZ_CATEGORIES = [
    { value: 'synaxarium', label: 'Synaxarium', icon: '⛪' },
    { value: 'gizae', label: 'Gizae', icon: '📖' },
    { value: 'holidays', label: 'Holidays', icon: '🎉' },
    { value: 'bible', label: 'Bible', icon: '📜' },
    { value: 'history', label: 'Church History', icon: '📅' }
];

// Quiz difficulties
export const QUIZ_DIFFICULTIES = [
    { value: 'easy', label: 'Easy', color: '#28a745' },
    { value: 'medium', label: 'Medium', color: '#ffc107' },
    { value: 'hard', label: 'Hard', color: '#dc3545' }
];

// Gallery categories
export const GALLERY_CATEGORIES = [
    'church',
    'nature',
    'culture',
    'festival',
    'manuscript',
    'other'
];

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me'
    },
    USERS: {
        PROFILE: '/users/profile',
        AVATAR: '/users/avatar',
        PASSWORD: '/users/password'
    },
    HISTORY: {
        BASE: '/history',
        CLEAR: '/history/clear'
    },
    CALENDAR: {
        SAINTS: (month, day) => `/calendar/saints/${month}/${day}`,
        READINGS: (month, day) => `/calendar/readings/${month}/${day}`,
        HOLIDAYS: (year) => `/calendar/holidays/${year}`,
        CONVERT: '/calendar/convert'
    },
    QUIZ: {
        GENERATE: '/quiz/generate',
        QUESTIONS: '/quiz/questions',
        SUBMIT: '/quiz/submit',
        HISTORY: '/quiz/history'
    },
    CHAT: {
        GROUPS: '/chat/groups',
        GROUP: (id) => `/chat/groups/${id}`,
        JOIN: (id) => `/chat/groups/${id}/join`,
        LEAVE: (id) => `/chat/groups/${id}/leave`,
        MESSAGES: (id) => `/chat/${id}/messages`,
        REACTION: (chatId, msgId) => `/chat/${chatId}/messages/${msgId}/reactions`,
        POLLS: (id) => `/chat/${id}/polls`,
        VOTE: (msgId) => `/chat/messages/${msgId}/vote`
    }
};

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    CURRENT_USER: 'currentUser',
    USERS: 'ethiopianCalendarUsers',
    HISTORY: 'userHistory',
    THEME: 'theme',
    FONT_SIZE: 'fontSize',
    BOOKMARKS: 'gizaeBookmarks',
    NOTES: 'gizaeNotes'
};

// Theme options
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Font size limits
export const FONT_SIZE = {
    MIN: 12,
    MAX: 24,
    DEFAULT: 16
};

// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
};