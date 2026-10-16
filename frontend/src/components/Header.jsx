import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useFont } from '../contexts/FontContext';
import './styles/Header.css';

const Header = () => {
    const { fontSize, decreaseFontSize, increaseFontSize } = useFont();
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
    const [shareStatus, setShareStatus] = useState('');

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

    const shareApp = async () => {
        const shareData = {
            title: 'Ethiopian Calendar',
            text: 'Explore the Ethiopian calendar, readings, and feast days.',
            url: window.location.origin
        };
        setShareStatus('');

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                setShareStatus('Thanks for sharing!');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setShareStatus('Unable to share this app right now.');
                }
            }
            return;
        }

        if (!navigator.clipboard?.writeText) {
            setShareStatus('Sharing and copying links are not available in this browser.');
            return;
        }

        try {
            await navigator.clipboard.writeText(shareData.url);
            setShareStatus('App link copied to clipboard.');
        } catch {
            setShareStatus('Unable to copy the app link. Please copy it from your browser address bar.');
        }
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <div className="mobile-more">
                    <button
                        className={`mobile-more-toggle${moreMenuOpen ? ' active' : ''}`}
                        type="button"
                        aria-label="More options"
                        aria-expanded={moreMenuOpen}
                        aria-controls="mobile-more-menu"
                        onClick={() => setMoreMenuOpen((open) => !open)}
                    >
                        <i className="fas fa-ellipsis-h" aria-hidden="true" />
                    </button>
                    {moreMenuOpen && <div className="mobile-more-menu" id="mobile-more-menu">
                        <div className="font-size-controls" aria-label="Font size controls">
                            <span className="more-menu-label">Font size</span>
                            <div className="font-size-buttons">
                                <button type="button" aria-label="Decrease font size" onClick={decreaseFontSize}>
                                    <i className="fas fa-minus" aria-hidden="true" />
                                </button>
                                <span aria-live="polite">{fontSize}px</span>
                                <button type="button" aria-label="Increase font size" onClick={increaseFontSize}>
                                    <i className="fas fa-plus" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                        <button type="button" onClick={shareApp}>
                            <i className="fas fa-share-alt" aria-hidden="true" /> Share this app
                        </button>
                        <a href="https://eyobbegashawe.vercel.app" target="_blank" rel="noopener noreferrer" onClick={() => setMoreMenuOpen(false)}>
                            <i className="fas fa-user" aria-hidden="true" /> About · Developed by ዲ/ን ኢዮብ በጋሻው
                        </a>
                        {!isInstalled && (installPrompt || isIOS) && <button type="button" onClick={installApp}>
                            <i className="fas fa-download" aria-hidden="true" /> Install app
                        </button>}
                        {shareStatus && <p className="share-status" role="status">{shareStatus}</p>}
                    </div>}
                </div>
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
                                <Link to="/geez-numerals" className="dropdown-item" onClick={closeMobileMenu}>
                                    <span className="dropdown-icon">፩</span>
                                    <div className="dropdown-content">
                                        <span className="dropdown-title">Geez Number Converter</span>
                                        <span className="dropdown-subtitle">ግእዝ ቁጥር</span>
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
                    <i className="fas fa-book-open" aria-hidden="true" /><span>ስንክሳር</span>
                </NavLink>
                <NavLink to="/gizae" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={() => setMoreMenuOpen(false)}>
                    <i className="fas fa-scroll" aria-hidden="true" /><span>ግጻዊ</span>
                </NavLink>
                <NavLink to="/holidays" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={() => setMoreMenuOpen(false)}>
                    <i className="fas fa-star" aria-hidden="true" /><span>ባህረ-ሀሳብ</span>
                </NavLink>
                <NavLink to="/geez-numerals" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={() => setMoreMenuOpen(false)}>
                    <i className="fas fa-calculator" aria-hidden="true" /><span>ግእዝ</span>
                </NavLink>
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
