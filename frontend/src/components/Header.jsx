import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import './styles/Header.css';

const Header = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { currentUser, setShowAuthModal } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const handleClickOutside = (e) => {
            if (!e.target.closest('.nav-item')) {
                setActiveDropdown(null);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Apply light/dark mode class to body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    }, [isDarkMode]);

    const toggleDropdown = (dropdown) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                {/* Logo */}
                <div className="logo-wrapper">
                    <a href="/#home" className="logo">
                        <div className="logo-icon">⛪</div>
                        <div className="logo-text-wrapper">
                            <span className="logo-text-primary">ኢትዮጵያ ቀን መቁጠሪያ</span>
                            <span className="logo-text-secondary">Ethiopian Calendar</span>
                        </div>
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Navigation */}
                <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <ul className="nav-list">
                        {/* Home */}
                        <li className="nav-item">
                            <a href="/#home" className="nav-link" onClick={closeMobileMenu}>
                                <i className="fas fa-home"></i>
                                <span>Home</span>
                            </a>
                        </li>

                        {/* Books Dropdown */}
                        <li className={`nav-item dropdown ${activeDropdown === 'books' ? 'active' : ''}`}>
                            <button 
                                className="nav-link dropdown-toggle"
                                onClick={() => toggleDropdown('books')}
                            >
                                <i className="fas fa-book"></i>
                                <span>Books</span>
                                <i className="fas fa-chevron-down dropdown-arrow"></i>
                            </button>
                            <div className="dropdown-menu">
                                <a href="/#synaxarium" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">⛪</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Synaxarium</span>
                                        <span className="dropdown-subtitle">ስንክሳር</span>
                                    </div>
                                </a>
                                <a href="/#gizae" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">📖</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Gizae</span>
                                        <span className="dropdown-subtitle">ግጻዊ</span>
                                    </div>
                                </a>
                                <a href="/#gallery" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">🖼️</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Gallery</span>
                                        <span className="dropdown-subtitle">ምስሎች</span>
                                    </div>
                                </a>
                            </div>
                        </li>

                        {/* Tools Dropdown - Updated with Quiz */}
                        <li className={`nav-item dropdown ${activeDropdown === 'tools' ? 'active' : ''}`}>
                            <button 
                                className="nav-link dropdown-toggle"
                                onClick={() => toggleDropdown('tools')}
                            >
                                <i className="fas fa-tools"></i>
                                <span>Tools</span>
                                <i className="fas fa-chevron-down dropdown-arrow"></i>
                            </button>
                            <div className="dropdown-menu">
                                <a href="/#calendar" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">📅</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Calendar</span>
                                        <span className="dropdown-subtitle">የወሩ መቁጠሪያ</span>
                                    </div>
                                </a>
                                <a href="/#converter" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">🔄</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Date Converter</span>
                                        <span className="dropdown-subtitle">ቀን መቀየሪያ</span>
                                    </div>
                                </a>
                                <a href="/#holidays" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">🎉</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Holiday Calculator</span>
                                        <span className="dropdown-subtitle">የባሕረ ሀሳብ በዓላት</span>
                                    </div>
                                </a>
                                {/* New Quiz Link */}
                                <a href="/#quiz" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">❓</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Quiz</span>
                                        <span className="dropdown-subtitle">ፈተና</span>
                                    </div>
                                </a>
                            </div>
                        </li>

                        {/* Community Link */}
                        <li className="nav-item">
                            <a href="/#chat" className="nav-link" onClick={closeMobileMenu}>
                                <i className="fas fa-users"></i>
                                <span>Community</span>
                            </a>
                        </li>
                    </ul>

                    {/* Mobile User Controls */}
                    <div className="mobile-user-controls">
                        <button className="theme-toggle-mobile" onClick={toggleTheme}>
                            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <button 
                            className="auth-toggle-mobile"
                            onClick={() => {
                                currentUser ? document.getElementById('user-panel')?.classList.toggle('active') : setShowAuthModal(true);
                                closeMobileMenu();
                            }}
                        >
                            <i className="fas fa-user-circle"></i>
                            <span>{currentUser ? 'Profile' : 'Sign In'}</span>
                        </button>
                    </div>
                </nav>

                {/* Desktop User Controls */}
                <div className="user-controls">
                    <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                        <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
                    </button>
                    <div 
                        className="user-avatar" 
                        onClick={() => currentUser ? document.getElementById('user-panel')?.classList.toggle('active') : setShowAuthModal(true)}
                        title={currentUser ? 'User Profile' : 'Sign In'}
                    >
                        {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt={currentUser.username} />
                        ) : (
                            <i className="fas fa-user"></i>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;