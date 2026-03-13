import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { NavHashLink } from 'react-router-hash-link'; // Linkን እዚህ ጋር አስገባን
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
                {/* Logo - NavHashLink ተጠቀምን */}
                <div className="logo-wrapper">
                    <NavHashLink smooth to="/#home" className="logo">
                        <div className="logo-icon">⛪</div>
                        <div className="logo-text-wrapper">
                            <span className="logo-text-primary">ኢትዮጵያ ቀን መቁጠሪያ</span>
                            <span className="logo-text-secondary">Ethiopian Calendar</span>
                        </div>
                    </NavHashLink>
                </div>

                <button 
                    className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span><span></span><span></span>
                </button>

                <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <ul className="nav-list">
                        <li className="nav-item">
                            <NavHashLink smooth to="/#home" className="nav-link" onClick={closeMobileMenu}>
                                <i className="fas fa-home"></i>
                                <span>Home</span>
                            </NavHashLink>
                        </li>

                        {/* Books Dropdown */}
                        <li className={`nav-item dropdown ${activeDropdown === 'books' ? 'active' : ''}`}>
                            <button className="nav-link dropdown-toggle" onClick={() => toggleDropdown('books')}>
                                <i className="fas fa-book"></i>
                                <span>Books</span>
                                <i className="fas fa-chevron-down dropdown-arrow"></i>
                            </button>
                            <div className="dropdown-menu">
                                <NavHashLink smooth to="/#synaxarium" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">⛪</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Synaxarium</span>
                                        <span className="dropdown-subtitle">ስንክሳር</span>
                                    </div>
                                </NavHashLink>
                                <NavHashLink smooth to="/#gizae" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">📖</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Gizae</span>
                                        <span className="dropdown-subtitle">ግጻዊ</span>
                                    </div>
                                </NavHashLink>
                            </div>
                        </li>

                        {/* Tools Dropdown */}
                        <li className={`nav-item dropdown ${activeDropdown === 'tools' ? 'active' : ''}`}>
                            <button className="nav-link dropdown-toggle" onClick={() => toggleDropdown('tools')}>
                                <i className="fas fa-tools"></i>
                                <span>Tools</span>
                                <i className="fas fa-chevron-down dropdown-arrow"></i>
                            </button>
                            <div className="dropdown-menu">
                                <NavHashLink smooth to="/#calendar" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">📅</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Calendar</span>
                                        <span className="dropdown-subtitle">የወሩ መቁጠሪያ</span>
                                    </div>
                                </NavHashLink>
                                <NavHashLink smooth to="/#converter" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">🔄</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Date Converter</span>
                                        <span className="dropdown-subtitle">ቀን መቀየሪያ</span>
                                    </div>
                                </NavHashLink>
                                <NavHashLink smooth to="/#quiz" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">❓</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Quiz</span>
                                        <span className="dropdown-subtitle">ፈተና</span>
                                    </div>
                                </NavHashLink>
                            </div>
                        </li>

                        <li className="nav-item">
                            <NavHashLink smooth to="/#chat" className="nav-link" onClick={closeMobileMenu}>
                                <i className="fas fa-users"></i>
                                <span>Community</span>
                            </NavHashLink>
                        </li>
                    </ul>
                    {/* ... (Mobile User Controls - Use same logic if needed) */}
                </nav>

                <div className="user-controls">
                    <button className="theme-toggle" onClick={toggleTheme}>
                        <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
                    </button>
                    <div className="user-avatar" onClick={() => currentUser ? document.getElementById('user-panel')?.classList.toggle('active') : setShowAuthModal(true)}>
                        {currentUser?.avatar ? <img src={currentUser.avatar} alt="User" /> : <i className="fas fa-user"></i>}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
