const { Saint, Reading, Holiday } = require('../models/Calendar');
const { gcToEth, ethToGC } = require('../utils/calendarUtils');

class BahreHasab {
    constructor(year) {
        this.year = parseInt(year);
        this.ameteAlem = this.year + 5500;
        this.months = ["መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"];
        this.weekdayNames = ["ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ", "እሁድ"];
    }

    // 1. መስከረም 1 ቀን የሳምንቱን ስንተኛ ቀን እንደሆነ ማወቅ (0=ሰኞ ... 6=እሁድ)
    getMeskerem1Weekday() {
        // Correct formula: (AmeteAlem + floor(AmeteAlem / 4)) % 7
        // This determines the day of week for Meskerem 1
        const r = (this.ameteAlem + Math.floor(this.ameteAlem / 4)) % 7;
        // Convert to index where 0=ሰኞ, 1=ማክሰኞ, ..., 6=እሁድ
        const index = (r + 5) % 7; 
        return index;
    }

    // Calculate Metke (date of Beale Metke)
    calculateMetke() {
        // ማዕድ (Medeb) - position in 19-year cycle
        const medeb = this.ameteAlem % 19;
        
        // ወንበር (Wenber) - 1-18
        const wenber = medeb === 0 ? 18 : medeb - 1;
        
        // አበቅቴ (Abekte) - days after full moon
        const abekte = (wenber * 11) % 30;
        
        // መጥቅዕ (Metke) - date of Beale Metke from Meskerem 1
        // If abekte is 0, Metke is 30 (full month)
        const metke = abekte === 0 ? 30 : 30 - abekte;
        
        // Determine month: If Metke > 14, it's in Meskerem, otherwise in Tikimt
        const metkeMonth = metke > 14 ? "መስከረም" : "ጥቅምት";
        
        return { metke, metkeMonth };
    }

    // Calculate Tewsak based on Beale Metke weekday
    calculateTewsak(bealeMetkeWeekday) {
        // Tewsak constants based on traditional Ethiopian calendar:
        // Weekday index (0-6) -> Tewsak value
        // ሰኞ(0)=5, ማክሰኞ(1)=4, ረቡዕ(2)=3, ሐሙስ(3)=2, ዓርብ(4)=1, ቅዳሜ(5)=8, እሁድ(6)=7
        const tewsakMap = [5, 4, 3, 2, 1, 8, 7];
        return tewsakMap[bealeMetkeWeekday];
    }

    // Calculate Mebaja Hamer
    calculateMebajaHamer(metke, tewsak) {
        let mebajaHamer = metke + tewsak;
        if (mebajaHamer > 30) {
            mebajaHamer -= 30;
        }
        return mebajaHamer;
    }

    // Determine Nenewe month based on Metke and Mebaja Hamer
    determineNeneweMonth(metke, mebajaHamer, tewsak) {
        // If Metke > 14 and Metke + Tewsak > 30, Nenewe is in Yekatit
        // Otherwise, if Metke <= 14, Nenewe is in Yekatit
        // All other cases, Nenewe is in Tir
        if ((metke > 14 && metke + tewsak > 30) || metke <= 14) {
            return "የካቲት";
        } else {
            return "ጥር";
        }
    }

    // Add days to a given Ethiopian date
    addDays(startMonth, startDay, daysToAdd) {
        let currentMonth = startMonth;
        let currentDay = startDay;
        let remainingDays = daysToAdd;
        
        // Get month index
        let monthIndex = this.months.indexOf(currentMonth);
        
        while (remainingDays > 0) {
            // Get days in current month (all months except Pagume have 30 days)
            let daysInMonth = 30;
            
            // Pagume (ጳጉሜን) has 5 or 6 days
            if (monthIndex === 12) { // Pagume is the 13th month (index 12)
                // Check if Ethiopian year is leap (year % 4 === 3)
                daysInMonth = this.year % 4 === 3 ? 6 : 5;
            }
            
            const daysLeftInMonth = daysInMonth - currentDay + 1;
            
            if (remainingDays < daysLeftInMonth) {
                currentDay += remainingDays;
                remainingDays = 0;
            } else {
                remainingDays -= daysLeftInMonth;
                currentDay = 1;
                monthIndex = (monthIndex + 1) % 13;
                currentMonth = this.months[monthIndex];
            }
        }
        
        return {
            month: currentMonth,
            day: currentDay
        };
    }

    // Get feast name in Amharic
    getFeastName(key) {
        const feastNames = {
            abiyTsom: "አቢይ ጾም",
            debreZeyit: "ደብረ ዘይት",
            hosanna: "ሆሣዕና",
            siklet: "ስቅለት",
            tinsae: "ትንሣኤ",
            rikbeKahnat: "ርክበ ካህናት",
            erget: "ዕርገት",
            paracletos: "ጰራቅሊጦስ",
            tsomHawaryat: "ጾመ ሐዋርያት",
            tsomDihnet: "ጾመ ድኅነት"
        };
        return feastNames[key] || key;
    }

    // Calculate all feasts for the year
    calculateAllFeasts() {
        // Step 1: Calculate Metke
        const { metke, metkeMonth } = this.calculateMetke();
        
        // Step 2: Get Meskerem 1 weekday
        const meskerem1Weekday = this.getMeskerem1Weekday();
        
        // Step 3: Calculate Beale Metke weekday
        // Beale Metke is on Metke day of MetkeMonth
        let daysFromMeskerem1;
        if (metkeMonth === "መስከረም") {
            daysFromMeskerem1 = metke - 1;
        } else {
            // If in Tikimt, add 30 days (full Meskerem month)
            daysFromMeskerem1 = 30 + (metke - 1);
        }
        
        const bealeMetkeWeekday = (meskerem1Weekday + daysFromMeskerem1) % 7;
        
        // Step 4: Calculate Tewsak
        const tewsak = this.calculateTewsak(bealeMetkeWeekday);
        
        // Step 5: Calculate Mebaja Hamer
        const mebajaHamer = this.calculateMebajaHamer(metke, tewsak);
        
        // Step 6: Determine Nenewe month
        const neneweMonth = this.determineNeneweMonth(metke, mebajaHamer, tewsak);
        
        // Build results object
        const results = {
            meskerem1: { 
                day: 1,
                month: "መስከረም",
                weekday: this.weekdayNames[meskerem1Weekday],
                full: `መስከረም 1:- ${this.weekdayNames[meskerem1Weekday]}`
            },
            metke: {
                value: metke,
                month: metkeMonth,
                full: `መጥቅዕ:- ${metkeMonth} ${metke}`
            },
            mebajaHamer: { 
                value: mebajaHamer, 
                full: `መባጃ ሐመር:- ${mebajaHamer}` 
            },
            nenewe: { 
                month: neneweMonth, 
                day: mebajaHamer, 
                full: `ጾመ ነነዌ:- ${neneweMonth} ${mebajaHamer}, ${this.year}`
            }
        };

        // Feast days offsets from Nenewe
        const feastDays = {
            abiyTsom: 14,      // Great Lent starts 14 days after Nenewe
            debreZeyit: 41,    // Debre Zeyit 41 days after Nenewe
            hosanna: 62,       // Palm Sunday 62 days after Nenewe
            siklet: 67,        // Good Friday 67 days after Nenewe
            tinsae: 69,        // Easter 69 days after Nenewe
            rikbeKahnat: 93,   // Rikbe Kahinat 93 days after Nenewe
            erget: 108,        // Ascension 108 days after Nenewe
            paracletos: 118,   // Pentecost 118 days after Nenewe
            tsomHawaryat: 119, // Apostles Fast 119 days after Nenewe
            tsomDihnet: 121    // Assumption Fast 121 days after Nenewe
        };

        // Calculate each feast
        for (const [key, days] of Object.entries(feastDays)) {
            const date = this.addDays(neneweMonth, mebajaHamer, days);
            results[key] = {
                ...date,
                full: `${this.getFeastName(key)}:- ${date.month} ${date.day}, ${this.year}`
            };
        }

        return results;
    }

    // Get full calculation result
    getFullResult() {
        return this.calculateAllFeasts();
    }
}

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

// @desc    Get holidays for a year (ባሕረ ሐሳብ)
// @route   GET /api/calendar/holidays/:year
// @access  Public
const getHolidaysByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const ethYear = parseInt(year);
        
        // Validate year
        if (isNaN(ethYear) || ethYear < 1900 || ethYear > 2100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year. Please provide a year between 1900 and 2100.'
            });
        }
        
        // Calculate Bahre Hasab
        const bahreHasab = new BahreHasab(ethYear);
        const movableFeasts = bahreHasab.getFullResult();
        
        // Get all fixed holidays from database
        const fixedHolidays = await Holiday.find({ type: 'fixed' });
        
        // Format fixed holidays
        const formattedFixedHolidays = fixedHolidays.map(h => ({
            ...h.toObject(),
            nameAmharic: h.nameAmharic,
            name: h.name,
            date: {
                month: h.date.month,
                day: h.date.day
            },
            type: 'fixed',
            formattedDate: `${bahreHasab.months[h.date.month - 1]} ${h.date.day}, ${ethYear}`,
            gregorianDate: ethToGC(ethYear, h.date.month, h.date.day)
        }));
        
        // Format movable feasts (ተንቀሳቃሽ በዓላት)
        const movableHolidays = [
            {
                name: 'ጾመ ነነዌ',
                nameAmharic: 'ጾመ ነነዌ',
                nameEnglish: 'Nineveh Fast',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.nenewe.month) + 1, day: movableFeasts.nenewe.day },
                formattedDate: movableFeasts.nenewe.full.split(':-')[1].trim(),
                description: 'የነነዌ ጾም መጀመሪያ',
                descriptionEnglish: 'Beginning of Nineveh Fast'
            },
            {
                name: 'አቢይ ጾም',
                nameAmharic: 'አቢይ ጾም',
                nameEnglish: 'Great Lent',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.abiyTsom.month) + 1, day: movableFeasts.abiyTsom.day },
                formattedDate: movableFeasts.abiyTsom.full.split(':-')[1].trim(),
                description: 'የአቢይ ጾም መጀመሪያ',
                descriptionEnglish: 'Beginning of Great Lent'
            },
            {
                name: 'ደብረ ዘይት',
                nameAmharic: 'ደብረ ዘይት',
                nameEnglish: 'Debre Zeyit',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.debreZeyit.month) + 1, day: movableFeasts.debreZeyit.day },
                formattedDate: movableFeasts.debreZeyit.full.split(':-')[1].trim(),
                description: 'ደብረ ዘይት',
                descriptionEnglish: 'Debre Zeyit'
            },
            {
                name: 'ሆሣዕና',
                nameAmharic: 'ሆሣዕና',
                nameEnglish: 'Palm Sunday',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.hosanna.month) + 1, day: movableFeasts.hosanna.day },
                formattedDate: movableFeasts.hosanna.full.split(':-')[1].trim(),
                description: 'የጌታ ወደ ኢየሩሳሌም መግባት',
                descriptionEnglish: 'Triumphal Entry into Jerusalem'
            },
            {
                name: 'ስቅለት',
                nameAmharic: 'ስቅለት',
                nameEnglish: 'Good Friday',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.siklet.month) + 1, day: movableFeasts.siklet.day },
                formattedDate: movableFeasts.siklet.full.split(':-')[1].trim(),
                description: 'የጌታችን ስቅለት',
                descriptionEnglish: 'Crucifixion of Our Lord'
            },
            {
                name: 'ፋሲካ',
                nameAmharic: 'ፋሲካ',
                nameEnglish: 'Easter',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.tinsae.month) + 1, day: movableFeasts.tinsae.day },
                formattedDate: movableFeasts.tinsae.full.split(':-')[1].trim(),
                description: 'የጌታችን ኢየሱስ ክርስቶስ ትንሣኤ',
                descriptionEnglish: 'Resurrection of Our Lord Jesus Christ'
            },
            {
                name: 'ርክበ ካህናት',
                nameAmharic: 'ርክበ ካህናት',
                nameEnglish: 'Rikbe Kahinat',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.rikbeKahnat.month) + 1, day: movableFeasts.rikbeKahnat.day },
                formattedDate: movableFeasts.rikbeKahnat.full.split(':-')[1].trim(),
                description: 'ርክበ ካህናት',
                descriptionEnglish: 'Rikbe Kahinat'
            },
            {
                name: 'ዕርገት',
                nameAmharic: 'ዕርገት',
                nameEnglish: 'Ascension',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.erget.month) + 1, day: movableFeasts.erget.day },
                formattedDate: movableFeasts.erget.full.split(':-')[1].trim(),
                description: 'የጌታችን ወደ ሰማይ መውጣት',
                descriptionEnglish: 'Ascension of Our Lord'
            },
            {
                name: 'ጰራቅሊጦስ',
                nameAmharic: 'ጰራቅሊጦስ',
                nameEnglish: 'Pentecost',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.paracletos.month) + 1, day: movableFeasts.paracletos.day },
                formattedDate: movableFeasts.paracletos.full.split(':-')[1].trim(),
                description: 'የመንፈስ ቅዱስ መውረድ',
                descriptionEnglish: 'Descent of the Holy Spirit'
            },
            {
                name: 'ጾመ ሐዋርያት',
                nameAmharic: 'ጾመ ሐዋርያት',
                nameEnglish: 'Apostles Fast',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.tsomHawaryat.month) + 1, day: movableFeasts.tsomHawaryat.day },
                formattedDate: movableFeasts.tsomHawaryat.full.split(':-')[1].trim(),
                description: 'የሐዋርያት ጾም መጀመሪያ',
                descriptionEnglish: 'Beginning of Apostles Fast'
            },
            {
                name: 'ጾመ ድኅነት',
                nameAmharic: 'ጾመ ድኅነት',
                nameEnglish: 'Assumption Fast',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.tsomDihnet.month) + 1, day: movableFeasts.tsomDihnet.day },
                formattedDate: movableFeasts.tsomDihnet.full.split(':-')[1].trim(),
                description: 'ጾመ ድኅነት መጀመሪያ',
                descriptionEnglish: 'Beginning of Assumption Fast'
            }
        ];
        
        // Combine fixed and movable holidays
        const allHolidays = [...formattedFixedHolidays, ...movableHolidays];
        
        // Sort by month and day
        allHolidays.sort((a, b) => {
            if (a.date.month !== b.date.month) {
                return a.date.month - b.date.month;
            }
            return a.date.day - b.date.day;
        });

        // Additional info
        const additionalInfo = {
            meskerem1: {
                day: 1,
                month: 1,
                weekday: movableFeasts.meskerem1.weekday,
                formatted: movableFeasts.meskerem1.full
            },
            metke: {
                value: movableFeasts.metke.value,
                month: movableFeasts.metke.month,
                formatted: movableFeasts.metke.full
            },
            mebajaHamer: {
                value: movableFeasts.mebajaHamer.value,
                formatted: movableFeasts.mebajaHamer.full
            }
        };

        res.json({
            success: true,
            holidays: allHolidays,
            year: ethYear,
            total: allHolidays.length,
            additionalInfo,
            bahreHasab: movableFeasts
        });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch holidays'
        });
    }
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
        
        // Calculate movable feasts for current year
        const bahreHasab = new BahreHasab(year);
        const movableFeasts = bahreHasab.getFullResult();
        
        // Get all saints and fixed holidays
        const saints = await Saint.find({});
        const fixedHolidays = await Holiday.find({ type: 'fixed' });
        
        // Convert movable feasts to array for easier filtering
        const movableList = [
            { name: 'ጾመ ነነዌ', date: movableFeasts.nenewe },
            { name: 'አቢይ ጾም', date: movableFeasts.abiyTsom },
            { name: 'ደብረ ዘይት', date: movableFeasts.debreZeyit },
            { name: 'ሆሣዕና', date: movableFeasts.hosanna },
            { name: 'ስቅለት', date: movableFeasts.siklet },
            { name: 'ፋሲካ', date: movableFeasts.tinsae },
            { name: 'ርክበ ካህናት', date: movableFeasts.rikbeKahnat },
            { name: 'ዕርገት', date: movableFeasts.erget },
            { name: 'ጰራቅሊጦስ', date: movableFeasts.paracletos },
            { name: 'ጾመ ሐዋርያት', date: movableFeasts.tsomHawaryat },
            { name: 'ጾመ ድኅነት', date: movableFeasts.tsomDihnet }
        ];
        
        // Helper function to get days in month
        const getDaysInMonth = (month, year) => {
            if (month === 13) return (year % 4 === 3) ? 6 : 5;
            return 30;
        };
        
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
            
            // Find fixed holidays for this day
            const dayFixedHolidays = fixedHolidays.filter(h => 
                h.date.month === checkMonth && 
                h.date.day === checkDay
            ).map(h => ({
                name: h.nameAmharic,
                type: 'fixed'
            }));
            
            // Find movable holidays for this day
            const dayMovableHolidays = movableList
                .filter(m => {
                    const monthIndex = bahreHasab.months.indexOf(m.date.month) + 1;
                    return monthIndex === checkMonth && m.date.day === checkDay;
                })
                .map(m => ({
                    name: m.name,
                    type: 'movable'
                }));
            
            const allDayHolidays = [...dayFixedHolidays, ...dayMovableHolidays];
            
            if (daySaints.length > 0 || allDayHolidays.length > 0) {
                upcoming.push({
                    date: { month: checkMonth, day: checkDay, year: checkYear },
                    monthName: bahreHasab.months[checkMonth - 1],
                    daysAway: i,
                    saints: daySaints,
                    holidays: allDayHolidays,
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

// @desc    Get Bahre Hasab calculation for a year
// @route   GET /api/calendar/bahre-hasab/:year
// @access  Public
const getBahreHasab = async (req, res) => {
    try {
        const { year } = req.params;
        
        const bahreHasab = new BahreHasab(parseInt(year));
        const result = bahreHasab.getFullResult();
        
        res.json({
            success: true,
            data: result,
            year: parseInt(year)
        });
    } catch (error) {
        console.error('Error calculating Bahre Hasab:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate Bahre Hasab'
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
    getBahreHasab,
    convertDate
};
