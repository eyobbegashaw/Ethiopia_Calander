const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const geminiAPI = require('../utils/geminiUtils');

// Add at the top of quizController.js
const quizCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Modify your generateQuiz function
const generateQuiz = async (req, res) => {
    try {
        const { category, count = 15, difficulty = 'medium', date, language = 'english' } = req.body;

        // Validate required fields
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        // Create cache key
        const cacheKey = `${category}-${count}-${difficulty}-${language}`;
        
        // Check cache first
        if (quizCache.has(cacheKey)) {
            const cached = quizCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log(`✅ Returning cached ${category} quiz`);
                return res.status(200).json({
                    success: true,
                    questions: cached.questions,
                    count: cached.questions.length,
                    source: 'cache',
                    message: `Successfully loaded ${cached.questions.length} questions from cache`
                });
            } else {
                quizCache.delete(cacheKey);
            }
        }

        const today = new Date();
        const context = date || { 
            month: today.getMonth() + 1, 
            day: today.getDate() 
        };

        console.log(`🚀 Generating ${count} ${difficulty} ${category} quiz questions...`);

        // Call Gemini API - this will throw if it fails
        const questions = await geminiAPI.generateQuiz(category, count, difficulty, context);

        // Validate that we got questions
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            throw new Error('No questions were generated');
        }

        // Save questions to database
        const savedQuestions = [];
        for (const q of questions) {
            try {
                // Format options correctly - add isCorrect flag
                const formattedOptions = q.options.map((opt, idx) => ({
                    text: typeof opt === 'object' ? opt.text : opt,
                    textAmharic: opt.textAmharic || '',
                    isCorrect: idx === q.correctAnswer
                }));

                const quiz = new Quiz({
                    question: q.question,
                    questionAmharic: q.questionAmharic || '',
                    options: formattedOptions,
                    category: q.category || category,
                    difficulty: q.difficulty || difficulty,
                    explanation: q.explanation || 'No explanation provided',
                    explanationAmharic: q.explanationAmharic || '',
                    saint: q.saint || '',
                    feastDay: q.feastDay || { month: 1, day: 1 },
                    reference: q.reference || '',
                    book: q.book || '',
                    source: 'gemini',
                    metadata: { 
                        ...context, 
                        language,
                        generatedAt: new Date()
                    }
                });
                
                await quiz.save();
                savedQuestions.push(quiz);
            } catch (saveError) {
                console.error('Error saving individual question:', saveError);
                // Continue saving other questions even if one fails
            }
        }

        // Check if we saved any questions
        if (savedQuestions.length === 0) {
            throw new Error('Failed to save any questions to database');
        }

        console.log(`✅ Successfully saved ${savedQuestions.length} questions`);

        // Store in cache
        quizCache.set(cacheKey, {
            questions: savedQuestions,
            timestamp: Date.now()
        });

        // Return success response
        res.status(201).json({
            success: true,
            questions: savedQuestions,
            count: savedQuestions.length,
            source: 'gemini',
            message: `Successfully generated ${savedQuestions.length} questions`
        });

    } catch (error) {
        console.error('❌ Quiz generation error:', error);
        
        // Return 500 error with details
        res.status(500).json({
            success: false,
            message: 'Failed to generate quiz',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
// Get quiz questions by category
const getQuizQuestions = async (req, res) => {
    try {
        const { category, difficulty, limit = 15 } = req.query;
        
        const query = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        
        const questions = await Quiz.find(query)
            .sort({ usedCount: 1, createdAt: -1 })
            .limit(parseInt(limit));
        
        if (!questions || questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No questions found for the specified criteria'
            });
        }
        
        res.json({
            success: true,
            questions,
            count: questions.length
        });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quiz questions',
            error: error.message
        });
    }
};

// Submit quiz attempt
const submitQuizAttempt = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const { answers, score, totalQuestions, timeSpent, category } = req.body;
        
        // Validate required fields
        if (!answers || score === undefined || !totalQuestions || !category) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['answers', 'score', 'totalQuestions', 'category']
            });
        }

        // Validate data types
        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Answers must be an array'
            });
        }

        const attempt = new QuizAttempt({
            userId: req.user.id,
            answers: answers.map(a => ({
                questionId: a.questionId,
                selectedOption: a.selectedOption,
                isCorrect: a.isCorrect,
                timeSpent: a.timeSpent || 0
            })),
            score: parseInt(score),
            totalQuestions: parseInt(totalQuestions),
            timeSpent: parseInt(timeSpent) || 0,
            category,
            completedAt: new Date()
        });
        
        await attempt.save();
        
        // Update used count for questions (non-critical, don't fail if this errors)
        try {
            for (const answer of answers) {
                if (answer.questionId) {
                    await Quiz.findByIdAndUpdate(answer.questionId, {
                        $inc: { usedCount: 1 }
                    });
                }
            }
        } catch (updateError) {
            console.warn('Warning: Could not update question counts:', updateError.message);
            // Continue - this is not critical
        }
        
        res.status(201).json({
            success: true,
            attempt,
            message: 'Quiz attempt saved successfully'
        });
        
    } catch (error) {
        console.error('Error submitting quiz attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit quiz attempt',
            error: error.message
        });
    }
};

// Get user's quiz history
const getQuizHistory = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const { limit = 50, category } = req.query;
        
        const query = { userId: req.user.id };
        if (category) query.category = category;
        
        const attempts = await QuizAttempt.find(query)
            .sort({ completedAt: -1 })
            .limit(parseInt(limit));
        
        // Calculate statistics
        const stats = {
            totalAttempts: attempts.length,
            averageScore: attempts.length > 0 
                ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length 
                : 0,
            bestScore: attempts.length > 0 
                ? Math.max(...attempts.map(a => a.score)) 
                : 0,
            byCategory: {}
        };
        
        // Group by category
        attempts.forEach(attempt => {
            if (!stats.byCategory[attempt.category]) {
                stats.byCategory[attempt.category] = {
                    count: 0,
                    totalScore: 0
                };
            }
            stats.byCategory[attempt.category].count++;
            stats.byCategory[attempt.category].totalScore += attempt.score;
        });
        
        res.json({
            success: true,
            attempts,
            stats,
            count: attempts.length
        });
        
    } catch (error) {
        console.error('Error fetching quiz history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quiz history',
            error: error.message
        });
    }
};

module.exports = {
    generateQuiz,
    getQuizQuestions,
    submitQuizAttempt,
    getQuizHistory
};
