
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body } = require('express-validator');
const { 
    register, 
    login, 
    getMe, 
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    googleCallback
} = require('../controllers/authController');
const { protect, rateLimit } = require('../middleware/auth');


// Rate limiting for auth routes
const authLimiter = rateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
        .withMessage('Password must contain at least one letter and one number'),
    body('firstName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
];

const loginValidation = [
    body('username').notEmpty().withMessage('Username/email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const emailValidation = [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail()
];

const passwordValidation = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
        .withMessage('Password must contain at least one letter and one number')
];

// Local auth routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh-token', protect, refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, emailValidation, forgotPassword);
router.put('/reset-password/:token', authLimiter, passwordValidation, resetPassword);
router.put('/change-password', protect, changePasswordValidation, changePassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    }), 
    googleCallback
);

module.exports = router;
