import React, { useState } from 'react';
import { toEthNum, ethiopianMonths } from '../utils/calendarUtils';
import { calendarAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './styles/HolidayCalculator.css';

const HolidayCalculator = () => {
    const { currentUser, saveToHistory } = useAuth();
    const [year, setYear] = useState(2018); // ነባሪ 2018 ዓ.ም
    const [holidays, setHolidays] = useState([]);
    const [bahreHasab, setBahreHasab] = useState(null);
    const [additionalInfo, setAdditionalInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateHolidays = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await calendarAPI.getHolidaysByYear(year);
            setHolidays(response.data.holidays || []);
            setAdditionalInfo(response.data.additionalInfo || null);
            setBahreHasab(response.data.bahreHasab || null);

            if (currentUser) {
                await saveToHistory('holiday_calculation', `Calculated holidays for Ethiopian year ${year}`, {
                    year
                });
            }
        } catch (err) {
            console.error('Error calculating holidays:', err);
            setError('Failed to calculate holidays');
            setHolidays([]);
            setAdditionalInfo(null);
            setBahreHasab(null);
        } finally {
            setLoading(false);
        }
    };

    const formatHolidayDate = (holiday) => {
        if (holiday.formattedDate) {
            return holiday.formattedDate;
        } else if (holiday.date) {
            return `${ethiopianMonths[holiday.date.month - 1]} ${toEthNum(holiday.date.day)}, ${toEthNum(year)}`;
        }
        return '';
    };

    // በዓላትን በወር መሠረት መድብ
    const groupHolidaysByMonth = () => {
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
    };

    const groupedHolidays = groupHolidaysByMonth();

    return (
        <section className="card" id="holidays">
            <h2 className="section-title">
                <i className="fas fa-calendar-alt"></i> 
                የባሕረ ሐሳብ በዓላት - Bahre Hasab Calculator
            </h2>
            <p>Enter an Ethiopian year to calculate the dates of major Orthodox holidays:</p>
            
            <div className="calculator-form">
                <input 
                    type="number" 
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    placeholder="Enter Ethiopian Year (e.g., 2018)" 
                    min="1900" 
                    max="2100" 
                    disabled={loading}
                />
                <button onClick={calculateHolidays} disabled={loading}>
                    <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i> 
                    {loading ? 'በማስላት ላይ...' : 'አስላ'}
                </button>
            </div>
            
            {error && (
                <div className="holidays-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}
            
 
            
            <div className="holidays-list">
                {loading ? (
                    <div className="holidays-loading">
                        <i className="fas fa-spinner fa-spin"></i> Loading holidays...
                    </div>
                ) : holidays.length > 0 ? (
                    Object.entries(groupedHolidays).map(([monthName, monthHolidays]) => (
                        <div key={monthName} className="month-group">
                            <h3 className="month-title">{monthName}</h3>
                            <div className="month-holidays">
                                {monthHolidays.map((holiday, index) => (
                                    <div key={holiday._id || index} className="holiday-item">
                                        <div className="holiday-name">
                                            {holiday.nameAmharic || holiday.name}
                                            {holiday.type === 'movable' && (
                                                <span className="holiday-badge movable"></span>
                                            )}
                                            {holiday.type === 'fixed' && (
                                                <span className="holiday-badge fixed"></span>
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
                ) : year && !loading ? (
                    <div className="no-holidays">
                        <i className="fas fa-calendar-times"></i>
                        <p>No holidays found for year {year}. Click Calculate to get results.</p>
                    </div>
                ) : null}
            </div>
            
 
                    </div>
                </div>
            )}
        </section>
    );
};

export default HolidayCalculator;
