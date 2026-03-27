import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gcToEth, ethiopianMonths, toEthNum, gregorianMonths, dayNames, englishDays } from '../utils/calendarUtils';

const Hero = () => {
    const [currentDate, setCurrentDate] = useState({
        ethiopian: '',
        gregorian: '',
        dayName: ''
    });

    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            const { year: eYear, month: eMonth, day: eDay } = gcToEth(now);

            setCurrentDate({
                ethiopian: `${ethiopianMonths[eMonth - 1]} ${toEthNum(eDay)}, ${toEthNum(eYear)} እ.ኢ.አ.`,
                gregorian: `${gregorianMonths[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} G.C.`,
                dayName: `${dayNames[now.getDay()]} (${englishDays[now.getDay()]})`
            });
        };

        updateDate();
        const interval = setInterval(updateDate, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero" id="home">
            <div className="hero-parallax"></div>
            <div className="hero-overlay"></div>
            <div className="hero-glow"></div>
            
            {/* Decorative crosses */}
            <div className="hero-cross hero-cross-1">✝</div>
            <div className="hero-cross hero-cross-2">✝</div>
            
            <div className="hero-content">
                <h1>የኢትዮጵያ ቀን መቁጠሪያ</h1>
                <p className="hero-subtitle">Ethiopian Calendar & Synaxarium</p>
                
                <div className="current-date">
                    <div className="ethiopian-date">{currentDate.ethiopian}</div>
                    <div className="gregorian-date">{currentDate.gregorian}</div>
                    <div className="day-name">{currentDate.dayName}</div>
                </div>

                {/* Website Description */}
                <div className="hero-description-wrapper">
                    <p className="hero-description">
                        <span className="description-amharic">
                            የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን ቀን መቁጠሪያ፣ ስንክሳር፣ ግጻዌ በዓላትን እና መንፈሳዊ እውቀትን በዘመናዊ መንገድ ያቀርብልዎታል። ትክክለኛ የቀን መቀየሪያ፣ የቅዱሳን ታሪኮች፣ የዕለቱ ንባቦች እና መንፈሳዊ ፈተናዎችን ያገኛሉ።
                        </span>
                        <br />
                        <span className="description-english">
                            Your complete spiritual companion for Ethiopian Orthodox Tewahedo Church traditions. Access accurate calendar conversion, daily Synaxarium readings, liturgical schedules, holiday calculations, and deepen your faith through spiritual quizzes. Join our community to share and grow together in faith.
                        </span>
                    </p>
                    
                    {/* CTA Button */}
                    <div className="hero-cta">
                        <Link to="/calendar" className="cta-button primary">
                            <i className="fas fa-calendar-alt"></i>
                            <span>Explore Tools</span>
                        </Link>
                        <Link to="/quiz" className="cta-button secondary">
                            <i className="fas fa-question-circle"></i>
                            <span>Take a Quiz</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
