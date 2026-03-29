const express = require('express');
const router = express.Router();
const { 
    getSaintsByDate,
    getReadingsByDate,
    getHolidaysByYear,
    searchSaints,
    getSaintOfTheDay,
    getUpcomingFeasts,
    convertDate
} = require('../controllers/calendarController');
const { optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/saints/today', getSaintOfTheDay);
router.get('/saints/:month/:day', getSaintsByDate);
router.get('/saints/search', searchSaints);
router.get('/readings/:month/:day', getReadingsByDate);
router.get('/holidays/:year', getHolidaysByYear);
router.get('/upcoming', getUpcomingFeasts);
router.post('/convert', convertDate);



module.exports = router;
