import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import DateConverter from './components/DateConverter';
import Calendar from './components/Calendar';
import Synaxarium from './components/Synaxarium';
import Gizae from './components/Gizae';
import HolidayCalculator from './components/HolidayCalculator';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import UserPanel from './components/UserPanel';
import AuthModal from './components/AuthModal';
import Quiz from './components/Quiz';
import Chat from './components/Chat/Chat';
import OAuthRedirect from './pages/OAuthRedirect';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FontProvider } from './contexts/FontContext';
import './App.css';

function App() {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [selectedQuizCategory, setSelectedQuizCategory] = useState(null);

    const handleQuizStart = (category) => {
        setSelectedQuizCategory(category);
        setActiveQuiz(true);
    };

    const handleQuizClose = () => {
        setActiveQuiz(false);
        setSelectedQuizCategory(null);
    };

    return (
        <Router>
            <ThemeProvider>
                <FontProvider>
                    <AuthProvider>
                        <div className="App">
                            <Header />
                            <UserPanel />
                            <AuthModal />
                            
                            <Routes>
                                <Route path="/oauth-redirect" element={<OAuthRedirect />} />
                                <Route path="/login" element={<Navigate to="/" />} />
                                
                                {/* Home Route - Only Hero and Quiz Cards */}
                                <Route path="/" element={
                                    <>
                                        <Hero />
                                        <div className="main-container">
                                            <section id="quiz" className="quiz-cards-section">
                                                <h2 className="section-title">
                                                    <i className="fas fa-question-circle"></i> 
                                                    Test Your Knowledge
                                                </h2>
                                                <p className="section-subtitle">Choose a quiz to test your understanding of Ethiopian Orthodox traditions</p>
                                                
                                                <div className="quiz-cards-grid">
                                                    {/* Synaxarium Quiz Card */}
                                                    <div className="quiz-card" onClick={() => handleQuizStart('synaxarium')}>
                                                        <div className="quiz-card-icon">
                                                            <i className="fas fa-church"></i>
                                                        </div>
                                                        <h3>Synaxarium Quiz</h3>
                                                        <p>Test your knowledge of saints and their commemorations</p>
                                                        <div className="quiz-card-meta">
                                                            <span><i className="fas fa-question-circle"></i> 15 Questions</span>
                                                            <span><i className="fas fa-clock"></i> 5 mins</span>
                                                        </div>
                                                        <div className="quiz-card-difficulty">
                                                            <span className="difficulty-badge medium">Medium</span>
                                                        </div>
                                                        <button className="quiz-card-btn">
                                                            Start Quiz <i className="fas fa-arrow-right"></i>
                                                        </button>
                                                    </div>

                                                    {/* Gizae Quiz Card */}
                                                    <div className="quiz-card" onClick={() => handleQuizStart('gizae')}>
                                                        <div className="quiz-card-icon">
                                                            <i className="fas fa-bible"></i>
                                                        </div>
                                                        <h3>Gizae Quiz</h3>
                                                        <p>Test your knowledge of daily readings and scriptures</p>
                                                        <div className="quiz-card-meta">
                                                            <span><i className="fas fa-question-circle"></i> 15 Questions</span>
                                                            <span><i className="fas fa-clock"></i> 5 mins</span>
                                                        </div>
                                                        <div className="quiz-card-difficulty">
                                                            <span className="difficulty-badge easy">Easy</span>
                                                        </div>
                                                        <button className="quiz-card-btn">
                                                            Start Quiz <i className="fas fa-arrow-right"></i>
                                                        </button>
                                                    </div>

                                                    {/* Holidays Quiz Card */}
                                                    <div className="quiz-card" onClick={() => handleQuizStart('holidays')}>
                                                        <div className="quiz-card-icon">
                                                            <i className="fas fa-calendar-alt"></i>
                                                        </div>
                                                        <h3>Holidays Quiz</h3>
                                                        <p>Test your knowledge of Ethiopian Orthodox holidays</p>
                                                        <div className="quiz-card-meta">
                                                            <span><i className="fas fa-question-circle"></i> 15 Questions</span>
                                                            <span><i className="fas fa-clock"></i> 5 mins</span>
                                                        </div>
                                                        <div className="quiz-card-difficulty">
                                                            <span className="difficulty-badge hard">Hard</span>
                                                        </div>
                                                        <button className="quiz-card-btn">
                                                            Start Quiz <i className="fas fa-arrow-right"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </>
                                } />
                                
                                {/* Individual Page Routes */}
                                <Route path="/converter" element={
                                    <div className="main-container">
                                        <DateConverter />
                                    </div>
                                } />
                                
                                <Route path="/calendar" element={
                                    <div className="main-container">
                                        <Calendar />
                                    </div>
                                } />
                                
                                <Route path="/synaxarium" element={
                                    <div className="main-container">
                                        <Synaxarium />
                                    </div>
                                } />
                                
                                <Route path="/gizae" element={
                                    <div className="main-container">
                                        <Gizae />
                                    </div>
                                } />
                                
                                <Route path="/holidays" element={
                                    <div className="main-container">
                                        <HolidayCalculator />
                                    </div>
                                } />
                                
                                <Route path="/gallery" element={
                                    <div className="main-container">
                                        <Gallery />
                                    </div>
                                } />
                                
                                <Route path="/chat" element={
                                    <div className="main-container">
                                        <Chat />
                                    </div>
                                } />
                                
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                            <Footer />

                            {/* Quiz Modal */}
                            {activeQuiz && selectedQuizCategory && (
                                <Quiz 
                                    category={selectedQuizCategory}
                                    onClose={handleQuizClose}
                                />
                            )}
                        </div>
                    </AuthProvider>
                </FontProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
