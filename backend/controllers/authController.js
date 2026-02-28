// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const { validationResult } = require('express-validator');
// const { generateTokens } = require('../utils/jwtUtils');

// // Generate JWT Token
// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRE
//     });
// };

// // Generate email verification token
// const generateVerificationToken = () => {
//     return crypto.randomBytes(32).toString('hex');
// };

// // @desc    Register user (stored in database)
// // @route   POST /api/auth/register
// // @access  Public
// const register = async (req, res) => {
//     try {
//         // Check for validation errors
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ 
//                 success: false, 
//                 errors: errors.array() 
//             });
//         }

//         const { username, email, password, firstName, lastName } = req.body;

//         // Check if user exists in database
//         const userExists = await User.findOne({ 
//             $or: [{ email }, { username }] 
//         });

//         if (userExists) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: userExists.email === email 
//                     ? 'Email already registered' 
//                     : 'Username already taken' 
//             });
//         }

//         // Generate verification token
//         const verificationToken = generateVerificationToken();
//         const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//         // Create user in database
//         const user = await User.create({
//             username,
//             email,
//             password,
//             firstName,
//             lastName,
//             displayName: `${firstName} ${lastName}`.trim() || username,
//             authProvider: 'local',
//             verificationToken,
//             verificationTokenExpires,
//             emailVerified: false
//         });

//         // Generate JWT token
//         const token = generateToken(user._id);

//         // Remove sensitive data
//         const userData = user.getPublicProfile();

//         // In production, send verification email
//         // sendVerificationEmail(user.email, verificationToken);

//         res.status(201).json({
//             success: true,
//             token,
//             user: userData,
//             message: 'Registration successful. Please verify your email.'
//         });
//     } catch (error) {
//         console.error('Registration error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error during registration' 
//         });
//     }
// };

// // @desc    Login user (verify against database)
// // @route   POST /api/auth/login
// // @access  Public
// const login = async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         // Check for user in database
//         const user = await User.findOne({ 
//             $or: [{ email: username }, { username }] 
//         }).select('+password');

//         if (!user) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: 'Invalid credentials' 
//             });
//         }

//         // Check if account is active
//         if (user.status !== 'active') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Account is suspended. Please contact support.'
//             });
//         }

//         // Check password
//         const isPasswordMatch = await user.comparePassword(password);

//         if (!isPasswordMatch) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: 'Invalid credentials' 
//             });
//         }

//         // Update last login in database
//         user.lastLogin = Date.now();
//         user.loginCount += 1;
//         await user.save();

//         // Generate token
//         const token = generateToken(user._id);

//         // Remove sensitive data
//         const userData = user.getPublicProfile();

//         res.json({
//             success: true,
//             token,
//             user: userData
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error during login' 
//         });
//     }
// };

// // @desc    Google OAuth callback
// // @route   GET /api/auth/google/callback
// // @access  Public
// const googleCallback = async (req, res) => {
//     try {
//         // User is attached by passport
//         const user = req.user;
        
//         // Update last login in database
//         user.lastLogin = Date.now();
//         user.loginCount += 1;
//         await user.save();

//         // Generate JWT token
//         const token = generateToken(user._id);

//         // Remove sensitive data
//         const userData = user.getPublicProfile();

//         // Redirect to frontend with token
//         res.redirect(`${process.env.FRONTEND_URL}/oauth-redirect?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
//     } catch (error) {
//         console.error('Google callback error:', error);
//         res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
//     }
// };

// // @desc    Get current user from database
// // @route   GET /api/auth/me
// // @access  Private
// const getMe = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
        
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         res.json({
//             success: true,
//             user: user.getPublicProfile()
//         });
//     } catch (error) {
//         console.error('Get me error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error' 
//         });
//     }
// };

// // @desc    Logout user (invalidate token on client side)
// // @route   POST /api/auth/logout
// // @access  Private
// const logout = (req, res) => {
//     // With JWT, logout is handled client-side by removing token
//     // But we can blacklist the token if needed
//     res.json({ 
//         success: true, 
//         message: 'Logged out successfully' 
//     });
// };

// // @desc    Refresh token
// // @route   POST /api/auth/refresh-token
// // @access  Private
// const refreshToken = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
        
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         const token = generateToken(user._id);
        
//         res.json({
//             success: true,
//             token
//         });
//     } catch (error) {
//         console.error('Token refresh error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Failed to refresh token' 
//         });
//     }
// };

// // @desc    Verify email
// // @route   GET /api/auth/verify-email/:token
// // @access  Public
// const verifyEmail = async (req, res) => {
//     try {
//         const { token } = req.params;

//         const user = await User.findOne({
//             verificationToken: token,
//             verificationTokenExpires: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid or expired verification token'
//             });
//         }

//         user.emailVerified = true;
//         user.verificationToken = undefined;
//         user.verificationTokenExpires = undefined;
//         await user.save();

//         res.json({
//             success: true,
//             message: 'Email verified successfully'
//         });
//     } catch (error) {
//         console.error('Email verification error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to verify email'
//         });
//     }
// };

// // @desc    Forgot password
// // @route   POST /api/auth/forgot-password
// // @access  Public
// const forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         // Generate reset token
//         const resetToken = crypto.randomBytes(32).toString('hex');
//         user.resetPasswordToken = crypto
//             .createHash('sha256')
//             .update(resetToken)
//             .digest('hex');
//         user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

//         await user.save();

//         // In production, send email with reset link
//         // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
//         // sendPasswordResetEmail(user.email, resetUrl);

//         res.json({
//             success: true,
//             message: 'Password reset email sent',
//             resetToken // Remove in production
//         });
//     } catch (error) {
//         console.error('Forgot password error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error' 
//         });
//     }
// };

// // @desc    Reset password
// // @route   PUT /api/auth/reset-password/:token
// // @access  Public
// const resetPassword = async (req, res) => {
//     try {
//         const { token } = req.params;
//         const { password } = req.body;

//         // Get hashed token
//         const resetPasswordToken = crypto
//             .createHash('sha256')
//             .update(token)
//             .digest('hex');

//         const user = await User.findOne({
//             resetPasswordToken,
//             resetPasswordExpire: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid or expired reset token'
//             });
//         }

//         // Set new password
//         user.password = password;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;
//         await user.save();

//         res.json({
//             success: true,
//             message: 'Password reset successful'
//         });
//     } catch (error) {
//         console.error('Reset password error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error' 
//         });
//     }
// };

// // @desc    Change password (when logged in)
// // @route   PUT /api/auth/change-password
// // @access  Private
// const changePassword = async (req, res) => {
//     try {
//         const { currentPassword, newPassword } = req.body;

//         // Get user with password
//         const user = await User.findById(req.user.id).select('+password');

//         // Check current password
//         const isMatch = await user.comparePassword(currentPassword);
//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Current password is incorrect'
//             });
//         }

//         // Update password
//         user.password = newPassword;
//         await user.save();

//         res.json({
//             success: true,
//             message: 'Password changed successfully'
//         });
//     } catch (error) {
//         console.error('Change password error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to change password'
//         });
//     }
// };

// module.exports = {
//     register,
//     login,
//     googleCallback,
//     getMe,
//     logout,
//     refreshToken,
//     verifyEmail,
//     forgotPassword,
//     resetPassword,
//     changePassword
// };

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { generateTokens } = require('../utils/jwtUtils');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Generate email verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// @desc    Register user (stored in database)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { username, email, password, firstName, lastName } = req.body;

        // Check if user exists in database
        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                message: userExists.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken' 
            });
        }

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user in database
        const user = await User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`.trim() || username,
            authProvider: 'local',
            verificationToken,
            verificationTokenExpires,
            emailVerified: false
        });

        // Generate JWT token
        const token = generateToken(user._id);

        // Remove sensitive data
        const userData = user.getPublicProfile();

        // In production, send verification email
        // sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            token,
            user: userData,
            message: 'Registration successful. Please verify your email.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
};

// @desc    Login user (verify against database)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check for user in database
        const user = await User.findOne({ 
            $or: [{ email: username }, { username }] 
        }).select('+password');

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is suspended. Please contact support.'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Update last login in database
        user.lastLogin = Date.now();
        user.loginCount += 1;
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Remove sensitive data
        const userData = user.getPublicProfile();

        res.json({
            success: true,
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
    try {
        // User is attached by passport
        const user = req.user;
        
        if (!user) {
            console.error('No user found in Google callback');
            // Fallback URL if FRONTEND_URL is not set
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/login?error=no_user`);
        }

        // Update last login in database
        user.lastLogin = Date.now();
        user.loginCount += 1;
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        // Remove sensitive data
        const userData = user.getPublicProfile();

        // Ensure FRONTEND_URL doesn't have trailing slash
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
        
        // Redirect to frontend with token
        res.redirect(`${frontendUrl}/oauth-redirect?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (error) {
        console.error('Google callback error:', error);
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
        res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
};

// @desc    Get current user from database
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Logout user (invalidate token on client side)
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
    // With JWT, logout is handled client-side by removing token
    // But we can blacklist the token if needed
    res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Private
const refreshToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const token = generateToken(user._id);
        
        res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to refresh token' 
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // In production, send email with reset link
        // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        // sendPasswordResetEmail(user.email, resetUrl);

        res.json({
            success: true,
            message: 'Password reset email sent',
            resetToken // Remove in production
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Change password (when logged in)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

module.exports = {
    register,
    login,
    googleCallback,
    getMe,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword
};
