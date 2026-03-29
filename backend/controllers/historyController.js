const History = require('../models/History');

// @desc    Get user history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const { type, limit = 50, page = 1, startDate, endDate } = req.query;
        
        const query = { userId: req.user.id };
        
        if (type) {
            query.type = type;
        }    
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const history = await History.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await History.countDocuments(query);

        // Get summary stats
        const summary = await History.aggregate([
            { $match: { userId: req.user.id } },
            { $group: {
                _id: '$type',
                count: { $sum: 1 },
                lastActivity: { $max: '$timestamp' }
            }}
        ]);

        res.json({
            success: true,
            history,
            summary,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history'
        });
    }
};

// @desc    Save history item
// @route   POST /api/history
// @access  Private
const saveHistory = async (req, res) => {
    try {
        const { type, action, metadata = {} } = req.body;

        // Validate type
        const validTypes = ['conversion', 'saint_search', 'saint_view', 'gizae_search', 'holiday_calculation', 'calendar_view', 'quiz_attempt', 'group_join', 'message_sent'];
        
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid history type'
            });
        }

        const historyItem = new History({
            userId: req.user.id,
            type,
            action,
            metadata,
            timestamp: new Date()
        });

        await historyItem.save();

        // Cleanup old entries (keep last 100)
        const count = await History.countDocuments({ userId: req.user.id });
        if (count > 100) {
            const oldestToKeep = await History.find({ userId: req.user.id })
                .sort({ timestamp: -1 })
                .skip(100)
                .limit(1);
            
            if (oldestToKeep.length > 0) {
                await History.deleteMany({
                    userId: req.user.id,
                    timestamp: { $lt: oldestToKeep[0].timestamp }
                });
            }
        }

        res.status(201).json({
            success: true,
            history: historyItem
        });
    } catch (error) {
        console.error('Error saving history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save history'
        });
    }
};

// @desc    Get history by date range
// @route   GET /api/history/range
// @access  Private
const getHistoryByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const history = await History.find({
            userId: req.user.id,
            timestamp: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ timestamp: -1 });

        // Group by date
        const grouped = history.reduce((acc, item) => {
            const date = item.timestamp.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});

        res.json({
            success: true,
            grouped,
            total: history.length
        });
    } catch (error) {
        console.error('Error fetching history by range:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history'
        });
    }
};

// @desc    Get history stats
// @route   GET /api/history/stats
// @access  Private
const getHistoryStats = async (req, res) => {
    try {
        const stats = await History.aggregate([
            { $match: { userId: req.user.id } },
            { $group: {
                _id: {
                    type: '$type',
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
                },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.date': -1 } }
        ]);

        // Get activity heatmap data
        const heatmap = await History.aggregate([
            { $match: { 
                userId: req.user.id,
                timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }},
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            stats,
            heatmap
        });
    } catch (error) {
        console.error('Error fetching history stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history stats'
        });
    }
};

// @desc    Clear all history
// @route   DELETE /api/history
// @access  Private
const clearHistory = async (req, res) => {
    try {
        await History.deleteMany({ userId: req.user.id });

        res.json({
            success: true,
            message: 'History cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear history'
        });
    }
};

// @desc    Delete specific history item
// @route   DELETE /api/history/:id
// @access  Private
const deleteHistoryItem = async (req, res) => {
    try {
        const history = await History.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        res.json({
            success: true,
            message: 'History item deleted'
        });
    } catch (error) {
        console.error('Error deleting history item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete history item'
        });
    }
};

// @desc    Export history
// @route   GET /api/history/export
// @access  Private
const exportHistory = async (req, res) => {
    try {
        const { format = 'json' } = req.query;
        
        const history = await History.find({ userId: req.user.id })
            .sort({ timestamp: -1 });

        if (format === 'csv') {
            // Convert to CSV
            const headers = ['Date', 'Type', 'Action', 'Metadata'];
            const rows = history.map(item => [
                item.timestamp.toISOString(),
                item.type,
                item.action,
                JSON.stringify(item.metadata)
            ]);
            
            const csv = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=history.csv');
            res.send(csv);
        } else {
            res.json({
                success: true,
                history
            });
        }
    } catch (error) {
        console.error('Error exporting history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export history'
        });
    }
};

module.exports = {
    getHistory,
    saveHistory,
    getHistoryByDateRange,
    getHistoryStats,
    clearHistory,
    deleteHistoryItem,
    exportHistory
};
