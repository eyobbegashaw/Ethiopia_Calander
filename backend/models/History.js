const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'conversion', 
            'saint_search', 
            'saint_view', 
            'gizae_search', 
            'holiday_calculation', 
            'calendar_view', 
            'quiz_attempt', 
            'group_join', 
            'message_sent',
            'login',
            'logout',
            'profile_update',
            'password_change',
            'bookmark_add',
            'note_add',
            'poll_vote',
            'quiz_share'
        ],
        required: true
    },
    action: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    duration: Number, // Time spent in seconds
    location: {
        country: String,
        city: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    }
}, {
    timestamps: true
});

// Index for efficient querying
HistorySchema.index({ userId: 1, timestamp: -1 });
HistorySchema.index({ type: 1, timestamp: -1 });
HistorySchema.index({ timestamp: -1 });

// Static method to get user activity summary
HistorySchema.statics.getUserSummary = async function(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const summary = await this.aggregate([
        {
            $match: {
                userId: mongoose.Types.ObjectId(userId),
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    type: '$type',
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
                },
                count: { $sum: 1 },
                avgDuration: { $avg: '$duration' }
            }
        },
        {
            $group: {
                _id: '$_id.type',
                total: { $sum: '$count' },
                averagePerDay: { $avg: '$count' },
                days: { $push: { date: '$_id.date', count: '$count' } }
            }
        }
    ]);
    
    return summary;
};

// Static method to get popular actions
HistorySchema.statics.getPopularActions = async function(limit = 10) {
    return this.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' }
            }
        },
        {
            $project: {
                type: '$_id',
                count: 1,
                uniqueUsers: { $size: '$uniqueUsers' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);
};

// Static method to clean up old entries
HistorySchema.statics.cleanupOldEntries = async function(userId, keepLast = 100) {
    const count = await this.countDocuments({ userId });
    
    if (count > keepLast) {
        const oldestToKeep = await this.find({ userId })
            .sort({ timestamp: -1 })
            .skip(keepLast)
            .limit(1);
        
        if (oldestToKeep.length > 0) {
            await this.deleteMany({
                userId,
                timestamp: { $lt: oldestToKeep[0].timestamp }
            });
        }
    }
};

// Instance method to add metadata
HistorySchema.methods.addMetadata = function(key, value) {
    this.metadata = this.metadata || {};
    this.metadata[key] = value;
    return this.save();
};

module.exports = mongoose.model('History', HistorySchema);