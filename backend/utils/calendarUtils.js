// Ethiopian to Gregorian conversion utilities

const ethiopianMonths = [
    "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
    "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

const gregorianMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Convert Ethiopian numerals to Arabic numerals
const ethiopianNumerals = {
    '፩': 1, '፪': 2, '፫': 3, '፬': 4, '፭': 5,
    '፮': 6, '፯': 7, '፰': 8, '፱': 9, '፲': 10,
    '፳': 20, '፴': 30, '፵': 40, '፶': 50, '፷': 60,
    '፸': 70, '፹': 80, '፺': 90, '፻': 100, '፼': 10000
};

// Convert number to Ethiopian numeral
const toEthNum = (num) => {
    if (num === 0) return '0';
    
    const base = {
        1: '፩', 2: '፪', 3: '፫', 4: '፬', 5: '፭',
        6: '፮', 7: '፯', 8: '፰', 9: '፱',
        10: '፲', 20: '፳', 30: '፴', 40: '፵', 50: '፶',
        60: '፷', 70: '፸', 80: '፹', 90: '፺', 100: '፻'
    };
    
    let res = '';
    
    if (num >= 10000) {
        let t = Math.floor(num / 10000);
        res += (t > 1 ? toEthNum(t) : '') + '፼';
        num %= 10000;
    }
    
    if (num >= 100) {
        let h = Math.floor(num / 100);
        res += (h > 1 ? toEthNum(h) : '') + '፻';
        num %= 100;
    }
    
    if (num >= 10) {
        let t = Math.floor(num / 10) * 10;
        res += base[t] || '';
        num %= 10;
    }
    
    if (num > 0) res += base[num];
    
    return res;
};

// Check if Ethiopian year is leap year
const isEthLeap = (year) => {
    return year % 4 === 3;
};

// Convert Ethiopian date to Gregorian
const ethToGC = (ey, em, ed) => {
    // Ethiopian New Year in Gregorian (September 11 or 12)
    const gcNewYear = new Date(ey + 7, 8, isEthLeap(ey + 7) ? 12 : 11);
    
    // Calculate days offset
    let days = (em - 1) * 30 + (ed - 1);
    if (em === 13) days = 360 + ed - 1; // Pagume
    
    return new Date(gcNewYear.getTime() + days * 24 * 60 * 60 * 1000);
};

// Convert Gregorian date to Ethiopian
const gcToEth = (gDate) => {
    const gYear = gDate.getFullYear();
    const gMonth = gDate.getMonth();
    const gDay = gDate.getDate();
    
    // Approximate Ethiopian year
    let ethYear = gYear - 7;
    
    // Ethiopian New Year in Gregorian
    const newYear = new Date(gYear, 8, isEthLeap(ethYear) ? 12 : 11);
    
    // If date is before New Year, it's in the previous Ethiopian year
    if (gDate < newYear) {
        ethYear--;
        return gcToEth(new Date(gYear - 1, 8, isEthLeap(ethYear) ? 12 : 11));
    }
    
    // Calculate days difference
    const diff = Math.floor((gDate - newYear) / (24 * 60 * 60 * 1000));
    
    // Convert to Ethiopian month and day
    const ethMonth = Math.floor(diff / 30) + 1;
    const ethDay = (diff % 30) + 1;
    
    return { 
        year: ethYear, 
        month: ethMonth, 
        day: ethDay 
    };
};

// Get Ethiopian month name
const getEthiopianMonthName = (month, lang = 'am') => {
    if (lang === 'am') {
        return ethiopianMonths[month - 1];
    }
    // Add English month names if needed
    const englishMonths = [
        "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
        "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
    ];
    return englishMonths[month - 1];
};

// Get Gregorian month name
const getGregorianMonthName = (month) => {
    return gregorianMonths[month];
};

// Get days in Ethiopian month
const getDaysInEthiopianMonth = (year, month) => {
    if (month === 13) {
        return isEthLeap(year) ? 6 : 5;
    }
    return 30;
};

// Format Ethiopian date
const formatEthiopianDate = (year, month, day, options = {}) => {
    const { lang = 'am', numerals = 'ethiopic' } = options;
    
    const monthName = getEthiopianMonthName(month, lang);
    const dayStr = numerals === 'ethiopic' ? toEthNum(day) : day.toString();
    const yearStr = numerals === 'ethiopic' ? toEthNum(year) : year.toString();
    
    return `${monthName} ${dayStr}, ${yearStr}`;
};

// Validate Ethiopian date
const isValidEthiopianDate = (year, month, day) => {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 13) return false;
    
    const maxDays = getDaysInEthiopianMonth(year, month);
    return day >= 1 && day <= maxDays;
};

// Get Ethiopian Easter date (simplified calculation)
const getEthiopianEaster = (year) => {
    // This is a simplified calculation
    // In reality, Ethiopian Easter follows complex computus
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

// Calculate age in Ethiopian years
const getEthiopianAge = (birthDate) => {
    const today = new Date();
    const ethToday = gcToEth(today);
    const ethBirth = gcToEth(birthDate);
    
    let age = ethToday.year - ethBirth.year;
    
    // Adjust if birthday hasn't occurred yet this year
    if (ethToday.month < ethBirth.month || 
        (ethToday.month === ethBirth.month && ethToday.day < ethBirth.day)) {
        age--;
    }
    
    return age;
};

module.exports = {
    toEthNum,
    isEthLeap,
    ethToGC,
    gcToEth,
    getEthiopianMonthName,
    getGregorianMonthName,
    getDaysInEthiopianMonth,
    formatEthiopianDate,
    isValidEthiopianDate,
    getEthiopianEaster,
    getEthiopianAge,
    ethiopianMonths,
    gregorianMonths
};