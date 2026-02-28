import React, { useState } from 'react';
import { toEthNum, ethiopianMonths } from '../utils/calendarUtils';
import { calendarAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './styles/HolidayCalculator.css';

const HolidayCalculator = () => {
    const { currentUser, saveToHistory } = useAuth();
    const [year, setYear] = useState(new Date().getFullYear() - 7);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateHolidays = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await calendarAPI.getHolidaysByYear(year);
            setHolidays(response.data.holidays || []);

            if (currentUser) {
                await saveToHistory('holiday_calculation', `Calculated holidays for Ethiopian year ${year}`, {
                    year
                });
            }
        } catch (err) {
            console.error('Error calculating holidays:', err);
            setError('Failed to calculate holidays');
            setHolidays([]);
        } finally {
            setLoading(false);
        }
    };

    const formatHolidayDate = (holiday) => {
        if (holiday.date) {
            return `${ethiopianMonths[holiday.date.month - 1]} ${toEthNum(holiday.date.day)}, ${toEthNum(year)}`;
        }
        return holiday.date; // For movable holidays that might have pre-formatted date
    };

    return (
        <section className="card" id="holidays">
            <h2 className="section-title">የባሕረ ሀሳብ በዓላት - Holiday Calculator</h2>
            <p>Enter an Ethiopian year to calculate the dates of major Orthodox holidays:</p>
            <div className="calculator-form">
                <input 
                    type="number" 
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    placeholder="Enter Ethiopian Year (e.g., 2017)" 
                    min="1900" 
                    max="2100" 
                    disabled={loading}
                />
                <button onClick={calculateHolidays} disabled={loading}>
                    <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i> 
                    {loading ? 'Calculating...' : 'Calculate Holidays'}
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
                ) : (
                    holidays.map((holiday, index) => (
                        <div key={holiday._id || index} className="holiday-item">
                            <div className="holiday-name">{holiday.nameAmharic || holiday.name}</div>
                            <div className="holiday-date">{formatHolidayDate(holiday)}</div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default HolidayCalculator;