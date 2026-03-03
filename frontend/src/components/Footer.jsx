import React from 'react';
import './styles/Footer.css';

const Footer = () => {
    return (
        <footer id="about">
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
                            <li><a href="#home">Home</a></li>
                            <li><a href="#today">Today's Date</a></li>
                            <li><a href="#calendar">Calendar</a></li>
                            <li><a href="#synaxarium">ስንክሳር</a></li>
                            <li><a href="#gizae">ግጻዊ</a></li>
                            <li><a href="#converter">Date Converter</a></li>
                            <li><a href="#holidays">Holiday Calculator</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Contact</h3>
                        <p> Email: </p><a href="eyobbegashaw075@gmail.com">eyobbegashaw075@gmail.com</a>
                        <p> Developer:</p><a href="htpps://eyobbegashaw.vercel.app">ዲ/ን ኢዮብ በጋሻው</a>
                        <p>ይህ ድህረ ገጽ የመጀመሪያ ስሪት ነው <strong>v1.0.0</strong> ።በሚቀጥለው ስሪት ይበትጥ ይሻሻላል።</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2018 እ.ኢ.አ. - ኢትዮጵያ ቀን መቁጠሪያ - All Rights Reserved</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
