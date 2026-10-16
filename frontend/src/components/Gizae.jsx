import React, { useState } from 'react';
import { toEthNum, ethiopianMonths, gcToEth, isEthLeap } from '../utils/calendarUtils';
import { gizaeData } from '../data/gizaeData';
import useSpeechPlayback from '../hooks/useSpeechPlayback';
import './styles/Gizae.css';

const Gizae = () => {
    const todayEth = gcToEth(new Date());
    const [selectedMonth, setSelectedMonth] = useState(todayEth.month);
    const [selectedDay, setSelectedDay] = useState(todayEth.day);
    const [selectedYear, setSelectedYear] = useState(todayEth.year);
    const { activeSpeechId, toggleSpeech } = useSpeechPlayback();
    const daysInMonth = selectedMonth === 13
        ? (isEthLeap(selectedYear) ? 6 : 5)
        : 30;

    const readings = gizaeData[`${selectedMonth}-${selectedDay}`] || [];

    const selectDate = (month, day, year) => {
        setSelectedMonth(month);
        setSelectedDay(day);
        setSelectedYear(year);
    };

    const shareReading = async (reading) => {
        const content = reading.contentAmharic || reading.content;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: reading.titleAmharic || reading.title,
                    text: content,
                    url: window.location.href
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            await navigator.clipboard.writeText(`${reading.titleAmharic || reading.title}\n\n${content}\n\n${reading.reference}`);
            alert('Reading copied to clipboard!');
        }
    };

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

        selectDate(wrappedMonth, Math.min(selectedDay, nextMonthDays), nextYear);
    };

    const changeDay = (direction) => {
        if (direction < 0 && selectedDay === 1) {
            const previousMonth = selectedMonth === 1 ? 13 : selectedMonth - 1;
            const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
            const previousMonthDays = previousMonth === 13
                ? (isEthLeap(previousYear) ? 6 : 5)
                : 30;

            selectDate(previousMonth, previousMonthDays, previousYear);
            return;
        }

        if (direction > 0 && selectedDay === daysInMonth) {
            const nextMonth = selectedMonth === 13 ? 1 : selectedMonth + 1;
            const nextYear = selectedMonth === 13 ? selectedYear + 1 : selectedYear;
            selectDate(nextMonth, 1, nextYear);
            return;
        }

        selectDate(selectedMonth, selectedDay + direction, selectedYear);
    };

    return (
        <section className="card" id="gizae">
            <h2 className="section-title">ግጻዊ - Daily Readings</h2>
            
            <div className="gizae-controls">
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

            <div className="readings-list">
                {readings.length === 0 ? (
                    <div className="gizae-reading">
                        <div className="reading-title">
                            <i className="fas fa-book"></i> ለዚህ ቀን የተመዘገቡ ንባቦች የሉም
                        </div>
                        <div className="reading-content">
                            እባክዎ ሌላ ቀን ይምረጡ።
                        </div>
                    </div>
                ) : (
                    readings.map((reading, index) => {
                        const speechId = `gizae-${selectedMonth}-${selectedDay}-${reading._id || reading.title || index}`;
                        const isSpeaking = activeSpeechId === speechId;

                        return (
                            <div key={speechId} className="gizae-reading">
                                <div className="reading-header">
                                    <div className="reading-title">
                                        <i className="fas fa-book"></i> 
                                        {reading.titleAmharic || reading.title}
                                    </div>
                                    <div className="reading-actions">
                                        <button 
                                            type="button"
                                            className="action-btn"
                                            onClick={() => toggleSpeech(
                                                speechId,
                                                reading.contentAmharic || reading.content
                                            )}
                                            title={isSpeaking ? 'Stop audio' : 'Listen'}
                                            aria-label={`${isSpeaking ? 'Stop audio for' : 'Listen to'} ${reading.titleAmharic || reading.title}`}
                                            aria-pressed={isSpeaking}
                                        >
                                            <i className={`fas ${isSpeaking ? 'fa-stop' : 'fa-volume-up'}`} aria-hidden="true"></i>
                                        </button>
                                        <button 
                                            type="button"
                                            className="action-btn"
                                            onClick={() => shareReading(reading)}
                                            title="Share"
                                            aria-label={`Share ${reading.titleAmharic || reading.title}`}
                                        >
                                            <i className="fas fa-share-alt"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="reading-content">
                                    {reading.contentAmharic || reading.content}
                                </div>

                                <div className="reading-reference">
                                    {reading.reference}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default Gizae;