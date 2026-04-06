
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    generateQuiz,
    getQuizQuestions,
    submitQuizAttempt,
    getQuizHistory
} = require('../controllers/quizController');

// Public routes
router.get('/questions', getQuizQuestions);

// Protected routes
router.post('/generate', protect, generateQuiz);
router.post('/submit', protect, submitQuizAttempt);
router.get('/history', protect, getQuizHistory);



module.exports = router;
