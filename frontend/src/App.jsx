import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import DateConverter from './components/DateConverter';
import Calendar from './components/Calendar';
import Synaxarium from './components/Synaxarium';
import Gizae from './components/Gizae';
import HolidayCalculator from './components/HolidayCalculator';
import Footer from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';
import { FontProvider } from './contexts/FontContext';
import './App.css';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <FontProvider>
                    <div className="App">
                        <Header />
                            
                            <Routes>
                                {/* Home Route */}
                                <Route path="/" element={
                                    <>
                                        <Hero />
                                        <div className="main-container home-features-wrapper">
                                            <div className="features-heading">
                                                <div>
                                                    <p className="features-eyebrow">EXPLORE</p>
                                                    <h2>Everything for your day</h2>
                                                </div>
                                                <p>Tradition, dates, and daily readings, together.</p>
                                            </div>
                                            <section className="feature-grid">
                                                <Link to="/calendar" className="feature-card">
                                                    <span className="feature-icon"><i className="fas fa-calendar-alt" aria-hidden="true" /></span>
                                                    <span className="feature-card-content"><h3>Calendar</h3><p>Browse the Ethiopian months and daily observances.</p><span className="feature-card-link">Open calendar <span aria-hidden="true">→</span></span></span>
                                                </Link>
                                                <Link to="/converter" className="feature-card">
                                                    <span className="feature-icon"><i className="fas fa-exchange-alt" aria-hidden="true" /></span>
                                                    <span className="feature-card-content"><h3>Date converter</h3><p>Move between Ethiopian and Gregorian dates.</p><span className="feature-card-link">Convert a date <span aria-hidden="true">→</span></span></span>
                                                </Link>
                                                <Link to="/synaxarium" className="feature-card">
                                                    <span className="feature-icon"><i className="fas fa-book-open" aria-hidden="true" /></span>
                                                    <span className="feature-card-content"><h3>Synaxarium</h3><p>Discover the saints commemorated each day.</p><span className="feature-card-link">Read today <span aria-hidden="true">→</span></span></span>
                                                </Link>
                                                <Link to="/gizae" className="feature-card">
                                                    <span className="feature-icon"><i className="fas fa-scroll" aria-hidden="true" /></span>
                                                    <span className="feature-card-content"><h3>Gizae</h3><p>Find daily liturgical readings and scripture.</p><span className="feature-card-link">Explore readings <span aria-hidden="true">→</span></span></span>
                                                </Link>
                                                <Link to="/holidays" className="feature-card">
                                                    <span className="feature-icon"><i className="fas fa-star" aria-hidden="true" /></span>
                                                    <span className="feature-card-content"><h3>Feast days</h3><p>Look up annual feasts and celebration dates.</p><span className="feature-card-link">View holidays <span aria-hidden="true">→</span></span></span>
                                                </Link>
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
                                
                            </Routes>
                            <Footer />
                    </div>
                </FontProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
