const express = require('express');
const router = express.Router();
const { 
    getHistory, 
    saveHistory, 
    getHistoryByDateRange,
    getHistoryStats,
    clearHistory, 
    deleteHistoryItem,
    exportHistory
} = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

// All history routes require authentication
router.use(protect);

// Routes
router.get('/', getHistory);
router.get('/stats', getHistoryStats);
router.get('/range', getHistoryByDateRange);
router.get('/export', exportHistory);
router.post('/', saveHistory);
router.delete('/', clearHistory);
router.delete('/:id', deleteHistoryItem);



module.exports = router;
