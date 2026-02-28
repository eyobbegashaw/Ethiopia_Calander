const User = require('../models/User');
const { Group } = require('../models/Chat');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role, status } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role) {
            query.role = role;
        }
        
        if (status) {
            query.status = status;
        }
        
        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
        
        const total = await User.countDocuments(query);
        
        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('friends', 'username avatar')
            .populate('groups.group', 'name avatar');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, email, bio, location, website, preferences } = req.body;
        const userId = req.user.id;

        // Check if username/email already taken
        if (username || email) {
            const existingUser = await User.findOne({
                $and: [
                    { _id: { $ne: userId } },
                    {
                        $or: [
                            ...(username ? [{ username }] : []),
                            ...(email ? [{ email }] : [])
                        ]
                    }
                ]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: existingUser.username === username 
                        ? 'Username already taken' 
                        : 'Email already registered'
                });
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            {
                ...(username && { username }),
                ...(email && { email }),
                ...(bio && { bio }),
                ...(location && { location }),
                ...(website && { website }),
                ...(preferences && { preferences })
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// @desc    Update avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update avatar'
        });
    }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

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
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role'
        });
    }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get quiz stats
        const QuizAttempt = require('../models/QuizAttempt');
        const quizAttempts = await QuizAttempt.find({ userId });
        
        const totalQuizzes = quizAttempts.length;
        const averageScore = quizAttempts.length > 0 
            ? quizAttempts.reduce((acc, curr) => 
                acc + (curr.score / curr.totalQuestions * 100), 0) / totalQuizzes 
            : 0;
        
        // Get chat stats
        const { Chat } = require('../models/Chat');
        const messagesCount = await Chat.aggregate([
            { $match: { participants: mongoose.Types.ObjectId(userId) } },
            { $unwind: '$messages' },
            { $match: { 'messages.sender': mongoose.Types.ObjectId(userId) } },
            { $count: 'count' }
        ]);

        // Get history stats
        const History = require('../models/History');
        const historyCount = await History.countDocuments({ userId });
        
        // Get groups count
        const groupsCount = req.user.groups?.length || 0;
        
        // Get friends count
        const friendsCount = req.user.friends?.length || 0;

        // Calculate days active
        const joinDate = new Date(req.user.joined);
        const daysActive = Math.ceil((Date.now() - joinDate) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            stats: {
                totalQuizzes,
                averageScore: Math.round(averageScore),
                totalMessages: messagesCount[0]?.count || 0,
                totalHistory: historyCount,
                groupsJoined: groupsCount,
                friendsCount,
                daysActive,
                memberSince: req.user.joined,
                lastLogin: req.user.lastLogin,
                lastActive: req.user.lastActive,
                loginCount: req.user.loginCount || 0
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user stats'
        });
    }
};

// @desc    Get online users
// @route   GET /api/users/online
// @access  Private
const getOnlineUsers = async (req, res) => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const onlineUsers = await User.find({
            lastActive: { $gte: fiveMinutesAgo },
            _id: { $ne: req.user.id },
            status: 'active'
        })
        .select('username avatar lastActive')
        .limit(50);

        res.json({
            success: true,
            onlineUsers,
            count: onlineUsers.length
        });
    } catch (error) {
        console.error('Error fetching online users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch online users'
        });
    }
};

// @desc    Get friends list
// @route   GET /api/users/friends
// @access  Private
const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends', 'username avatar bio lastActive status');
        
        res.json({
            success: true,
            friends: user.friends
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch friends'
        });
    }
};

// @desc    Send friend request
// @route   POST /api/users/friends/request
// @access  Private
const addFriend = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot add yourself as friend'
            });
        }
        
        const targetUser = await User.findById(userId);
        
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Check if already friends
        if (req.user.friends.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Already friends with this user'
            });
        }
        
        // Check if request already pending
        const existingRequest = targetUser.friendRequests?.find(
            req => req.from.toString() === req.user.id && req.status === 'pending'
        );
        
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Friend request already sent'
            });
        }
        
        // Add friend request
        targetUser.friendRequests = targetUser.friendRequests || [];
        targetUser.friendRequests.push({
            from: req.user.id,
            status: 'pending',
            createdAt: new Date()
        });
        
        await targetUser.save();
        
        res.json({
            success: true,
            message: 'Friend request sent'
        });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send friend request'
        });
    }
};

// @desc    Accept friend request
// @route   POST /api/users/friends/accept/:userId
// @access  Private
const acceptFriendRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(req.user.id);
        const requestingUser = await User.findById(userId);
        
        if (!requestingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Find and update the friend request
        const requestIndex = user.friendRequests?.findIndex(
            req => req.from.toString() === userId && req.status === 'pending'
        );
        
        if (requestIndex === -1 || requestIndex === undefined) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }
        
        // Update request status
        user.friendRequests[requestIndex].status = 'accepted';
        
        // Add to friends lists
        user.friends = user.friends || [];
        user.friends.push(userId);
        
        requestingUser.friends = requestingUser.friends || [];
        requestingUser.friends.push(req.user.id);
        
        await user.save();
        await requestingUser.save();
        
        res.json({
            success: true,
            message: 'Friend request accepted'
        });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept friend request'
        });
    }
};

// @desc    Reject friend request
// @route   POST /api/users/friends/reject/:userId
// @access  Private
const rejectFriendRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(req.user.id);
        
        // Find and update the friend request
        const requestIndex = user.friendRequests?.findIndex(
            req => req.from.toString() === userId && req.status === 'pending'
        );
        
        if (requestIndex === -1 || requestIndex === undefined) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }
        
        // Remove the request
        user.friendRequests.splice(requestIndex, 1);
        await user.save();
        
        res.json({
            success: true,
            message: 'Friend request rejected'
        });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject friend request'
        });
    }
};

// @desc    Remove friend
// @route   DELETE /api/users/friends/:userId
// @access  Private
const removeFriend = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(req.user.id);
        const friend = await User.findById(userId);
        
        if (!friend) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove from both users' friends lists
        user.friends = user.friends.filter(id => id.toString() !== userId);
        friend.friends = friend.friends.filter(id => id.toString() !== req.user.id);
        
        await user.save();
        await friend.save();
        
        res.json({
            success: true,
            message: 'Friend removed successfully'
        });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove friend'
        });
    }
};

// @desc    Block user
// @route   POST /api/users/block/:userId
// @access  Private
const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(req.user.id);
        
        // Check if already blocked
        if (user.blockedUsers?.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'User already blocked'
            });
        }
        
        // Add to blocked list
        user.blockedUsers = user.blockedUsers || [];
        user.blockedUsers.push(userId);
        
        // Remove from friends if they were friends
        user.friends = user.friends.filter(id => id.toString() !== userId);
        
        await user.save();
        
        res.json({
            success: true,
            message: 'User blocked successfully'
        });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to block user'
        });
    }
};

// @desc    Unblock user
// @route   DELETE /api/users/block/:userId
// @access  Private
const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(req.user.id);
        
        // Remove from blocked list
        user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
        await user.save();
        
        res.json({
            success: true,
            message: 'User unblocked successfully'
        });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unblock user'
        });
    }
};

// @desc    Get user groups
// @route   GET /api/users/groups
// @access  Private
const getUserGroups = async (req, res) => {
    try {
        const groups = await Group.find({
            'members.user': req.user.id
        })
        .populate('createdBy', 'username avatar')
        .select('name description avatar members category lastActivity')
        .sort('-lastActivity');

        const groupsWithRole = groups.map(group => {
            const member = group.members.find(m => 
                m.user._id.toString() === req.user.id
            );
            return {
                ...group.toObject(),
                userRole: member?.role,
                memberCount: group.members.length
            };
        });

        res.json({
            success: true,
            groups: groupsWithRole
        });
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user groups'
        });
    }
};

// @desc    Get user achievements
// @route   GET /api/users/achievements
// @access  Private
const getUserAchievements = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('achievements stats');
        
        // Calculate achievements based on stats
        const achievements = user.achievements || [];
        
        // Add automatic achievements based on stats
        const newAchievements = [];
        
        // Quiz master achievement
        if (user.stats.quizzesTaken >= 10 && !achievements.some(a => a.name === 'Quiz Master')) {
            newAchievements.push({
                name: 'Quiz Master',
                description: 'Completed 10 quizzes',
                earnedAt: new Date(),
                icon: '🎯'
            });
        }
        
        // Social butterfly achievement
        if (user.stats.groupsJoined >= 5 && !achievements.some(a => a.name === 'Social Butterfly')) {
            newAchievements.push({
                name: 'Social Butterfly',
                description: 'Joined 5 groups',
                earnedAt: new Date(),
                icon: '🦋'
            });
        }
        
        // Chatterbox achievement
        if (user.stats.messagesSent >= 100 && !achievements.some(a => a.name === 'Chatterbox')) {
            newAchievements.push({
                name: 'Chatterbox',
                description: 'Sent 100 messages',
                earnedAt: new Date(),
                icon: '💬'
            });
        }
        
        // Veteran achievement
        const daysActive = Math.ceil((Date.now() - new Date(user.joined)) / (1000 * 60 * 60 * 24));
        if (daysActive >= 365 && !achievements.some(a => a.name === 'Veteran')) {
            newAchievements.push({
                name: 'Veteran',
                description: 'Been a member for 1 year',
                earnedAt: new Date(),
                icon: '⭐'
            });
        }
        
        if (newAchievements.length > 0) {
            user.achievements = [...achievements, ...newAchievements];
            await user.save();
        }
        
        res.json({
            success: true,
            achievements: user.achievements || []
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements'
        });
    }
};

module.exports = {
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
};