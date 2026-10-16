
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    gcToEth,
    toEthNum,
    gregorianMonths
} from '../utils/calendarUtils';
import './styles/Hero.css';

const ETHIOPIA_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    calendar: 'gregory',
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
});
const ETHIOPIAN_LABEL_FORMATTER = new Intl.DateTimeFormat('am-ET-u-ca-ethiopic', {
    timeZone: 'Africa/Addis_Ababa',
    weekday: 'long',
    month: 'long'
});
const GREGORIAN_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Addis_Ababa',
    weekday: 'long'
});

const Hero = () => {
    const [installPrompt, setInstallPrompt] = useState(null);

    const [isInstalled, setIsInstalled] = useState(() => (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone
    ));

    const [isIOS] = useState(() =>
        /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
        !window.MSStream
    );

    const [showInstallHelp, setShowInstallHelp] = useState(false);

    const [currentDate, setCurrentDate] = useState({
        ethiopianDay: '',
        ethiopianMonth: '',
        ethiopianYear: '',
        gregorian: '',
        ethiopianWeekday: '',
        gregorianWeekday: ''
    });

    // PWA installation events
    useEffect(() => {
        const handleInstallPrompt = (event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };

        const handleInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener(
            'beforeinstallprompt',
            handleInstallPrompt
        );

        window.addEventListener('appinstalled', handleInstalled);

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleInstallPrompt
            );

            window.removeEventListener(
                'appinstalled',
                handleInstalled
            );
        };
    }, []);

    // Update Ethiopian and Gregorian dates
    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            const dateParts = ETHIOPIA_DATE_FORMATTER.formatToParts(now);
            const ethiopianLabels = Object.fromEntries(
                ETHIOPIAN_LABEL_FORMATTER.formatToParts(now)
                    .filter(({ type }) => ['month', 'weekday'].includes(type))
                    .map(({ type, value }) => [type, value])
            );
            const ethiopiaDateParts = Object.fromEntries(
                dateParts
                    .filter(({ type }) => ['year', 'month', 'day'].includes(type))
                    .map(({ type, value }) => [type, Number(value)])
            );
            const { year, month, day } = ethiopiaDateParts;
            const gregorianDate = new Date(year, month - 1, day);

            const {
                year: eYear,
                day: eDay
            } = gcToEth(gregorianDate);

            setCurrentDate({
                ethiopianDay: toEthNum(eDay),
                ethiopianMonth: ethiopianLabels.month,
                ethiopianYear: toEthNum(eYear),
                gregorian: `${gregorianMonths[month - 1]} ${day}, ${year}`,
                ethiopianWeekday: ethiopianLabels.weekday,
                gregorianWeekday: GREGORIAN_WEEKDAY_FORMATTER.format(now)
            });
        };

        updateDate();

        const interval = setInterval(updateDate, 60000);

        return () => clearInterval(interval);
    }, []);

    // Handle PWA installation
    const handleInstall = async () => {
        if (!installPrompt) {
            setShowInstallHelp(true);
            return;
        }

        await installPrompt.prompt();

        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    return (
        <section className="hero" id="home">
            <div className="hero-backdrop" aria-hidden="true" />

            <div className="hero-content">
                {/* Hero introduction */}
                <div className="hero-copy">
                    <p className="hero-kicker">
                        ETHIOPIAN ORTHODOX TEWAHEDO
                    </p>

                    <h1>
                        Rooted in time.
                        <br />
                        <span>Guided by tradition.</span>
                    </h1>

                    <p className="hero-intro">
                        Explore the Ethiopian calendar, daily
                        commemorations, and liturgical readings
                        in one place.
                    </p>

                    <div className="hero-cta">
                        <Link
                            to="/calendar"
                            className="cta-button primary"
                        >
                            <i
                                className="fas fa-calendar-alt"
                                aria-hidden="true"
                            />
                            <span>Explore the calendar</span>
                        </Link>

                        <Link
                            to="/converter"
                            className="hero-text-link"
                        >
                            Convert a date
                            <span aria-hidden="true">→</span>
                        </Link>

                        {!isInstalled && (
                            <button
                                type="button"
                                className="install-app-button"
                                onClick={handleInstall}
                            >
                                <i
                                    className="fas fa-download"
                                    aria-hidden="true"
                                />
                                <span>Install app</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Today in Ethiopia — redesigned date card */}
                <aside
                    className="current-date"
                    aria-label="Today's date"
                >
                    <div className="date-card-heading">
                        <span className="date-card-title">
                            <span
                                className="date-indicator"
                                aria-hidden="true"
                            />
                            <span className="date-card-title-text">
                                Today in Ethiopia
                            </span>
                        </span>

                        <span className="date-card-tag">
                            ETHIOPIAN
                            <br />
                            CALENDAR
                        </span>
                    </div>

                    <div className="date-card-primary">
                        <span className="ethiopian-day-number">
                            {currentDate.ethiopianDay}
                        </span>

                        <div className="ethiopian-date-detail">
                            <span className="ethiopian-month">
                                {currentDate.ethiopianMonth}
                            </span>

                            <span className="ethiopian-year">
                                {currentDate.ethiopianYear} ዓ.ም.
                            </span>
                        </div>
                    </div>

                    <div className="date-weekday-row">
                        <span className="date-weekday-amharic">
                            {currentDate.ethiopianWeekday}
                        </span>

                        <span className="date-weekday-english">
                            {currentDate.gregorianWeekday}
                        </span>
                    </div>

                    <div className="date-equivalent">
                        <span className="date-equivalent-label">
                            GREGORIAN EQUIVALENT
                        </span>

                        <span className="date-equivalent-value">
                            {currentDate.gregorian}
                        </span>
                    </div>

                    <Link
                        to="/converter"
                        className="date-convert-link"
                    >
                        <span>Convert another date</span>

                        <i
                            className="fas fa-arrow-right"
                            aria-hidden="true"
                        />
                    </Link>
                </aside>
            </div>

            <div className="hero-bottomline" aria-hidden="true">
                <span>CALENDAR</span>
                <span>·</span>
                <span>SYNAXARIUM</span>
                <span>·</span>
                <span>LITURGY</span>
            </div>

            {/* PWA installation help */}
            {showInstallHelp && (
                <div
                    className="hero-install-backdrop"
                    role="presentation"
                    onClick={() => setShowInstallHelp(false)}
                >
                    <section
                        className="hero-install-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="install-help-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="hero-install-close"
                            type="button"
                            aria-label="Close install instructions"
                            onClick={() => setShowInstallHelp(false)}
                        >
                            ×
                        </button>

                        <h2 id="install-help-title">
                            Install Ethiopian Calendar
                        </h2>

                        <p>
                            {isIOS
                                ? 'In Safari, tap Share, then choose “Add to Home Screen”.'
                                : 'Open your browser menu and choose “Install app” or “Add to Home Screen”.'}
                        </p>

                        <button
                            className="hero-install-done"
                            type="button"
                            onClick={() => setShowInstallHelp(false)}
                        >
                            Done
                        </button>
                    </section>
                </div>
            )}
        </section>
    );
};

export default Hero;
