import React, { useState, useEffect } from 'react';
import { toEthNum, ethiopianMonths, gcToEth } from '../utils/calendarUtils';
import { calendarAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './styles/Synaxarium.css';

const Synaxarium = () => {
    const { currentUser, saveToHistory } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedDay, setSelectedDay] = useState(1);
    const [daysInMonth, setDaysInMonth] = useState(30);
    const [todaySaints, setTodaySaints] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Update days in month when month changes
        const days = selectedMonth === 13 ? 6 : 30;
        setDaysInMonth(days);
        
        // Reset selected day if it's out of range
        if (selectedDay > days) {
            setSelectedDay(1);
        }
    }, [selectedMonth]);

    useEffect(() => {
        loadTodaysSaints();
        
        // Listen for calendar day clicks
        const handleShowSaints = (e) => {
            const { month, day } = e.detail;
            setSelectedMonth(month);
            setSelectedDay(day);
            searchSaints(month, day);
            
            // Scroll to synaxarium
            document.getElementById('synaxarium')?.scrollIntoView({ behavior: 'smooth' });
        };
        
        window.addEventListener('showSaintsForDate', handleShowSaints);
        return () => window.removeEventListener('showSaintsForDate', handleShowSaints);
    }, []);

    const loadTodaysSaints = async () => {
        setLoading(true);
        setError(null);
        try {
            const now = new Date();
            const { month: eMonth, day: eDay } = gcToEth(now);
            
            const response = await calendarAPI.getSaintsByDate(eMonth, eDay);
            setTodaySaints(response.data.saints || []);
        } catch (err) {
            console.error('Error loading today\'s saints:', err);
            setError('Failed to load today\'s saints');
            setTodaySaints([]);
        } finally {
            setLoading(false);
        }
    };

    const searchSaints = async (month = selectedMonth, day = selectedDay) => {
        setLoading(true);
        setError(null);
        try {
            const response = await calendarAPI.getSaintsByDate(month, day);
            setSearchResults(response.data.saints || []);

            if (currentUser) {
                await saveToHistory('saint_search', `Searched saints for ${ethiopianMonths[month-1]} ${day}`, {
                    month,
                    day
                });
            }
        } catch (err) {
            console.error('Error searching saints:', err);
            setError('Failed to search saints');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        searchSaints();
    };

    const generateDayOptions = () => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
            <option key={day} value={day}>{toEthNum(day)}</option>
        ));
    };

    const renderSaintsList = (saints, date, isToday = false) => {
        if (loading) {
            return (
                <div className="saints-loading">
                    <i className="fas fa-spinner fa-spin"></i> Loading...
                </div>
            );
        }

        if (error) {
            return (
                <div className="saints-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            );
        }

        if (!saints || saints.length === 0) {
            return (
                <div className={`saint-item ${isToday ? 'today-saints' : ''}`}>
                    <div className="saint-date">{date}</div>
                    <div className="saint-description">
                        {isToday ? 'ለዛሬ የተመዘገቡ ቅዱሳን የሉም።' : 'ለዚህ ቀን የተመዘገቡ ቅዱሳን የሉም።'}
                    </div>
                </div>
            );
        }

        return saints.map((saint, index) => (
            <div key={saint._id || index} className={`saint-item ${isToday ? 'today-saints' : ''}`}>
                <div className="saint-date">{date}</div>
                <div className="saint-name">{saint.nameAmharic || saint.name}</div>
                <div className="saint-description">{saint.descriptionAmharic || saint.description}</div>
                <div className="saint-tags">
                    {saint.category?.map((cat, i) => (
                        <span key={i} className="saint-tag">{cat}</span>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <section className="card" id="synaxarium">
            <h2 className="section-title">ስንክሳር - Orthodox Synaxarium</h2>
            
            {/* Today's Saints */}
            <div className="today-saints-section">
                <h3 className="section-subtitle">
                    <i className="fas fa-calendar-day"></i> የዛሬ ቅዱሳን - Today's Saints
                </h3>
                <div className="saints-list">
                    {renderSaintsList(
                        todaySaints, 
                        `${ethiopianMonths[gcToEth(new Date()).month - 1]} ${toEthNum(gcToEth(new Date()).day)}`,
                        true
                    )}
                </div>
            </div>

            {/* Search Saints by Date */}
            <div className="synaxarium-controls">
                <div className="control-group">
                    <label htmlFor="month-select">ወር Select Month</label>
                    <select 
                        id="month-select" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        disabled={loading}
                    >
                        {ethiopianMonths.map((month, index) => (
                            <option key={index + 1} value={index + 1}>
                                {month}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="control-group">
                    <label htmlFor="day-select">ቀን Select Day</label>
                    <select 
                        id="day-select" 
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                        disabled={loading}
                    >
                        {generateDayOptions()}
                    </select>
                </div>
                <div className="control-group">
                    <label>&nbsp;</label>
                    <button onClick={handleSearch} disabled={loading}>
                        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i> 
                        {loading ? 'Searching...' : 'Search Saints'}
                    </button>
                </div>
            </div>

            <div className="saints-list">
                {renderSaintsList(
                    searchResults,
                    `${ethiopianMonths[selectedMonth-1]} ${toEthNum(selectedDay)}`
                )}
            </div>
        </section>
    );
};

export default Synaxarium;