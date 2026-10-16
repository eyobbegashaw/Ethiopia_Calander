import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './styles/Header.css';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isIOS] = useState(() => /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream);
    const [isInstalled, setIsInstalled] = useState(() => (
        window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    ));
    const [showIOSInstallHelp, setShowIOSInstallHelp] = useState(false);

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
        const handleInstallPrompt = (event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };
        const handleInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        window.addEventListener('appinstalled', handleInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    const toggleDropdown = (dropdown) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    };

    const installApp = async () => {
        setMoreMenuOpen(false);
        if (!installPrompt) {
            setShowIOSInstallHelp(true);
            return;
        }

        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') setInstallPrompt(null);
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                {/* Logo */}
                <div className="logo-wrapper">
                    <Link to="/" className="logo" onClick={closeMobileMenu}>
                        <div className="logo-icon">⛪</div>
                        <div className="logo-text-wrapper">
                            <span className="logo-text-primary">ኢትዮጵያ ቀን መቁጠሪያ</span>
                            <span className="logo-text-secondary">Ethiopian Calendar</span>
                        </div>
                    </Link>
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
                            <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                                <i className="fas fa-home"></i>
                                <span>Home</span>
                            </Link>
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
                                <Link to="/synaxarium" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">⛪</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Synaxarium</span>
                                        <span className="dropdown-subtitle">ስንክሳር</span>
                                    </div>
                                </Link>
                                <Link to="/gizae" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">📖</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Gizae</span>
                                        <span className="dropdown-subtitle">ግጻዊ</span>
                                    </div>
                                </Link>
                            </div>
                        </li>

                        {/* Tools Dropdown */}
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
                                <Link to="/calendar" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">📅</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Calendar</span>
                                        <span className="dropdown-subtitle">የወሩ መቁጠሪያ</span>
                                    </div>
                                </Link>
                                <Link to="/converter" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">🔄</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Date Converter</span>
                                        <span className="dropdown-subtitle">ቀን መቀየሪያ</span>
                                    </div>
                                </Link>
                                <Link to="/holidays" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">🎉</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Holiday Calculator</span>
                                        <span className="dropdown-subtitle">የባሕረ ሀሳብ በዓላት</span>
                                    </div>
                                </Link>
                            </div>
                        </li>

                    </ul>

                </nav>

            </div>
            <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
                <NavLink to="/" end className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={() => setMoreMenuOpen(false)}>
                    <i className="fas fa-home" aria-hidden="true" /><span>Home</span>
                </NavLink>
                <NavLink to="/calendar" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={() => setMoreMenuOpen(false)}>
                    <i className="fas fa-calendar-alt" aria-hidden="true" /><span>Calendar</span>
                </NavLink>
                <NavLink to="/converter" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={() => setMoreMenuOpen(false)}>
                    <i className="fas fa-exchange-alt" aria-hidden="true" /><span>Convert</span>
                </NavLink>
                <NavLink to="/synaxarium" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={() => setMoreMenuOpen(false)}>
                    <i className="fas fa-book-open" aria-hidden="true" /><span>Read</span>
                </NavLink>
                <button className={`mobile-nav-link${moreMenuOpen ? ' active' : ''}`} type="button" aria-expanded={moreMenuOpen} aria-controls="mobile-more-menu" onClick={() => setMoreMenuOpen((open) => !open)}>
                    <i className="fas fa-ellipsis-h" aria-hidden="true" /><span>More</span>
                </button>
                {moreMenuOpen && <div className="mobile-more-menu" id="mobile-more-menu">
                    <NavLink to="/gizae" onClick={() => setMoreMenuOpen(false)}><i className="fas fa-scroll" aria-hidden="true" /> Gizae readings</NavLink>
                    <NavLink to="/holidays" onClick={() => setMoreMenuOpen(false)}><i className="fas fa-star" aria-hidden="true" /> Feast days</NavLink>
                    {!isInstalled && (installPrompt || isIOS) && <button type="button" onClick={installApp}>
                        <i className="fas fa-download" aria-hidden="true" /> Install app
                    </button>}
                </div>}
            </nav>
            {showIOSInstallHelp && <div className="ios-install-backdrop" role="presentation" onClick={() => setShowIOSInstallHelp(false)}>
                <section className="ios-install-dialog" role="dialog" aria-modal="true" aria-labelledby="ios-install-title">
                    <button className="ios-install-close" type="button" aria-label="Close install instructions" onClick={() => setShowIOSInstallHelp(false)}>×</button>
                    <h2 id="ios-install-title">Add to Home Screen</h2>
                    <p>In Safari, tap the Share button, then choose <strong>Add to Home Screen</strong>.</p>
                    <button className="ios-install-done" type="button" onClick={() => setShowIOSInstallHelp(false)}>Done</button>
                </section>
            </div>}
        </header>
    );
};

export default Header;
