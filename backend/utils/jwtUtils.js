const jwt = require('jsonwebtoken');

// Generate access token
const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '90d' }
    );
};

// Generate email verification token
const generateVerificationToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Generate password reset token
const generateResetToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Verify token
const verifyToken = (token, options = {}) => {
    try {
        const secret = options.secret || process.env.JWT_SECRET;
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Decode token without verification
const decodeToken = (token) => {
    return jwt.decode(token);
};

// Extract token from authorization header
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
};

// Check if token is expired
const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded) return true;
        return decoded.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

// Get token expiration time
const getTokenExpiration = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
        return null;
    }
};

// Refresh access token using refresh token
const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = verifyToken(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        });
        
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        
        return generateAccessToken(decoded.id);
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

// Generate all tokens for a user
const generateTokens = (userId) => {
    return {
        accessToken: generateAccessToken(userId),
        refreshToken: generateRefreshToken(userId),
        expiresIn: process.env.JWT_EXPIRE || '30d'
    };
};

// Blacklist token (for logout)
const blacklistToken = async (token) => {
    // In production, store blacklisted tokens in Redis or database
    // This is a simplified version
    const decoded = decodeToken(token);
    if (!decoded) return;
    
    const expiryTime = decoded.exp * 1000 - Date.now();
    if (expiryTime > 0) {
        // Store in blacklist with TTL
        // await redis.setex(`blacklist:${token}`, Math.floor(expiryTime / 1000), 'blacklisted');
    }
};

// Check if token is blacklisted
const isTokenBlacklisted = async (token) => {
    // Check if token exists in blacklist
    // const result = await redis.get(`blacklist:${token}`);
    // return !!result;
    return false; // Simplified
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateVerificationToken,
    generateResetToken,
    generateTokens,
    verifyToken,
    decodeToken,
    extractTokenFromHeader,
    isTokenExpired,
    getTokenExpiration,
    refreshAccessToken,
    blacklistToken,
    isTokenBlacklisted
};