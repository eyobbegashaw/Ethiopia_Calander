const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
    getUsers,
    getUserById,
    updateProfile,
    updateAvatar,
    changePassword,
    deleteAccount,
    updateUserRole,
    getUserStats,
    getOnlineUsers,
    getFriends,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    blockUser,
    unblockUser,
    getUserGroups,
    getUserAchievements
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');



// Validation rules
const profileValidation = [
    body('username')
        .optional()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    body('location')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters'),
    body('website')
        .optional()
        .isURL()
        .withMessage('Please enter a valid URL'),
    body('preferences.theme')
        .optional()
        .isIn(['light', 'dark'])
        .withMessage('Theme must be either light or dark'),
    body('preferences.fontSize')
        .optional()
        .isInt({ min: 12, max: 24 })
        .withMessage('Font size must be between 12 and 24'),
    body('preferences.language')
        .optional()
        .isIn(['en', 'am'])
        .withMessage('Language must be either en or am')
];

const passwordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
        .withMessage('Password must contain at least one letter and one number')
];

const friendValidation = [
    body('userId')
        .isMongoId()
        .withMessage('Invalid user ID')
];

const roleValidation = [
    body('role')
        .isIn(['user', 'moderator', 'admin'])
        .withMessage('Invalid role')
];

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

router.put('/profile', profileValidation, updateProfile);
router.put('/avatar', updateAvatar);
router.put('/password', passwordValidation, changePassword);
router.delete('/profile', deleteAccount);
router.get('/stats', getUserStats);

// Friend management routes
router.get('/friends', getFriends);
router.post('/friends/request', friendValidation, addFriend);
router.post('/friends/accept/:userId', friendValidation, acceptFriendRequest);
router.post('/friends/reject/:userId', friendValidation, rejectFriendRequest);
router.delete('/friends/:userId', friendValidation, removeFriend);

// Block management routes
router.post('/block/:userId', friendValidation, blockUser);
router.delete('/block/:userId', friendValidation, unblockUser);

// User groups
router.get('/groups', getUserGroups);

// User achievements
router.get('/achievements', getUserAchievements);

// Online users
router.get('/online', getOnlineUsers);

// Admin only routes
router.get('/', admin, getUsers);
router.get('/:id', admin, getUserById);
router.put('/:id/role', admin, roleValidation, updateUserRole);

module.exports = router;
