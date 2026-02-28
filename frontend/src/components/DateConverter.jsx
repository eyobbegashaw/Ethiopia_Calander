import React, { useState, useEffect } from 'react';
import { 
    toEthNum, ethToGC, gcToEth, 
    ethiopianMonths, gregorianMonths 
} from '../utils/calendarUtils';
import { calendarAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './styles/DateConverter.css';

const DateConverter = () => {
    const { currentUser, saveToHistory } = useAuth();

    // Gregorian date state
    const [gDay, setGDay] = useState(1);
    const [gMonth, setGMonth] = useState(new Date().getMonth() + 1);
    const [gYear, setGYear] = useState(new Date().getFullYear());

    // Ethiopian date state
    const [eDay, setEDay] = useState(1);
    const [eMonth, setEMonth] = useState(1);
    const [eYear, setEYear] = useState(new Date().getFullYear() - 7);

    // Results
    const [gToEResult, setGToEResult] = useState('');
    const [eToGResult, setEToGResult] = useState('');
    const [loading, setLoading] = useState(false);

    // Populate dropdowns
    const gDays = Array.from({ length: 31 }, (_, i) => i + 1);
    const gYears = Array.from({ length: 11 }, (_, i) => 2020 + i);
    const eDays = Array.from({ length: 30 }, (_, i) => i + 1);
    const eYears = Array.from({ length: 11 }, (_, i) => 2015 + i);

    const convertToEthiopian = async () => {
        setLoading(true);
        try {
            const gDate = new Date(gYear, gMonth - 1, gDay);
            const { year: ethYear, month: ethMonth, day: ethDay } = gcToEth(gDate);
            const result = `${ethiopianMonths[ethMonth - 1]} ${toEthNum(ethDay)}, ${toEthNum(ethYear)} እ.ኤ.አ.`;
            setGToEResult(result);

            if (currentUser) {
                await saveToHistory('conversion', `Gregorian ${gMonth}/${gDay}/${gYear} → Ethiopian ${ethiopianMonths[ethMonth - 1]} ${ethDay}, ${ethYear}`, {
                    from: 'gregorian',
                    to: 'ethiopian',
                    input: { year: gYear, month: gMonth, day: gDay },
                    output: { year: ethYear, month: ethMonth, day: ethDay }
                });
            }

            // Also try to get from API if needed for more accurate conversions
            try {
                await calendarAPI.convertDate({
                    from: 'gregorian',
                    to: 'ethiopian',
                    date: gDate.toISOString()
                });
            } catch (apiErr) {
                console.log('API conversion not available, using local calculation');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            setGToEResult('Error converting date');
        } finally {
            setLoading(false);
        }
    };

    const convertToGregorian = async () => {
        setLoading(true);
        try {
            const gDate = ethToGC(eYear, eMonth, eDay);
            const result = `${gregorianMonths[gDate.getMonth()]} ${gDate.getDate()}, ${gDate.getFullYear()} G.C.`;
            setEToGResult(result);

            if (currentUser) {
                await saveToHistory('conversion', `Ethiopian ${ethiopianMonths[eMonth - 1]} ${eDay}, ${eYear} → Gregorian ${gregorianMonths[gDate.getMonth()]} ${gDate.getDate()}, ${gDate.getFullYear()}`, {
                    from: 'ethiopian',
                    to: 'gregorian',
                    input: { year: eYear, month: eMonth, day: eDay },
                    output: { year: gDate.getFullYear(), month: gDate.getMonth() + 1, day: gDate.getDate() }
                });
            }

            // Also try to get from API if needed
            try {
                await calendarAPI.convertDate({
                    from: 'ethiopian',
                    to: 'gregorian',
                    date: { year: eYear, month: eMonth, day: eDay }
                });
            } catch (apiErr) {
                console.log('API conversion not available, using local calculation');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            setEToGResult('Error converting date');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="card" id="converter">
            <h2 className="section-title">Date Converter</h2>
            <div className="converter-options">
                <div className="converter-option">
                    <h3><i className="fas fa-exchange-alt"></i> Gregorian to Ethiopian</h3>
                    <div className="date-input">
                        <select value={gDay} onChange={(e) => setGDay(parseInt(e.target.value))} disabled={loading}>
                            {gDays.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                        <select value={gMonth} onChange={(e) => setGMonth(parseInt(e.target.value))} disabled={loading}>
                            {gregorianMonths.map((month, index) => (
                                <option key={index + 1} value={index + 1}>{month}</option>
                            ))}
                        </select>
                        <select value={gYear} onChange={(e) => setGYear(parseInt(e.target.value))} disabled={loading}>
                            {gYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={convertToEthiopian} disabled={loading}>
                        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> 
                        {loading ? 'Converting...' : 'Convert'}
                    </button>
                    {gToEResult && <div className="result">{gToEResult}</div>}
                </div>
                <div className="converter-option">
                    <h3><i className="fas fa-exchange-alt"></i> Ethiopian to Gregorian</h3>
                    <div className="date-input">
                        <select value={eDay} onChange={(e) => setEDay(parseInt(e.target.value))} disabled={loading}>
                            {eDays.map(day => (
                                <option key={day} value={day}>{toEthNum(day)}</option>
                            ))}
                        </select>
                        <select value={eMonth} onChange={(e) => setEMonth(parseInt(e.target.value))} disabled={loading}>
                            {ethiopianMonths.map((month, index) => (
                                <option key={index + 1} value={index + 1}>{month}</option>
                            ))}
                        </select>
                        <select value={eYear} onChange={(e) => setEYear(parseInt(e.target.value))} disabled={loading}>
                            {eYears.map(year => (
                                <option key={year} value={year}>{toEthNum(year)}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={convertToGregorian} disabled={loading}>
                        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> 
                        {loading ? 'Converting...' : 'Convert'}
                    </button>
                    {eToGResult && <div className="result">{eToGResult}</div>}
                </div>
            </div>
        </section>
    );
};

export default DateConverter;