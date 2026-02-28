const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    questionAmharic: {
        type: String
    },
    options: [{
        text: String,
        textAmharic: String,
        isCorrect: Boolean
    }],
    category: {
        type: String,
        enum: ['synaxarium', 'gizae', 'holidays', 'general'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    explanation: String,
    explanationAmharic: String,
    source: {
        type: String,
        enum: ['api', 'manual', 'gemini', 'fallback'], // 'fallback' እና 'gemini' የሚሉትን ጨምርባቸው
        default: 'api'
    },
    metadata: {
        month: Number,
        day: Number,
        saint: String,
        holiday: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    usedCount: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

// Index for efficient querying
QuizSchema.index({ category: 1, difficulty: 1 });
QuizSchema.index({ 'metadata.month': 1, 'metadata.day': 1 });

module.exports = mongoose.model('Quiz', QuizSchema);