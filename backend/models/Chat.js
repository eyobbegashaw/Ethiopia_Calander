const mongoose = require('mongoose');



const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['text', 'image', 'quiz', 'poll'],
        default: 'text'
    },
    attachments: [{
        url: String,
        type: String
    }],
    quiz: {
        quizId: mongoose.Schema.Types.ObjectId,
        question: String,
        options: [String],
        correctAnswer: Number
    },
    poll: {
        question: String,
        options: [{
            text: String,
            votes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }]
        }],
        endsAt: Date
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: Date
    }],
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reaction: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    avatar: String,
    coverPhoto: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['admin', 'moderator', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastSeen: Date,
        muted: {
            type: Boolean,
            default: false
        }
    }],
    pendingRequests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        isPrivate: {
            type: Boolean,
            default: false
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        allowMemberPolls: {
            type: Boolean,
            default: true
        },
        allowMemberQuizzes: {
            type: Boolean,
            default: true
        },
        maxMembers: {
            type: Number,
            default: 100
        }
    },
    tags: [String],
    category: {
        type: String,
        enum: ['general', 'biblical', 'history', 'prayer', 'study'],
        default: 'general'
    },
    lastActivity: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    messages: [MessageSchema],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    type: {
        type: String,
        enum: ['direct', 'group'],
        default: 'direct'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
ChatSchema.index({ participants: 1 });
ChatSchema.index({ group: 1 });
ChatSchema.index({ updatedAt: -1 });

const Group = mongoose.model('Group', GroupSchema);
const Chat = mongoose.model('Chat', ChatSchema);
const Message = mongoose.model('Message', MessageSchema);

module.exports = { Group, Chat, Message };
