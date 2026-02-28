const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // Local authentication fields
    username: {
        type: String,
        unique: true,
        sparse: true, // Allows null for OAuth users
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    
    // OAuth fields
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    
    // Profile fields
    firstName: String,
    lastName: String,
    displayName: String,
    avatar: {
        type: String,
        default: null
    },
    coverPhoto: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: 500
    },
    location: String,
    website: String,
    
    // Account status
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    permissions: [{
        type: String,
        enum: ['create_group', 'delete_message', 'ban_user', 'manage_quizzes']
    }],
    
    // Email verification
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    
    // Password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    
    // OAuth tokens
    googleAccessToken: String,
    googleRefreshToken: String,
    googleTokenExpires: Date,
    
    // User preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        fontSize: {
            type: Number,
            default: 16,
            min: 12,
            max: 24
        },
        language: {
            type: String,
            enum: ['en', 'am'],
            default: 'en'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            chat: { type: Boolean, default: true }
        },
        privacy: {
            showEmail: { type: Boolean, default: false },
            showLocation: { type: Boolean, default: false },
            showActivity: { type: Boolean, default: true }
        }
    },
    
    // Activity tracking
    lastLogin: {
        type: Date,
        default: null
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    loginCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'banned'],
        default: 'active'
    },
    joined: {
        type: Date,
        default: Date.now
    },
    
    // Social features
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    groups: [{
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        },
        role: {
            type: String,
            enum: ['admin', 'moderator', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Achievements
    achievements: [{
        name: String,
        description: String,
        earnedAt: {
            type: Date,
            default: Date.now
        },
        icon: String
    }],
    
    // Statistics
    stats: {
        quizzesTaken: { type: Number, default: 0 },
        quizzesCreated: { type: Number, default: 0 },
        messagesSent: { type: Number, default: 0 },
        groupsJoined: { type: Number, default: 0 },
        daysActive: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Hash password before saving
// ከዚህ በፊት እንዲህ ሊሆን ይችላል:
// userSchema.pre('save', async function(next) { ... next(); });

// እንዲህ አስተካክለው:
UserSchema.pre('save', async function() { 
    if (!this.isModified('password')) {
        return; // 'next()' አያስፈልግም
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // እዚህም 'next()' አያስፈልግም
    } catch (error) {
        throw error; // በ 'next(error)' ፋንታ
    }
});

// Update lastActive on any activity
UserSchema.pre('findOneAndUpdate', function() {
    this.set({ lastActive: new Date() });
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate display name from firstName and lastName or email
UserSchema.virtual('fullName').get(function() {
    if (this.displayName) return this.displayName;
    if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`;
    if (this.firstName) return this.firstName;
    if (this.username) return this.username;
    return this.email.split('@')[0];
});

// Generate avatar initials
UserSchema.virtual('avatarInitials').get(function() {
    const name = this.fullName;
    return name.charAt(0).toUpperCase();
});

// Get public profile
UserSchema.methods.getPublicProfile = function() {
    const user = this.toObject();
    delete user.password;
    delete user.googleAccessToken;
    delete user.googleRefreshToken;
    delete user.googleTokenExpires;
    delete user.verificationToken;
    delete user.verificationTokenExpires;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpire;
    delete user.blockedUsers;
    delete user.permissions;
    return user;
};

// Update login stats
UserSchema.methods.recordLogin = async function() {
    this.lastLogin = new Date();
    this.loginCount += 1;
    await this.save();
};

// Check if user is online (active in last 5 minutes)
UserSchema.virtual('isOnline').get(function() {
    if (!this.lastActive) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastActive > fiveMinutesAgo;
});

// Remove sensitive data when converting to JSON
UserSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.googleAccessToken;
        delete ret.googleRefreshToken;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        return ret;
    }
});

module.exports = mongoose.model('User', UserSchema);