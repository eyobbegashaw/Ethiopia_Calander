import React, { useMemo, useState } from 'react';
import { 
    toEthNum, ethToGC, isEthLeap, gcToEth,
    ethiopianMonths, gregorianMonths 
} from '../utils/calendarUtils';
import { saintsData } from '../data/saintsData';
import { ethHolidays, gcHolidays } from '../data/holidaysData';
import './styles/Calendar.css';

const Calendar = () => {
    // Initialize with current Ethiopian date
    const [currentDate, setCurrentDate] = useState(() => {
        const now = new Date();
        const ethDate = gcToEth(now);
        return {
            year: ethDate.year,
            month: ethDate.month
        };
    });

    const calendarDays = useMemo(() => {
        const days = [];
        const { year, month } = currentDate;
        
        // Calculate the first day of the month (Ethiopian to Gregorian conversion)
        const firstDayGC = ethToGC(year, month, 1);
        const firstDay = firstDayGC.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push({ empty: true });
        }
        
        // Get days in month (30 for months 1-12, 5 or 6 for month 13/Pagume)
        const daysInMonth = month === 13 ? (isEthLeap(year) ? 6 : 5) : 30;
        const now = new Date();
        const todayEth = gcToEth(now);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const gDate = ethToGC(year, month, day);
            
            // Check if today
            const isToday = todayEth.year === year && 
                           todayEth.month === month && 
                           todayEth.day === day;
            
            // Check if has saint
            const saintKey = `${month}-${day}`;
            const hasSaint = saintsData && saintsData[saintKey] ? true : false;
            
            // Check for holidays
            const ethHolidayKey = `${month}-${day}`;
            const gcMonth = gDate.getMonth() + 1; // Convert to 1-based month
            const gcDay = gDate.getDate();
            const gcHolidayKey = `${gcMonth}-${gcDay}`;
            
            const ethHoliday = ethHolidays ? ethHolidays[ethHolidayKey] : null;
            const gcHoliday = gcHolidays ? gcHolidays[gcHolidayKey] : null;
            const holiday = ethHoliday || gcHoliday;
            
            days.push({
                day,
                gDate,
                isToday,
                hasSaint,
                holiday,
                saintKey,
                gcMonth,
                gcDay
            });
        }
        
        return days;
    }, [currentDate]);

    const previousMonth = () => {
        setCurrentDate(prev => {
            if (prev.month === 1) {
                // Going back from Meskerem to Pagume of previous year
                return {
                    year: prev.year - 1,
                    month: 13
                };
            }
            // Just go to previous month
            return {
                ...prev,
                month: prev.month - 1
            };
        });
    };

    const nextMonth = () => {
        setCurrentDate(prev => {
            if (prev.month === 13) {
                // Going forward from Pagume to Meskerem of next year
                return {
                    year: prev.year + 1,
                    month: 1
                };
            }
            // Just go to next month
            return {
                ...prev,
                month: prev.month + 1
            };
        });
    };

    const goToToday = () => {
        const now = new Date();
        const ethDate = gcToEth(now);
        setCurrentDate({
            year: ethDate.year,
            month: ethDate.month
        });
    };

    const handleDayClick = (day) => {
        // Trigger saint display (will be handled by parent or event)
        const event = new CustomEvent('showSaintsForDate', { 
            detail: { 
                month: currentDate.month, 
                day,
                year: currentDate.year 
            } 
        });
        window.dispatchEvent(event);
    };

    // Get month name in both languages
    const getMonthName = () => {
        const ethMonth = ethiopianMonths[currentDate.month - 1];
        const gcDate = ethToGC(currentDate.year, currentDate.month, 15); // Use middle of month for reference
        const gcMonthName = gregorianMonths[gcDate.getMonth()];
        return `${ethMonth} (${gcMonthName})`;
    };

    return (
        <section className="card" id="calendar">
            <h2 className="section-title">የወሩ መቁጠሪያ - Monthly Calendar</h2>
            <div className="calendar-container">
                <div className="calendar-header">
                    <div className="calendar-nav">
                        <button onClick={previousMonth} aria-label="Previous month">
                            <i className="fas fa-chevron-left"></i>
                        </button>
                    </div>
                    <h3>
                        {getMonthName()} {toEthNum(currentDate.year)} እ.ኢ.አ.
                    </h3>
                    <div className="calendar-nav">
                        <button onClick={nextMonth} aria-label="Next month">
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div className="calendar-today-button">
                    <button onClick={goToToday} className="today-btn">
                        <i className="fas fa-calendar-check"></i> ዛሬ / Today
                    </button>
                </div>
                <div className="calendar-weekdays">
                    <div>እሁድ</div>
                    <div>ሰኞ</div>
                    <div>ማክሰኞ</div>
                    <div>ረቡዕ</div>
                    <div>ሐሙስ</div>
                    <div>ዓርብ</div>
                    <div>ቅዳሜ</div>
                </div>
                <div className="calendar-days">
                    {calendarDays.map((day, index) => (
                        <div 
                            key={index} 
                            className={`calendar-day ${day.empty ? 'empty' : ''} 
                                ${day.isToday ? 'today' : ''} 
                                ${day.hasSaint ? 'has-saint' : ''} 
                                ${day.holiday ? 'holiday' : ''}`}
                            onClick={() => !day.empty && handleDayClick(day.day)}
                            title={day.holiday || (day.hasSaint ? 'Saint day' : '')}
                        >
                            {!day.empty && (
                                <>
                                    <div className="day-number">{toEthNum(day.day)}</div>
                                    <small className="gregorian-date">
                                        <span>{day.gDate.getDate()}</span>
                                        <span className="gregorian-month-full">
                                            {gregorianMonths[day.gDate.getMonth()]}
                                        </span>
                                        <span className="gregorian-month-short">
                                            {gregorianMonths[day.gDate.getMonth()].slice(0, 3)}
                                        </span>
                                    </small>
                                    {day.holiday && (
                                        <div className="holiday-text">{day.holiday}</div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Calendar;