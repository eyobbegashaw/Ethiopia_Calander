import React, { useState, useEffect } from 'react';
import { quizAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './styles/Quiz.css';

const Quiz = ({ category, onClose }) => {
    const { currentUser } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per quiz
    const [quizStarted, setQuizStarted] = useState(false);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        if (quizStarted) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [quizStarted]);

const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    
    const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Quiz generation is taking longer than expected. Please try again.');
    }, 45000); // 45 second timeout
    
    try {
        console.log('Generating quiz for category:', category);
        const response = await quizAPI.generateQuiz({
            category,
            count: 10, // Reduced from 15 to 10 for faster generation
            difficulty: 'medium'
        });
        
        clearTimeout(timeoutId);
        
        console.log('Quiz response:', response.data);
        
        if (response.data && response.data.questions) {
            setQuestions(response.data.questions);
        } else {
            throw new Error('No questions received');
        }
    } catch (err) {
            clearTimeout(timeoutId); // Clear the timeout on error too
            console.error('Error loading quiz:', err);
            
            // Handle different error types
            if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                setError('The quiz generation is taking too long. This might be due to high demand. Please try again in a few moments.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else if (err.response?.status === 401) {
                setError('Please log in to take the quiz.');
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to load quiz questions');
            }
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        loadQuestions();
        setQuizStarted(true);
        setStartTime(Date.now());
    };

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: answerIndex
        });
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, index) => {
            const selectedAnswer = selectedAnswers[index];
            if (selectedAnswer !== undefined) {
                // Check if the selected option is correct by looking at isCorrect flag
                if (q.options[selectedAnswer]?.isCorrect) {
                    correct++;
                }
            }
        });
        return correct;
    };

    const handleSubmitQuiz = async () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        setShowResults(true);

        if (currentUser) {
            try {
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                const answers = Object.entries(selectedAnswers).map(([qIdx, aIdx]) => {
                    const question = questions[parseInt(qIdx)];
                    const isCorrect = question.options[aIdx]?.isCorrect || false;
                    
                    return {
                        questionId: question._id,
                        selectedOption: aIdx,
                        isCorrect: isCorrect,
                        timeSpent: Math.floor(timeSpent / questions.length)
                    };
                });

                await quizAPI.submitAttempt({
                    answers,
                    score: finalScore,
                    totalQuestions: questions.length,
                    timeSpent,
                    category
                });
            } catch (err) {
                console.error('Error saving quiz attempt:', err);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!quizStarted) {
        return (
            <div className="quiz-modal">
                <div className="quiz-container">
                    <div className="quiz-header">
                        <h2>📝 Ethiopian Orthodox Quiz</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    <div className="quiz-start">
                        <div className="quiz-info">
                            <h3>Test Your Knowledge</h3>
                            <p>Category: <strong>{category}</strong></p>
                            <ul>
                                <li>15 multiple choice questions</li>
                                <li>5 minutes time limit</li>
                                <li>Test your knowledge of Ethiopian Orthodox traditions</li>
                            </ul>
                        </div>
                        <button className="start-btn" onClick={startQuiz}>
                            Start Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

// Add this to your Quiz.jsx loading state
if (loading) {
    const elapsedSeconds = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    
    return (
        <div className="quiz-modal">
            <div className="quiz-container">
                <div className="quiz-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Generating quiz questions...</p>
                    <p className="loading-note">
                        {elapsedSeconds < 15 
                            ? "This may take up to 30 seconds" 
                            : "Still working on it... Thanks for your patience!"}
                    </p>
                    <div className="loading-progress">
                        <div 
                            className="loading-bar" 
                            style={{ width: `${Math.min((elapsedSeconds / 30) * 100, 95)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
    if (error) {
        return (
            <div className="quiz-modal">
                <div className="quiz-container">
                    <div className="quiz-error">
                        <i className="fas fa-exclamation-circle"></i>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button onClick={startQuiz}>Try Again</button>
                            <button onClick={onClose}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="quiz-modal">
                <div className="quiz-container">
                    <div className="quiz-error">
                        <i className="fas fa-exclamation-circle"></i>
                        <p>No questions available</p>
                        <button onClick={startQuiz}>Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="quiz-modal">
                <div className="quiz-container">
                    <div className="quiz-results">
                        <h2>Quiz Results</h2>
                        <div className="score-circle">
                            <span className="score-number">{score}</span>
                            <span className="score-total">/{questions.length}</span>
                        </div>
                        <div className="score-percentage">
                            {Math.round((score / questions.length) * 100)}%
                        </div>
                        <div className="result-details">
                            <p>Correct Answers: {score}</p>
                            <p>Incorrect Answers: {questions.length - score}</p>
                            <p>Time Spent: {formatTime(Math.floor((Date.now() - startTime) / 1000))}</p>
                        </div>
                        <div className="result-actions">
                            <button onClick={startQuiz}>Try Again</button>
                            <button onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    
    return (
        <div className="quiz-modal">
            <div className="quiz-container">
                <div className="quiz-header">
                    <h2>Question {currentQuestion + 1}/{questions.length}</h2>
                    <div className="quiz-timer">
                        <i className="fas fa-clock"></i> {formatTime(timeLeft)}
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="quiz-progress">
                    <div 
                        className="progress-bar" 
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>

                <div className="quiz-question">
                    <h3>{currentQ?.question}</h3>
                </div>

                <div className="quiz-options">
                    {currentQ?.options.map((option, index) => (
                        <button
                            key={index}
                            className={`option-btn ${
                                selectedAnswers[currentQuestion] === index ? 'selected' : ''
                            }`}
                            onClick={() => handleAnswerSelect(currentQuestion, index)}
                        >
                            <span className="option-letter">
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className="option-text">{option.text}</span>
                        </button>
                    ))}
                </div>

                <div className="quiz-navigation">
                    <button 
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="nav-btn"
                    >
                        <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    
                    {currentQuestion === questions.length - 1 ? (
                        <button 
                            onClick={handleSubmitQuiz}
                            className="submit-btn"
                            disabled={Object.keys(selectedAnswers).length < questions.length}
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button 
                            onClick={handleNext}
                            className="nav-btn"
                            disabled={selectedAnswers[currentQuestion] === undefined}
                        >
                            Next <i className="fas fa-chevron-right"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quiz;