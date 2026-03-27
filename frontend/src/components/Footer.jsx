import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const ethiopianYear = currentYear - 8; // Approximate Ethiopian year offset

    return (
        <footer>
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>About ባሕር ሀሳብ & ስንክሳር</h3>
                        <p>The Ethiopian calendar is based on the ancient Coptic calendar and is approximately 7-8 years behind the Gregorian calendar. It has 13 months, with 12 months of 30 days and a 13th month of 5 or 6 days.</p>
                        <p>ስንክሳር (Synaxarium) contains the commemoration of saints for each day of the year according to the Ethiopian Orthodox Tewahedo Church.</p>
                    </div>
                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/calendar">Calendar</Link></li>
                            <li><Link to="/converter">Date Converter</Link></li>
                            <li><Link to="/synaxarium">Synaxarium (ስንክሳር)</Link></li>
                            <li><Link to="/gizae">Gizae (ግጻዊ)</Link></li>
                            <li><Link to="/holidays">Holiday Calculator</Link></li>
                            <li><Link to="/quiz">Spiritual Quiz</Link></li>
                            <li><Link to="/chat">Community Chat</Link></li>
                            <li><Link to="/gallery">Gallery</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Contact & Info</h3>
                        <p>Developer: <a href="https://eyobbegashaw.vercel.app" target="_blank" rel="noopener noreferrer">ዲ/ን ኢዮብ በጋሻው</a></p>
                        <p>ይህ ድህረ ገጽ የመጀመሪያ ስሪት ነው <strong>v1.0.0</strong> ። በሚቀጥለው ስሪት ይበትጥ ይሻሻላል።</p>
                        <p>Follow us on social media for updates and spiritual content.</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {ethiopianYear} እ.ኢ.አ. - {currentYear} G.C. ኢትዮጵያ ቀን መቁጠሪያ - All Rights Reserved</p>
                    <p className="footer-credit">Preserving Ethiopian Orthodox Heritage | የኢትዮጵያ ኦርቶዶክስ ቅርስ ጠባቂ</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
