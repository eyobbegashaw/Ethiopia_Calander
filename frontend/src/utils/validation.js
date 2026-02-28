// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (min 6 chars, at least one number, one letter)
export const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
};

// Username validation (3-30 chars, alphanumeric and underscore)
export const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
};

// Phone number validation (Ethiopian format)
export const isValidEthiopianPhone = (phone) => {
    const phoneRegex = /^(\+251|0)[9][0-9]{8}$/;
    return phoneRegex.test(phone);
};

// Ethiopian year validation
export const isValidEthiopianYear = (year) => {
    const yearNum = parseInt(year);
    return yearNum >= 1900 && yearNum <= 2100;
};

// Gregorian year validation
export const isValidGregorianYear = (year) => {
    const yearNum = parseInt(year);
    return yearNum >= 1900 && yearNum <= 2100;
};

// Date validation
export const isValidDate = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
};

// Ethiopian date validation
export const isValidEthiopianDate = (year, month, day) => {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 13) return false;
    
    if (month === 13) {
        // Pagume has 5 or 6 days
        const maxDays = (year % 4 === 3) ? 6 : 5;
        return day >= 1 && day <= maxDays;
    }
    
    return day >= 1 && day <= 30;
};

// Group name validation
export const isValidGroupName = (name) => {
    return name.length >= 3 && name.length <= 50;
};

// Message content validation
export const isValidMessage = (content) => {
    return content.trim().length > 0 && content.length <= 2000;
};

// Sanitize input (prevent XSS)
export const sanitizeInput = (input) => {
    return input.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
};

// File validation
export const isValidImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const isValidDocument = (file) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
};