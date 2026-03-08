const { Saint, Reading, Holiday } = require('../models/Calendar');
const { gcToEth, ethToGC } = require('../utils/calendarUtils');

// የባሕረ ሐሳብ ክፍል (Bahre Hasab Class)
class BahreHasab {
    constructor(year) {
        this.year = parseInt(year);
        this.ameteAlem = this.year + 5500; // ዓመተ ዓለም
        this.months = [
            "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ",
            "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ",
            "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"
        ];
    }

    // መሠረታዊ ቀመሮችን ማስላት
    calculateBase() {
        // 1. መደብ (Medeb)
        this.medeb = this.ameteAlem % 19;
        
        // 2. ወንጌላዊ (Wenber / Evangelist)
        const wenber = this.medeb === 0 ? 18 : this.medeb - 1;
        const evangelists = ["ማቴዎስ", "ማርቆስ", "ሉቃስ", "ዮሐንስ"];
        const evangelistIndex = this.ameteAlem % 4;
        this.evangelist = evangelists[evangelistIndex === 0 ? 3 : evangelistIndex - 1];
        
        // 3. አበቅቴ (Abekte)
        this.abekte = (wenber * 11) % 30;
        
        // 4. መጥቅዕ (Metke)
        this.metke = this.abekte === 0 ? 30 : 30 - this.abekte;
        
        // 5. የመጥቅዕ ወር
        this.metkeMonth = this.metke > 14 ? "መስከረም" : "ጥቅምት";
        
        return {
            medeb: this.medeb,
            evangelist: this.evangelist,
            abekte: this.abekte,
            metke: this.metke,
            metkeMonth: this.metkeMonth
        };
    }

    // የመስከረም 1 ቀን የሳምንቱን ቀን ማስላት
    getMeskerem1Weekday() {
        const tinte = (this.ameteAlem + Math.floor(this.ameteAlem / 4) + 1) % 7;
        const weekdayMap = ["ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ", "እሁድ"];
        return weekdayMap[tinte];
    }

    // የመባጃ ሐመር ማስላት
    calculateMebajaHamer() {
        const baseYear = 2016;
        const baseMebaja = 23;
        const yearDiff = this.year - baseYear;
        let mebajaHamer = baseMebaja + yearDiff;
        
        if (mebajaHamer > 30) {
            mebajaHamer = mebajaHamer - 30;
        }
        
        this.mebajaHamer = mebajaHamer;
        return mebajaHamer;
    }

    // የነነዌን ቀን ማስላት
    calculateNenewe() {
        let month = "ጥር";
        let day = this.mebajaHamer;
        
        if (this.metke <= 14) {
            month = "የካቲት";
        }
        
        this.nenewe = { month, day };
        return this.nenewe;
    }

    // ቀናትን መደመር (ኢትዮጵያ ካሌንደር)
    addEthDays(startMonth, startDay, daysToAdd) {
        let monthIndex = this.months.indexOf(startMonth);
        let currentDay = startDay;
        let remainingDays = daysToAdd;
        
        while (remainingDays > 0) {
            const daysInMonth = (monthIndex === 12) ? 
                (this.year % 4 === 3 ? 6 : 5) : 30; // ጳጉሜን ልዩ ነው
            
            const daysLeftInMonth = daysInMonth - currentDay;
            
            if (remainingDays <= daysLeftInMonth) {
                currentDay += remainingDays;
                remainingDays = 0;
            } else {
                remainingDays -= (daysLeftInMonth + 1);
                monthIndex = (monthIndex + 1) % 13;
                currentDay = 1;
            }
        }
        
        return {
            month: this.months[monthIndex],
            day: currentDay
        };
    }

    // ተውሳክ ማስላት (Tewsak)
    calculateTewsak(month, day) {
        // ይህ ቀለል ያለ ስሌት ነው - በምስሉ መሠረት ማስተካከል ያስፈልጋል
        const baseDay = this.getMeskerem1Weekday();
        const dayMap = {
            "እሁድ": 1, "ሰኞ": 2, "ማክሰኞ": 3, 
            "ረቡዕ": 4, "ሐሙስ": 5, "ዓርብ": 6, "ቅዳሜ": 7
        };
        return dayMap[baseDay] || 1;
    }

    // ሁሉንም ተንቀሳቃሽ በዓላት ማስላት
    calculateAllFeasts() {
        // መሠረታዊ ስሌቶች
        this.calculateBase();
        this.calculateMebajaHamer();
        this.calculateNenewe();
        const meskerem1Weekday = this.getMeskerem1Weekday();
        
        // ከነነዌ ተነስቶ በዓላትን ማስላት
        const neneweDate = { month: this.nenewe.month, day: this.nenewe.day };
        
        // የበዓላት ቀናት (ከነነዌ ጀምሮ ያሉት ቀናት)
        const feastDays = {
            abiyTsom: 14,        // አቢይ ጾም
            debreZeyit: 41,      // ደብረ ዘይት
            hosanna: 62,         // ሆሣዕና
            siklet: 67,          // ስቅለት
            tinsae: 69,          // ትንሣኤ (ፋሲካ)
            rikbeKahnat: 93,     // ርክበ ካህናት
            erget: 108,          // ዕርገት
            paracletos: 118,     // ጰራቅሊጦስ
            tsomHawaryat: 119,   // ጾመ ሐዋርያት
            tsomDihnet: 121      // ጾመ ድኅነት
        };
        
        // በዓላትን ማስላት
        const feasts = {
            meskerem1: {
                day: 1,
                month: "መስከረም",
                weekday: meskerem1Weekday,
                full: `መስከረም 1:- ${meskerem1Weekday}`
            },
            mebajaHamer: {
                value: this.mebajaHamer,
                full: `መባጃ ሐመር:- ${this.mebajaHamer}`
            },
            nenewe: {
                ...neneweDate,
                full: `ጾመ ነነዌ:- ${neneweDate.month} ${neneweDate.day}, ${this.year}`
            }
        };
        
        // ሌሎቹን በዓላት አስላ
        for (const [key, days] of Object.entries(feastDays)) {
            const date = this.addEthDays(neneweDate.month, neneweDate.day, days);
            feasts[key] = {
                ...date,
                full: `${this.getFeastName(key)}:- ${date.month} ${date.day}, ${this.year}`
            };
        }
        
        return feasts;
    }

    getFeastName(key) {
        const names = {
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
        return names[key] || key;
    }

    getFullResult() {
        return {
            year: this.year,
            ...this.calculateAllFeasts()
        };
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
        
        // ባሕረ ሐሳብን አስላ
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
                formattedDate: movableFeasts.debreZeyit.full.split(':-')[1].trim()
            },
            {
                name: 'ሆሣዕና',
                nameAmharic: 'ሆሣዕና',
                nameEnglish: 'Palm Sunday',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.hosanna.month) + 1, day: movableFeasts.hosanna.day },
                formattedDate: movableFeasts.hosanna.full.split(':-')[1].trim(),
                description: 'የጌታ ወደ ኢየሩሳሌም መግባት'
            },
            {
                name: 'ስቅለት',
                nameAmharic: 'ስቅለት',
                nameEnglish: 'Good Friday',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.siklet.month) + 1, day: movableFeasts.siklet.day },
                formattedDate: movableFeasts.siklet.full.split(':-')[1].trim()
            },
            {
                name: 'ትንሣኤ',
                nameAmharic: 'ፋሲካ',
                nameEnglish: 'Easter',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.tinsae.month) + 1, day: movableFeasts.tinsae.day },
                formattedDate: movableFeasts.tinsae.full.split(':-')[1].trim(),
                description: 'የጌታችን ኢየሱስ ክርስቶስ ትንሣኤ'
            },
            {
                name: 'ርክበ ካህናት',
                nameAmharic: 'ርክበ ካህናት',
                nameEnglish: 'Rikbe Kahinat',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.rikbeKahnat.month) + 1, day: movableFeasts.rikbeKahnat.day },
                formattedDate: movableFeasts.rikbeKahnat.full.split(':-')[1].trim()
            },
            {
                name: 'ዕርገት',
                nameAmharic: 'ዕርገት',
                nameEnglish: 'Ascension',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.erget.month) + 1, day: movableFeasts.erget.day },
                formattedDate: movableFeasts.erget.full.split(':-')[1].trim(),
                description: 'የጌታችን ወደ ሰማይ መውጣት'
            },
            {
                name: 'ጰራቅሊጦስ',
                nameAmharic: 'ጰራቅሊጦስ',
                nameEnglish: 'Pentecost',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.paracletos.month) + 1, day: movableFeasts.paracletos.day },
                formattedDate: movableFeasts.paracletos.full.split(':-')[1].trim(),
                description: 'የመንፈስ ቅዱስ መውረድ'
            },
            {
                name: 'ጾመ ሐዋርያት',
                nameAmharic: 'ጾመ ሐዋርያት',
                nameEnglish: 'Apostles Fast',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.tsomHawaryat.month) + 1, day: movableFeasts.tsomHawaryat.day },
                formattedDate: movableFeasts.tsomHawaryat.full.split(':-')[1].trim()
            },
            {
                name: 'ጾመ ድኅነት',
                nameAmharic: 'ጾመ ድኅነት',
                nameEnglish: 'Assumption Fast',
                type: 'movable',
                date: { month: bahreHasab.months.indexOf(movableFeasts.tsomDihnet.month) + 1, day: movableFeasts.tsomDihnet.day },
                formattedDate: movableFeasts.tsomDihnet.full.split(':-')[1].trim()
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

        // ተጨማሪ መረጃ: መስከረም 1 ቀን እና መባጃ ሐመር
        const additionalInfo = {
            meskerem1: {
                day: 1,
                month: 1,
                weekday: movableFeasts.meskerem1.weekday,
                formatted: movableFeasts.meskerem1.full
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
            bahreHasab: movableFeasts // ሙሉ የባሕረ ሐሳብ ውጤት
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
        
        // የዘንድሮውን ተንቀሳቃሽ በዓላት አስላ
        const bahreHasab = new BahreHasab(year);
        const movableFeasts = bahreHasab.getFullResult();
        
        // Get all saints and fixed holidays
        const saints = await Saint.find({});
        const fixedHolidays = await Holiday.find({ type: 'fixed' });
        
        // ተንቀሳቃሽ በዓላትን ወደ አረፋዎች ቀይር
        const movableList = [
            { name: 'ጾመ ነነዌ', date: movableFeasts.nenewe },
            { name: 'አቢይ ጾም', date: movableFeasts.abiyTsom },
            { name: 'ደብረ ዘይት', date: movableFeasts.debreZeyit },
            { name: 'ሆሣዕና', date: movableFeasts.hosanna },
            { name: 'ስቅለት', date: movableFeasts.siklet },
            { name: 'ትንሣኤ', date: movableFeasts.tinsae },
            { name: 'ርክበ ካህናት', date: movableFeasts.rikbeKahnat },
            { name: 'ዕርገት', date: movableFeasts.erget },
            { name: 'ጰራቅሊጦስ', date: movableFeasts.paracletos },
            { name: 'ጾመ ሐዋርያት', date: movableFeasts.tsomHawaryat },
            { name: 'ጾመ ድኅነት', date: movableFeasts.tsomDihnet }
        ];
        
        // Check each day for upcoming feasts
        for (let i = 0; i < parseInt(days); i++) {
            let checkMonth = currentMonth;
            let checkDay = currentDay + i;
            let checkYear = year;
            
            // Adjust for month rollover
            const getDaysInMonth = (month, year) => {
                if (month === 13) return (year % 4 === 3) ? 6 : 5;
                return 30;
            };
            
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
