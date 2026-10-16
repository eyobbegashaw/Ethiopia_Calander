import React, { useState } from 'react';
import {
    toEthNum,
    ethToGC,
    gcToEth,
    isEthLeap,
    ethiopianMonths,
    gregorianMonths
} from '../utils/calendarUtils';
import './styles/DateConverter.css';

const DateConverter = () => {
    const today = new Date();
    const currentEth = gcToEth(today);

    const [mode, setMode] = useState('gc-to-ec');
    const [day, setDay] = useState(mode === 'gc-to-ec' ? today.getDate() : currentEth.day);
    const [month, setMonth] = useState(mode === 'gc-to-ec' ? today.getMonth() + 1 : currentEth.month);
    const [year, setYear] = useState(mode === 'gc-to-ec' ? today.getFullYear() : currentEth.year);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const isGregorianToEthiopian = mode === 'gc-to-ec';

    const handleModeChange = (nextMode) => {
        setMode(nextMode);
        setResult('');

        const now = new Date();
        const ethNow = gcToEth(now);

        if (nextMode === 'gc-to-ec') {
            setDay(now.getDate());
            setMonth(now.getMonth() + 1);
            setYear(now.getFullYear());
        } else {
            setDay(ethNow.day);
            setMonth(ethNow.month);
            setYear(ethNow.year);
        }
    };

    const getDaysInMonth = (dateYear, dateMonth, gregorian) => {
        if (gregorian) {
            const isLeapYear = dateYear % 4 === 0 &&
                (dateYear % 100 !== 0 || dateYear % 400 === 0);
            const gregorianDays = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return gregorianDays[dateMonth - 1] || 31;
        }
        return dateMonth === 13 ? (isEthLeap(dateYear) ? 6 : 5) : 30;
    };

    const changeInput = (field, direction) => {
        const currentYear = Number(year);
        const currentMonth = Number(month);
        const currentDay = Number(day);
        const monthCount = isGregorianToEthiopian ? 12 : 13;

        if (field === 'day') {
            const maxDay = getDaysInMonth(currentYear, currentMonth, isGregorianToEthiopian);
            setDay(String(Math.min(maxDay, Math.max(1, currentDay + direction))));
            return;
        }

        if (field === 'month') {
            const nextMonth = Math.min(monthCount, Math.max(1, currentMonth + direction));
            setMonth(String(nextMonth));
            setDay(String(Math.min(currentDay, getDaysInMonth(currentYear, nextMonth, isGregorianToEthiopian))));
            return;
        }

        const nextYear = Math.max(1, currentYear + direction);
        setYear(String(nextYear));
        setDay(String(Math.min(currentDay, getDaysInMonth(nextYear, currentMonth, isGregorianToEthiopian))));
    };

    const convertDate = () => {
        setLoading(true);
        setResult('');

        try {
            const parsedDay = Number(day);
            const parsedMonth = Number(month);
            const parsedYear = Number(year);

            if (!Number.isInteger(parsedDay) || !Number.isInteger(parsedMonth) || !Number.isInteger(parsedYear) || parsedYear < 1) {
                setResult('Please enter valid numbers for day, month, and year.');
                return;
            }

            if (isGregorianToEthiopian) {
                if (parsedMonth < 1 || parsedMonth > 12 || parsedDay < 1 ||
                    parsedDay > getDaysInMonth(parsedYear, parsedMonth, true)) {
                    setResult('Please enter a valid Gregorian date.');
                    return;
                }

                const gregorianDate = new Date(parsedYear, parsedMonth - 1, parsedDay);
                const converted = gcToEth(gregorianDate);
                setResult(`${ethiopianMonths[converted.month - 1]} ${toEthNum(converted.day)}, ${toEthNum(converted.year)} ዓ.ም.`);
                return;
            }

            if (parsedMonth < 1 || parsedMonth > 13 || parsedDay < 1 ||
                parsedDay > getDaysInMonth(parsedYear, parsedMonth, false)) {
                setResult('Please enter a valid Ethiopian date.');
                return;
            }

            const gregorianDate = ethToGC(parsedYear, parsedMonth, parsedDay);
            setResult(`${gregorianMonths[gregorianDate.getMonth()]} ${gregorianDate.getDate()}, ${gregorianDate.getFullYear()} G.C.`);
        } catch (error) {
            console.error('Conversion error:', error);
            setResult('Error converting date. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputLabel = isGregorianToEthiopian ? 'Gregorian date' : 'Ethiopian date';
    const helperText = isGregorianToEthiopian
        ? 'Type the Gregorian date you want to convert.'
        : 'Type the Ethiopian date you want to convert.';

    return (
        <section className="card date-converter-card" id="converter">
            <h2 className="section-title">Date Converter</h2>

            <div className="converter-shell">
                <div className="converter-option">
                    <div className="mode-toggle" aria-label="Select conversion direction">
                        <button
                            type="button"
                            className={isGregorianToEthiopian ? 'toggle-option active' : 'toggle-option'}
                            onClick={() => handleModeChange('gc-to-ec')}
                        >
                            Gregorian → Ethiopian
                        </button>
                        <button
                            type="button"
                            className={!isGregorianToEthiopian ? 'toggle-option active' : 'toggle-option'}
                            onClick={() => handleModeChange('ec-to-gc')}
                        >
                            Ethiopian → Gregorian
                        </button>
                    </div>

                    <div className="converter-form">
                        <div className="form-header">
                            <h3>
                                <i className="fas fa-exchange-alt" aria-hidden="true" />
                                {inputLabel}
                            </h3>
                            <p className="converter-helper">{helperText}</p>
                        </div>

                        <div className="date-input-grid">
                            <div className="field-group">
                                <label htmlFor="converter-day">Day</label>
                                <div className="date-field-control">
                                    <button
                                        type="button"
                                        className="field-step-button"
                                        onClick={() => changeInput('day', -1)}
                                        disabled={loading}
                                        aria-label="Decrease day"
                                    >
                                        <i className="fas fa-chevron-left" aria-hidden="true" />
                                    </button>
                                    <input
                                        id="converter-day"
                                        type="number"
                                        min="1"
                                        max={getDaysInMonth(Number(year), Number(month), isGregorianToEthiopian)}
                                        value={day}
                                        onChange={(e) => setDay(e.target.value)}
                                        disabled={loading}
                                        placeholder="DD"
                                    />
                                    <button
                                        type="button"
                                        className="field-step-button"
                                        onClick={() => changeInput('day', 1)}
                                        disabled={loading}
                                        aria-label="Increase day"
                                    >
                                        <i className="fas fa-chevron-right" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div className="field-group">
                                <label htmlFor="converter-month">Month</label>
                                <div className="date-field-control">
                                    <button
                                        type="button"
                                        className="field-step-button"
                                        onClick={() => changeInput('month', -1)}
                                        disabled={loading}
                                        aria-label="Decrease month"
                                    >
                                        <i className="fas fa-chevron-left" aria-hidden="true" />
                                    </button>
                                    <input
                                        id="converter-month"
                                        type="number"
                                        min="1"
                                        max={isGregorianToEthiopian ? '12' : '13'}
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        disabled={loading}
                                        placeholder={isGregorianToEthiopian ? 'MM' : 'አም'}
                                    />
                                    <button
                                        type="button"
                                        className="field-step-button"
                                        onClick={() => changeInput('month', 1)}
                                        disabled={loading}
                                        aria-label="Increase month"
                                    >
                                        <i className="fas fa-chevron-right" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div className="field-group">
                                <label htmlFor="converter-year">Year</label>
                                <div className="date-field-control">
                                    <button
                                        type="button"
                                        className="field-step-button"
                                        onClick={() => changeInput('year', -1)}
                                        disabled={loading}
                                        aria-label="Decrease year"
                                    >
                                        <i className="fas fa-chevron-left" aria-hidden="true" />
                                    </button>
                                    <input
                                        id="converter-year"
                                        type="number"
                                        min="1"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        disabled={loading}
                                        placeholder="YYYY"
                                    />
                                    <button
                                        type="button"
                                        className="field-step-button"
                                        onClick={() => changeInput('year', 1)}
                                        disabled={loading}
                                        aria-label="Increase year"
                                    >
                                        <i className="fas fa-chevron-right" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="button" className="convert-button" onClick={convertDate} disabled={loading}>
                            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-calculator'}`} aria-hidden="true" />
                            {loading ? 'Converting...' : 'Convert'}
                        </button>

                        {result && <div className="result conversion-result">{result}</div>}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DateConverter;