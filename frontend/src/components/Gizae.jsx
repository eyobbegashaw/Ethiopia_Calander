import React, { useState, useEffect } from 'react';
import { toEthNum, ethiopianMonths, gcToEth } from '../utils/calendarUtils';
import { gizaeData } from '../data/gizaeData';
import './styles/Gizae.css';

const Gizae = () => {
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedDay, setSelectedDay] = useState(1);
    const [daysInMonth, setDaysInMonth] = useState(30);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [notes, setNotes] = useState({});
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [currentNote, setCurrentNote] = useState({ reading: '', text: '' });

    useEffect(() => {
        const days = selectedMonth === 13 ? 6 : 30;
        setDaysInMonth(days);
        
        if (selectedDay > days) {
            setSelectedDay(1);
        }
        
        loadTodaysReadings();
        loadBookmarks();
    }, []);

    useEffect(() => {
        loadReadings(selectedMonth, selectedDay);
    }, [selectedMonth, selectedDay]);

    const loadTodaysReadings = async () => {
        const now = new Date();
        const { month: eMonth, day: eDay } = gcToEth(now);
        setSelectedMonth(eMonth);
        setSelectedDay(eDay);
    };

    const loadReadings = async (month, day) => {
        setLoading(true);
        setError(null);
        setReadings(gizaeData[`${month}-${day}`] || []);
        setLoading(false);
    };

    const loadBookmarks = () => {
        const saved = localStorage.getItem('gizaeBookmarks');
        if (saved) {
            setBookmarks(JSON.parse(saved));
        }
        const savedNotes = localStorage.getItem('gizaeNotes');
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
    };

    const handleSearch = () => {
        loadReadings(selectedMonth, selectedDay);
    };

    const toggleBookmark = (reading) => {
        const key = `${selectedMonth}-${selectedDay}-${reading.title}`;
        const newBookmarks = bookmarks.includes(key)
            ? bookmarks.filter(b => b !== key)
            : [...bookmarks, key];
        
        setBookmarks(newBookmarks);
        localStorage.setItem('gizaeBookmarks', JSON.stringify(newBookmarks));
    };

    const saveNote = () => {
        const key = `${selectedMonth}-${selectedDay}-${currentNote.reading}`;
        const newNotes = { ...notes, [key]: currentNote.text };
        setNotes(newNotes);
        localStorage.setItem('gizaeNotes', JSON.stringify(newNotes));
        setShowNoteModal(false);
    };

    const shareReading = async (reading) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: reading.title,
                    text: reading.content,
                    url: window.location.href
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(`${reading.title}\n\n${reading.content}\n\n${reading.reference}`);
            alert('Reading copied to clipboard!');
        }
    };

    const generateDayOptions = () => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
            <option key={day} value={day}>{toEthNum(day)}</option>
        ));
    };

    const getAudioUrl = (reading) => {
        // In a real app, this would fetch from a text-to-speech service
        return null;
    };

    const playAudio = (reading) => {
        const utterance = new SpeechSynthesisUtterance(reading.content);
        utterance.lang = 'am-ET';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <section className="card" id="gizae">
            <h2 className="section-title">ግጻዊ - Daily Readings</h2>
            
            <div className="gizae-controls">
                <div className="control-group">
                    <label htmlFor="gizae-month-select">ወር Select Month</label>
                    <select 
                        id="gizae-month-select" 
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
                    <label htmlFor="gizae-day-select">ቀን Select Day</label>
                    <select 
                        id="gizae-day-select" 
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
                        {loading ? 'Loading...' : 'Search Readings'}
                    </button>
                </div>
            </div>

            <div className="gizae-tabs">
                <button 
                    className="tab-btn active"
                    onClick={() => document.getElementById('readings-tab').style.display = 'block'}
                >
                    Readings
                </button>
                <button 
                    className="tab-btn"
                    onClick={() => document.getElementById('bookmarks-tab').style.display = 'block'}
                >
                    Bookmarks
                </button>
            </div>

            <div id="readings-tab" className="tab-content">
                {loading ? (
                    <div className="gizae-loading">
                        <i className="fas fa-spinner fa-spin"></i> Loading readings...
                    </div>
                ) : error ? (
                    <div className="gizae-error">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                ) : readings.length === 0 ? (
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
                        const bookmarkKey = `${selectedMonth}-${selectedDay}-${reading.title}`;
                        const isBookmarked = bookmarks.includes(bookmarkKey);
                        const noteKey = `${selectedMonth}-${selectedDay}-${reading.title}`;
                        const hasNote = notes[noteKey];

                        return (
                            <div key={index} className="gizae-reading">
                                <div className="reading-header">
                                    <div className="reading-title">
                                        <i className="fas fa-book"></i> 
                                        {reading.titleAmharic || reading.title}
                                    </div>
                                    <div className="reading-actions">
                                        <button 
                                            className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`}
                                            onClick={() => toggleBookmark(reading)}
                                            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                        >
                                            <i className={`fas fa-${isBookmarked ? 'bookmark' : 'bookmark'}`}></i>
                                        </button>
                                        <button 
                                            className="action-btn"
                                            onClick={() => {
                                                setCurrentNote({ reading: reading.title, text: notes[noteKey] || '' });
                                                setShowNoteModal(true);
                                            }}
                                            title={hasNote ? 'Edit note' : 'Add note'}
                                        >
                                            <i className={`fas fa-${hasNote ? 'sticky-note' : 'sticky-note'}`}></i>
                                        </button>
                                        <button 
                                            className="action-btn"
                                            onClick={() => playAudio(reading)}
                                            title="Listen"
                                        >
                                            <i className="fas fa-volume-up"></i>
                                        </button>
                                        <button 
                                            className="action-btn"
                                            onClick={() => shareReading(reading)}
                                            title="Share"
                                        >
                                            <i className="fas fa-share-alt"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="reading-content">
                                    {reading.contentAmharic || reading.content}
                                </div>
                                
                                {hasNote && (
                                    <div className="reading-note">
                                        <i className="fas fa-sticky-note"></i>
                                        {notes[noteKey]}
                                    </div>
                                )}
                                
                                <div className="reading-reference">
                                    {reading.reference}
                                </div>

                                {reading.relatedReadings && (
                                    <div className="related-readings">
                                        <h4>Related Readings:</h4>
                                        <ul>
                                            {reading.relatedReadings.map((ref, i) => (
                                                <li key={i}>{ref}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div id="bookmarks-tab" className="tab-content" style={{ display: 'none' }}>
                {bookmarks.length === 0 ? (
                    <div className="no-bookmarks">
                        <i className="fas fa-bookmark"></i>
                        <p>No bookmarked readings yet</p>
                    </div>
                ) : (
                    bookmarks.map(key => {
                        const [month, day, title] = key.split('-');
                        return (
                            <div key={key} className="bookmark-item">
                                <div className="bookmark-info">
                                    <span className="bookmark-date">
                                        {ethiopianMonths[parseInt(month)-1]} {toEthNum(parseInt(day))}
                                    </span>
                                    <span className="bookmark-title">{title}</span>
                                </div>
                                <button 
                                    className="remove-bookmark"
                                    onClick={() => toggleBookmark({ title })}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Note Modal */}
            {showNoteModal && (
                <div className="note-modal" onClick={() => setShowNoteModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Add Note</h3>
                        <textarea
                            value={currentNote.text}
                            onChange={(e) => setCurrentNote({ ...currentNote, text: e.target.value })}
                            placeholder="Write your thoughts..."
                            rows="5"
                        />
                        <div className="modal-actions">
                            <button onClick={saveNote}>Save Note</button>
                            <button onClick={() => setShowNoteModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gizae;