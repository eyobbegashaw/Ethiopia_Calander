const { Saint, Reading, Holiday } = require('../models/Calendar');
const { gcToEth, ethToGC } = require('../utils/calendarUtils');

// @desc    Get saints for a specific date
// @route   GET /api/calendar/saints/:month/:day
// @access  Public
const getSaintsByDate = async (req, res) => {
    try {
        const { month, day } = req.params;

        const saints = await Saint.find({
            'feastDay.month': parseInt(month),
            'feastDay.day': parseInt(day)
        }).sort({ name: 1 });

        res.json({
            success: true,
            saints,
            count: saints.length,
            date: { month: parseInt(month), day: parseInt(day) }
        });
    } catch (error) {
        console.error('Error fetching saints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saints'
        });
    }
};

// @desc    Get daily readings
// @route   GET /api/calendar/readings/:month/:day
// @access  Public
const getReadingsByDate = async (req, res) => {
    try {
        const { month, day } = req.params;

        let reading = await Reading.findOne({
            'date.month': parseInt(month),
            'date.day': parseInt(day)
        });

        // If no reading found, get default readings for the month
        if (!reading) {
            reading = await Reading.findOne({
                'date.month': parseInt(month),
                'date.day': 0 // Default readings
            });
        }

        res.json({
            success: true,
            readings: reading ? reading.readings : [],
            date: { month: parseInt(month), day: parseInt(day) }
        });
    } catch (error) {
        console.error('Error fetching readings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch readings'
        });
    }
};

// @desc    Get holidays for a year
// @route   GET /api/calendar/holidays/:year
// @access  Public
const getHolidaysByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const ethYear = parseInt(year);
        
        // Get all fixed holidays
        const fixedHolidays = await Holiday.find({ type: 'fixed' });
        
        // Calculate movable holidays for the given year
        const movableHolidays = calculateMovableHolidays(ethYear);
        
        // Format holidays with Ethiopian dates
        const formattedHolidays = [
            ...fixedHolidays.map(h => ({
                ...h.toObject(),
                ethiopianDate: {
                    year: ethYear,
                    month: h.date.month,
                    day: h.date.day
                },
                gregorianDate: ethToGC(ethYear, h.date.month, h.date.day)
            })),
            ...movableHolidays
        ];
        
        // Sort by month and day
        formattedHolidays.sort((a, b) => {
            if (a.ethiopianDate.month !== b.ethiopianDate.month) {
                return a.ethiopianDate.month - b.ethiopianDate.month;
            }
            return a.ethiopianDate.day - b.ethiopianDate.day;
        });

        res.json({
            success: true,
            holidays: formattedHolidays,
            year: ethYear,
            total: formattedHolidays.length
        });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch holidays'
        });
    }
};

// Helper function to calculate movable holidays
const calculateMovableHolidays = (year) => {
    const holidays = [];
    
    // Calculate Easter (Fasika) using Ethiopian Orthodox computus
    const easter = calculateEthiopianEaster(year);
    holidays.push({
        name: 'ፋሲካ',
        nameAmharic: 'ፋሲካ',
        nameEnglish: 'Easter',
        type: 'movable',
        ethiopianDate: easter,
        description: 'የጌታችን ኢየሱስ ክርስቶስ ትንሣኤ',
        descriptionEnglish: 'Resurrection of Our Lord Jesus Christ'
    });
    
    // Calculate other movable feasts
    // Palm Sunday (7 days before Easter)
    const palmSunday = {
        month: easter.month,
        day: easter.day - 7
    };
    if (palmSunday.day < 1) {
        palmSunday.month--;
        if (palmSunday.month < 1) palmSunday.month = 13;
        palmSunday.day += (palmSunday.month === 13 ? (year % 4 === 3 ? 6 : 5) : 30);
    }
    holidays.push({
        name: 'ሆሣዕና',
        nameAmharic: 'ሆሣዕና',
        nameEnglish: 'Palm Sunday',
        type: 'movable',
        ethiopianDate: palmSunday,
        description: 'የጌታ ወደ ኢየሩሳሌም መግባት',
        descriptionEnglish: 'Triumphal Entry into Jerusalem'
    });
    
    // Ascension (40 days after Easter)
    const ascension = {
        month: easter.month,
        day: easter.day + 40
    };
    while (ascension.day > getDaysInMonth(ascension.month, year)) {
        ascension.day -= getDaysInMonth(ascension.month, year);
        ascension.month++;
        if (ascension.month > 13) ascension.month = 1;
    }
    holidays.push({
        name: 'ዕርገት',
        nameAmharic: 'ዕርገት',
        nameEnglish: 'Ascension',
        type: 'movable',
        ethiopianDate: ascension,
        description: 'የጌታችን ወደ ሰማይ መውጣት',
        descriptionEnglish: 'Ascension of Our Lord'
    });
    
    // Pentecost (50 days after Easter)
    const pentecost = {
        month: easter.month,
        day: easter.day + 50
    };
    while (pentecost.day > getDaysInMonth(pentecost.month, year)) {
        pentecost.day -= getDaysInMonth(pentecost.month, year);
        pentecost.month++;
        if (pentecost.month > 13) pentecost.month = 1;
    }
    holidays.push({
        name: 'ጰራቅሊጦስ',
        nameAmharic: 'ጰራቅሊጦስ',
        nameEnglish: 'Pentecost',
        type: 'movable',
        ethiopianDate: pentecost,
        description: 'የመንፈስ ቅዱስ መውረድ',
        descriptionEnglish: 'Descent of the Holy Spirit'
    });
    
    return holidays;
};

// Ethiopian Easter calculation (simplified - in production, use proper computus)
const calculateEthiopianEaster = (year) => {
    // This is a simplified calculation
    // In reality, Ethiopian Easter follows complex computus rules
    const baseDate = new Date(year + 7, 2, 21); // March 21 Gregorian
    const moonPhase = (year % 19) * 11;
    const offset = (moonPhase + 14) % 30;
    
    let day = 21 + offset;
    let month = 9; // Megabit
    
    if (day > 30) {
        day -= 30;
        month = 10; // Miazia
    }
    
    return { month, day };
};

const getDaysInMonth = (month, year) => {
    if (month === 13) {
        return (year % 4 === 3) ? 6 : 5;
    }
    return 30;
};

// @desc    Search saints by name
// @route   GET /api/calendar/saints/search
// @access  Public
const searchSaints = async (req, res) => {
    try {
        const { q, category, month, limit = 20 } = req.query;
        
        const query = {};
        
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { nameAmharic: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }
        
        if (category) {
            query.category = category;
        }
        
        if (month) {
            query['feastDay.month'] = parseInt(month);
        }
        
        const saints = await Saint.find(query)
            .limit(parseInt(limit))
            .sort({ name: 1 });

        res.json({
            success: true,
            saints,
            count: saints.length
        });
    } catch (error) {
        console.error('Error searching saints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search saints'
        });
    }
};

// @desc    Get saint of the day
// @route   GET /api/calendar/saints/today
// @access  Public
const getSaintOfTheDay = async (req, res) => {
    try {
        const today = new Date();
        const { month, day } = gcToEth(today);
        
        const saints = await Saint.find({
            'feastDay.month': month,
            'feastDay.day': day
        });

        res.json({
            success: true,
            saints,
            date: { month, day }
        });
    } catch (error) {
        console.error('Error fetching saint of the day:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saint of the day'
        });
    }
};

// @desc    Get upcoming feasts
// @route   GET /api/calendar/upcoming
// @access  Public
const getUpcomingFeasts = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const today = new Date();
        const { month: currentMonth, day: currentDay, year } = gcToEth(today);
        
        const upcoming = [];
        
        // Get all saints and holidays
        const saints = await Saint.find({});
        const holidays = await Holiday.find({});
        
        // Check each day for upcoming feasts
        for (let i = 0; i < parseInt(days); i++) {
            let checkMonth = currentMonth;
            let checkDay = currentDay + i;
            let checkYear = year;
            
            // Adjust for month rollover
            while (checkDay > getDaysInMonth(checkMonth, checkYear)) {
                checkDay -= getDaysInMonth(checkMonth, checkYear);
                checkMonth++;
                if (checkMonth > 13) {
                    checkMonth = 1;
                    checkYear++;
                }
            }
            
            // Find saints for this day
            const daySaints = saints.filter(s => 
                s.feastDay.month === checkMonth && 
                s.feastDay.day === checkDay
            );
            
            // Find holidays for this day
            const dayHolidays = holidays.filter(h => 
                h.date.month === checkMonth && 
                h.date.day === checkDay
            );
            
            if (daySaints.length > 0 || dayHolidays.length > 0) {
                upcoming.push({
                    date: { month: checkMonth, day: checkDay, year: checkYear },
                    daysAway: i,
                    saints: daySaints,
                    holidays: dayHolidays,
                    gregorianDate: ethToGC(checkYear, checkMonth, checkDay)
                });
            }
        }

        res.json({
            success: true,
            upcoming,
            count: upcoming.length
        });
    } catch (error) {
        console.error('Error fetching upcoming feasts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming feasts'
        });
    }
};

// @desc    Convert date
// @route   POST /api/calendar/convert
// @access  Public
const convertDate = async (req, res) => {
    try {
        const { from, to, date } = req.body;
        
        let result;
        let converted;
        
        if (from === 'gregorian' && to === 'ethiopian') {
            const gregorianDate = new Date(date);
            converted = gcToEth(gregorianDate);
            result = {
                year: converted.year,
                month: converted.month,
                day: converted.day,
                monthName: getEthiopianMonthName(converted.month),
                dayName: getEthiopianDayName(gregorianDate.getDay()),
                isLeapYear: converted.year % 4 === 3
            };
        } else if (from === 'ethiopian' && to === 'gregorian') {
            const { year, month, day } = date;
            converted = ethToGC(year, month, day);
            result = {
                year: converted.getFullYear(),
                month: converted.getMonth() + 1,
                day: converted.getDate(),
                monthName: getGregorianMonthName(converted.getMonth()),
                dayName: getGregorianDayName(converted.getDay())
            };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversion type'
            });
        }
        
        res.json({
            success: true,
            result,
            from: { calendar: from, date },
            to: { calendar: to, date: result }
        });
    } catch (error) {
        console.error('Error converting date:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to convert date'
        });
    }
};

const getEthiopianMonthName = (month) => {
    const months = [
        'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
        'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
    ];
    return months[month - 1];
};

const getGregorianMonthName = (month) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
};

const getEthiopianDayName = (dayIndex) => {
    const days = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];
    return days[dayIndex];
};

const getGregorianDayName = (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
};

module.exports = {
    getSaintsByDate,
    getReadingsByDate,
    getHolidaysByYear,
    searchSaints,
    getSaintOfTheDay,
    getUpcomingFeasts,
    convertDate
};