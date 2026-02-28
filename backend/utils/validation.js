const validator = require('validator');

// Email validation
const isValidEmail = (email) => {
    return validator.isEmail(email);
};

// Password validation
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
};

// Username validation
const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
};

// Phone number validation (Ethiopian)
const isValidEthiopianPhone = (phone) => {
    const phoneRegex = /^(\+251|0)[9][0-9]{8}$/;
    return phoneRegex.test(phone);
};

// Ethiopian year validation
const isValidEthiopianYear = (year) => {
    const yearNum = parseInt(year);
    return yearNum >= 1900 && yearNum <= 2100;
};

// Ethiopian date validation
const isValidEthiopianDate = (year, month, day) => {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 13) return false;
    
    // Check days in month
    if (month === 13) {
        const maxDays = (year % 4 === 3) ? 6 : 5;
        return day >= 1 && day <= maxDays;
    }
    
    return day >= 1 && day <= 30;
};

// URL validation
const isValidUrl = (url) => {
    return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true
    });
};

// ObjectId validation
const isValidObjectId = (id) => {
    return validator.isMongoId(id);
};

// String length validation
const isValidLength = (str, min, max) => {
    const length = str.length;
    return length >= min && length <= max;
};

// Group name validation
const isValidGroupName = (name) => {
    return isValidLength(name, 3, 50);
};

// Message content validation
const isValidMessage = (content) => {
    return content.trim().length > 0 && content.length <= 2000;
};

// Title validation
const isValidTitle = (title) => {
    return isValidLength(title, 1, 200);
};

// Description validation
const isValidDescription = (description) => {
    return description.length <= 2000;
};

// Tags validation
const isValidTags = (tags) => {
    return Array.isArray(tags) && tags.length <= 10 && tags.every(tag => 
        typeof tag === 'string' && tag.length <= 30
    );
};

// Image validation
const isValidImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
};

// File validation
const isValidFile = (file, allowedTypes, maxSize) => {
    return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
};

// JSON validation
const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

// Boolean validation
const isValidBoolean = (value) => {
    return typeof value === 'boolean';
};

// Number validation
const isValidNumber = (value, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
};

// Array validation
const isValidArray = (arr, validator) => {
    return Array.isArray(arr) && arr.every(validator);
};

// Object validation
const isValidObject = (obj, schema) => {
    for (const [key, validator] of Object.entries(schema)) {
        if (!validator(obj[key])) {
            return false;
        }
    }
    return true;
};

// Date validation
const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

// Future date validation
const isFutureDate = (date) => {
    const d = new Date(date);
    return isValidDate(d) && d > new Date();
};

// Past date validation
const isPastDate = (date) => {
    const d = new Date(date);
    return isValidDate(d) && d < new Date();
};

// Age validation (must be at least 13)
const isValidAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= 13;
    }
    
    return age >= 13;
};

// Color hex validation
const isValidHexColor = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Latitude validation
const isValidLatitude = (lat) => {
    return lat >= -90 && lat <= 90;
};

// Longitude validation
const isValidLongitude = (lng) => {
    return lng >= -180 && lng <= 180;
};

// Sort order validation
const isValidSortOrder = (order) => {
    return ['asc', 'desc'].includes(order);
};

// Pagination validation
const isValidPagination = (page, limit) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    return pageNum > 0 && limitNum > 0 && limitNum <= 100;
};

// Sanitize input (prevent XSS)
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        })
        .trim();
};

// Escape regex
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidUsername,
    isValidEthiopianPhone,
    isValidEthiopianYear,
    isValidEthiopianDate,
    isValidUrl,
    isValidObjectId,
    isValidLength,
    isValidGroupName,
    isValidMessage,
    isValidTitle,
    isValidDescription,
    isValidTags,
    isValidImage,
    isValidFile,
    isValidJSON,
    isValidBoolean,
    isValidNumber,
    isValidArray,
    isValidObject,
    isValidDate,
    isFutureDate,
    isPastDate,
    isValidAge,
    isValidHexColor,
    isValidLatitude,
    isValidLongitude,
    isValidSortOrder,
    isValidPagination,
    sanitizeInput,
    escapeRegex
};