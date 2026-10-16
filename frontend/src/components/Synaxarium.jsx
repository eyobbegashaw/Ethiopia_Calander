import React, { useState, useEffect } from 'react';
import { toEthNum, ethiopianMonths, gcToEth, isEthLeap } from '../utils/calendarUtils';
import { saintsData } from '../data/saintsData';
import useSpeechPlayback from '../hooks/useSpeechPlayback';
import './styles/Synaxarium.css';

const Synaxarium = () => {
    const todayEth = gcToEth(new Date());
    const [selectedMonth, setSelectedMonth] = useState(todayEth.month);
    const [selectedDay, setSelectedDay] = useState(todayEth.day);
    const [selectedYear, setSelectedYear] = useState(todayEth.year);
    const { activeSpeechId, toggleSpeech } = useSpeechPlayback();

    const daysInMonth = selectedMonth === 13
        ? (isEthLeap(selectedYear) ? 6 : 5)
        : 30;

    useEffect(() => {
        // Listen for calendar day clicks
        const handleShowSaints = (e) => {
            const { month, day, year } = e.detail;
            setSelectedMonth(month);
            setSelectedDay(day);
            if (year) {
                setSelectedYear(year);
            }
            
            // Scroll to synaxarium
            document.getElementById('synaxarium')?.scrollIntoView({ behavior: 'smooth' });
        };
        
        window.addEventListener('showSaintsForDate', handleShowSaints);
        return () => window.removeEventListener('showSaintsForDate', handleShowSaints);
    }, []);

    const changeMonth = (direction) => {
        const nextMonth = selectedMonth + direction;
        const wrappedMonth = nextMonth < 1 ? 13 : nextMonth > 13 ? 1 : nextMonth;
        const nextYear = nextMonth < 1
            ? selectedYear - 1
            : nextMonth > 13
                ? selectedYear + 1
                : selectedYear;
        const nextMonthDays = wrappedMonth === 13
            ? (isEthLeap(nextYear) ? 6 : 5)
            : 30;

        setSelectedMonth(wrappedMonth);
        setSelectedYear(nextYear);
        setSelectedDay(Math.min(selectedDay, nextMonthDays));
    };

    const changeDay = (direction) => {
        if (direction < 0 && selectedDay === 1) {
            const previousMonth = selectedMonth === 1 ? 13 : selectedMonth - 1;
            const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
            const previousMonthDays = previousMonth === 13
                ? (isEthLeap(previousYear) ? 6 : 5)
                : 30;

            setSelectedMonth(previousMonth);
            setSelectedYear(previousYear);
            setSelectedDay(previousMonthDays);
            return;
        }

        if (direction > 0 && selectedDay === daysInMonth) {
            const nextMonth = selectedMonth === 13 ? 1 : selectedMonth + 1;
            setSelectedMonth(nextMonth);
            if (selectedMonth === 13) {
                setSelectedYear(selectedYear + 1);
            }
            setSelectedDay(1);
            return;
        }

        setSelectedDay(selectedDay + direction);
    };

    const shareSaint = async (saint, date) => {
        const name = saint.nameAmharic || saint.name || '';
        const description = saint.descriptionAmharic || saint.description || '';
        const text = `${date}\n${name}\n${description}`;
        const shareData = {
            title: name,
            text,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                window.alert('Saint details copied to clipboard.');
            } else {
                window.alert('Sharing and clipboard access are not supported in this browser.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Unable to share saint details:', error);
                window.alert('Unable to share saint details. Please try again.');
            }
        }
    };

    const renderSaintsList = (saints, date) => {
        if (!saints || saints.length === 0) {
            return (
                <div className="saint-item">
                    <div className="saint-date">{date}</div>
                    <div className="saint-description">
                        ለዚህ ቀን የተመዘገቡ ቅዱሳን የሉም።
                    </div>
                </div>
            );
        }

        return saints.map((saint, index) => {
            const speechId = `synaxarium-${selectedMonth}-${selectedDay}-${saint._id || saint.name || index}`;
            const isSpeaking = activeSpeechId === speechId;
            const name = saint.nameAmharic || saint.name || '';
            const description = saint.descriptionAmharic || saint.description || '';

            return (
            <div key={speechId} className="saint-item">
                <div className="saint-date">{date}</div>
                <div className="saint-name">{saint.nameAmharic || saint.name}</div>
                <div className="saint-description">{saint.descriptionAmharic || saint.description}</div>
                <div className="saint-tags">
                    {saint.category?.map((cat, i) => (
                        <span key={i} className="saint-tag">{cat}</span>
                    ))}
                </div>
                <div className="saint-actions">
                    <button
                        type="button"
                        className="saint-action-button"
                        onClick={() => toggleSpeech(speechId, `${name}. ${description}`)}
                        aria-label={`${isSpeaking ? 'Stop audio for' : 'Listen to'} ${name}`}
                        aria-pressed={isSpeaking}
                        title={isSpeaking ? 'Stop audio' : 'Listen'}
                    >
                        <i className={`fas ${isSpeaking ? 'fa-stop' : 'fa-volume-up'}`} aria-hidden="true" />
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                    </button>
                    <button
                        type="button"
                        className="saint-action-button"
                        onClick={() => shareSaint(saint, date)}
                        aria-label={`Share ${saint.nameAmharic || saint.name}`}
                        title="Share"
                    >
                        <i className="fas fa-share-alt" aria-hidden="true" />
                        <span>Share</span>
                    </button>
                </div>
            </div>
            );
        });
    };

    return (
        <section className="card" id="synaxarium">
            <h2 className="section-title">ስንክሳር - Orthodox Synaxarium</h2>
            
            <div className="synaxarium-controls">
                <div className="control-group">
                    <div className="date-stepper" role="group" aria-label="Select Ethiopian month">
                        <button
                            type="button"
                            className="stepper-arrow"
                            onClick={() => changeMonth(-1)}
                            aria-label="Previous Ethiopian month"
                        >
                            <i className="fas fa-chevron-left" aria-hidden="true" />
                        </button>
                        <span className="stepper-value" aria-live="polite">
                            {ethiopianMonths[selectedMonth - 1]}
                        </span>
                        <button
                            type="button"
                            className="stepper-arrow"
                            onClick={() => changeMonth(1)}
                            aria-label="Next Ethiopian month"
                        >
                            <i className="fas fa-chevron-right" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div className="control-group">
                    <div className="date-stepper" role="group" aria-label="Select Ethiopian day">
                        <button
                            type="button"
                            className="stepper-arrow"
                            onClick={() => changeDay(-1)}
                            aria-label="Previous day"
                        >
                            <i className="fas fa-chevron-left" aria-hidden="true" />
                        </button>
                        <span className="stepper-value" aria-live="polite">
                            {toEthNum(selectedDay)}
                        </span>
                        <button
                            type="button"
                            className="stepper-arrow"
                            onClick={() => changeDay(1)}
                            aria-label="Next day"
                        >
                            <i className="fas fa-chevron-right" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="saints-list">
                {renderSaintsList(
                    saintsData[`${selectedMonth}-${selectedDay}`] || [],
                    `${ethiopianMonths[selectedMonth - 1]} ${toEthNum(selectedDay)}`
                )}
            </div>
        </section>
    );
};

export default Synaxarium;