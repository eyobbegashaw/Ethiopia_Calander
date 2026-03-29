const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Token expired' 
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token' 
                });
            }
            
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized' 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token' 
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Not authorized as admin' 
        });
    }
};

const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Ignore auth errors for optional auth
            console.log('Optional auth failed:', error.message);
        }
    }
    
    next();
};

const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user has required permission
        // This is a simplified version - implement your own permission logic
        const userPermissions = req.user.permissions || [];
        
        if (userPermissions.includes(permission) || req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};

const rateLimit = (maxRequests, timeWindow) => {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        
        if (!requests.has(ip)) {
            requests.set(ip, []);
        }
        
        const userRequests = requests.get(ip);
        
        // Clean old requests
        const validRequests = userRequests.filter(
            timestamp => now - timestamp < timeWindow
        );
        
        if (validRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later'
            });
        }
        
        validRequests.push(now);
        requests.set(ip, validRequests);
        
        next();
    };
};

module.exports = { 
    protect, 
    admin, 
    optionalAuth, 
    checkPermission,
    rateLimit 
};
