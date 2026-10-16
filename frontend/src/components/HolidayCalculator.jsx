import React, { useState, useMemo } from 'react';
import { toEthNum, ethiopianMonths } from '../utils/calendarUtils';
import { sampleHolidays } from '../data/holidaysData';
import './styles/HolidayCalculator.css';

const HolidayCalculator = () => {
    const [year, setYear] = useState(2018); // Default 2018 ዓ.ም
    const yearValue = year === '' ? NaN : Number(year);
    const isValidYear = Number.isInteger(yearValue) && yearValue >= 1900 && yearValue <= 2100;
    const holidays = useMemo(() => (
        isValidYear
            ? sampleHolidays.map((holiday, index) => ({
                _id: `${yearValue}-${holiday.month}-${holiday.day}-${index}`,
                name: holiday.name,
                date: { month: holiday.month, day: holiday.day },
            }))
            : []
    ), [isValidYear, yearValue]);

    const handleYearChange = (e) => {
        const value = e.target.value;
        // Allow empty string or valid numbers
        if (value === '' || /^\d+$/.test(value)) {
            setYear(value);
        }
    };

    const formatHolidayDate = (holiday) => {
        if (holiday.formattedDate) {
            return holiday.formattedDate;
        } else if (holiday.date) {
            const yearNum = Number(year);
            if (!isNaN(yearNum)) {
                return `${ethiopianMonths[holiday.date.month - 1]} ${toEthNum(holiday.date.day)}, ${toEthNum(yearNum)}`;
            }
        }
        return '';
    };

    // Group holidays by month with useMemo to prevent unnecessary recalculations
    const groupedHolidays = useMemo(() => {
        const groups = {};
        holidays.forEach(holiday => {
            const monthIndex = holiday.date?.month || 1;
            const monthName = ethiopianMonths[monthIndex - 1];
            if (!groups[monthName]) {
                groups[monthName] = [];
            }
            groups[monthName].push(holiday);
        });
        return groups;
    }, [holidays]);

    return (
        <section className="card" id="holidays">
            <h2 className="section-title">
                <i className="fas fa-calendar-alt"></i> 
                የባሕረ ሐሳብ በዓላት - Bahre Hasab Calculator
            </h2>
            <p>Enter an Ethiopian year to view the dates of major Orthodox holidays:</p>
            
            <div className="calculator-form">
                <input 
                    type="number" 
                    value={year}
                    onChange={handleYearChange}
                    placeholder="Enter Ethiopian Year (e.g., 2018)" 
                    min="1900" 
                    max="2100" 
                />
            </div>
            
            {year !== '' && !isValidYear && (
                <div className="holidays-error">
                    <i className="fas fa-exclamation-circle"></i> Please enter a valid year between 1900 and 2100.
                </div>
            )}
            
            <div className="holidays-list">
                {holidays.length > 0 ? (
                    Object.entries(groupedHolidays).map(([monthName, monthHolidays]) => (
                        <div key={monthName} className="month-group">
                            <h3 className="month-title">{monthName}</h3>
                            <div className="month-holidays">
                                {monthHolidays.map((holiday, index) => (
                                    <div key={holiday._id || `${monthName}-${index}`} className="holiday-item">
                                        <div className="holiday-name">
                                            {holiday.nameAmharic || holiday.name}
                                            {holiday.type === 'movable' && (
                                                <span className="holiday-badge movable">ተንቀሳቃሽ</span>
                                            )}
                                            {holiday.type === 'fixed' && (
                                                <span className="holiday-badge fixed">ቋሚ</span>
                                            )}
                                        </div>
                                        <div className="holiday-date">{formatHolidayDate(holiday)}</div>
                                        {holiday.description && (
                                            <div className="holiday-description">{holiday.description}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : year !== '' && isValidYear ? (
                    <div className="no-holidays">
                        <i className="fas fa-calendar-times"></i>
                        <p>No holidays found for year {year}.</p>
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export default HolidayCalculator;
