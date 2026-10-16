import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import DateConverter from './components/DateConverter';
import Calendar from './components/Calendar';
import Synaxarium from './components/Synaxarium';
import Gizae from './components/Gizae';
import HolidayCalculator from './components/HolidayCalculator';
import GeezNumeralConverter from './components/GeezNumeralConverter';
import { FontProvider } from './contexts/FontContext';
import './App.css';

function HomeFeatures() {
    const featureTrackRef = useRef(null);

    useEffect(() => {
        const track = featureTrackRef.current;
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );

        if (!track) {
            return undefined;
        }

        let isTouching = false;
        let isFocused = false;

        const advanceTrack = () => {
            if (isTouching || isFocused || document.hidden) {
                return;
            }

            const cards = Array.from(track.children);
            if (cards.length < 2) {
                return;
            }

            const currentIndex = cards.reduce(
                (nearestIndex, card, index) => {
                    const nearestCard = cards[nearestIndex];
                    const nearestLeft =
                        nearestCard.getBoundingClientRect().left -
                        track.getBoundingClientRect().left +
                        track.scrollLeft;
                    const cardLeft =
                        card.getBoundingClientRect().left -
                        track.getBoundingClientRect().left +
                        track.scrollLeft;

                    return Math.abs(cardLeft - track.scrollLeft) <
                        Math.abs(nearestLeft - track.scrollLeft)
                        ? index
                        : nearestIndex;
                },
                0
            );
            const nextIndex = (currentIndex + 1) % cards.length;
            const nextCard = cards[nextIndex];
            const nextLeft =
                nextCard.getBoundingClientRect().left -
                track.getBoundingClientRect().left +
                track.scrollLeft;

            track.scrollTo({
                left: nextLeft,
                behavior: reducedMotion.matches ? 'auto' : 'smooth'
            });
        };

        const handleTouchStart = () => {
            isTouching = true;
        };
        const handleTouchEnd = () => {
            isTouching = false;
        };
        const handleFocusIn = () => {
            isFocused = true;
        };
        const handleFocusOut = (event) => {
            if (!track.contains(event.relatedTarget)) {
                isFocused = false;
            }
        };

        const intervalId = window.setInterval(advanceTrack, 4000);

        track.addEventListener('touchstart', handleTouchStart, {
            passive: true
        });
        track.addEventListener('touchend', handleTouchEnd);
        track.addEventListener('touchcancel', handleTouchEnd);
        track.addEventListener('focusin', handleFocusIn);
        track.addEventListener('focusout', handleFocusOut);

        return () => {
            window.clearInterval(intervalId);
            track.removeEventListener('touchstart', handleTouchStart);
            track.removeEventListener('touchend', handleTouchEnd);
            track.removeEventListener('touchcancel', handleTouchEnd);
            track.removeEventListener('focusin', handleFocusIn);
            track.removeEventListener('focusout', handleFocusOut);
        };
    }, []);

    return (
        <div className="main-container home-features-wrapper">
            <div className="features-heading">
                <div>
                    <p className="features-eyebrow">EXPLORE</p>
                    <h2>Everything for your day</h2>
                </div>
            </div>
            <section
                className="feature-grid"
                ref={featureTrackRef}
                aria-label="Explore calendar features"
            >
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
    );
}

function HomePage() {
    useEffect(() => {
        document.body.classList.add('home-page-active');

        return () => {
            document.body.classList.remove('home-page-active');
        };
    }, []);

    return (
        <main className="home-page">
            <Hero />
            <HomeFeatures />
        </main>
    );
}

function App() {
    return (
        <Router>
            <FontProvider>
                <div className="App">
                    <Header />
                    <Routes>
                        {/* Home Route */}
                        <Route path="/" element={<HomePage />} />

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

                        <Route path="/geez-numerals" element={
                            <div className="main-container">
                                <GeezNumeralConverter />
                            </div>
                        } />
                    </Routes>
                </div>
            </FontProvider>
        </Router>
    );
}

export default App;
