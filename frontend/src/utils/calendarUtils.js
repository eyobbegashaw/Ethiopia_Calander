// Ethiopian Numerals
export function toEthNum(num) {
    const base = {
        1: '፩', 2: '፪', 3: '፫', 4: '፬', 5: '፭', 6: '፮', 7: '፯', 8: '፰', 9: '፱',
        10: '፲', 20: '፳', 30: '፴', 40: '፵', 50: '፶', 60: '፷', 70: '፸', 80: '፹', 90: '፺', 100: '፻'
    };
    if (num === 0) return '0';
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
}

export function isEthLeap(year) {
    return year % 4 === 3;
}

export function ethToGC(ey, em, ed) {
    const gcNewYear = new Date(ey + 7, 8, isEthLeap(ey + 7) ? 12 : 11);
    let days = (em - 1) * 30 + (ed - 1);
    if (em === 13) days = 360 + ed - 1;
    return new Date(gcNewYear.getTime() + days * 24 * 60 * 60 * 1000);
}

export function gcToEth(gDate) {
    // Fixed conversion: Ethiopian New Year is on September 11 (or 12 in leap years)
    // Ethiopian year = Gregorian year - 8 (for dates from Jan 1 to Sep 10)
    // Ethiopian year = Gregorian year - 7 (for dates from Sep 11 to Dec 31)
    
    const year = gDate.getFullYear();
    const month = gDate.getMonth(); // 0-11 (Jan = 0, Sep = 8, Dec = 11)
    const day = gDate.getDate();
    
    let ethYear;
    let newYearDate;
    
    // Determine which Ethiopian year this date falls in
    if (month < 8) { // January to August (before September)
        // For dates before September, we're in the Ethiopian year that started in previous Gregorian year
        ethYear = year - 8;
        // Check if previous year was leap to determine New Year day
        const newYearDay = isEthLeap(ethYear) ? 12 : 11;
        newYearDate = new Date(year - 1, 8, newYearDay); // New Year was in September of previous year
    } else if (month === 8) { // September
        // Check if current Ethiopian year is leap
        ethYear = year - 7;
        const newYearDay = isEthLeap(ethYear) ? 12 : 11;
        newYearDate = new Date(year, 8, newYearDay);
        
        // If date is before New Year, we're still in previous Ethiopian year
        if (day < newYearDay) {
            ethYear = year - 8;
            const prevNewYearDay = isEthLeap(ethYear) ? 12 : 11;
            newYearDate = new Date(year - 1, 8, prevNewYearDay);
        }
    } else { // October to December (after September)
        ethYear = year - 7;
        const newYearDay = isEthLeap(ethYear) ? 12 : 11;
        newYearDate = new Date(year, 8, newYearDay);
    }
    
    // Calculate days since Ethiopian New Year
    const diffTime = gDate - newYearDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate Ethiopian month and day
    // Ethiopian months are 30 days each, with 13th month having 5 or 6 days
    let ethMonth = Math.floor(diffDays / 30) + 1;
    let ethDay = (diffDays % 30) + 1;
    
    // Handle Pagume (13th month)
    const daysInYear = isEthLeap(ethYear) ? 366 : 365;
    const ethDaysInYear = 13 * 30; // 390 days in Ethiopian year (including Pagume)
    
    // If we've gone beyond the 13th month, adjust
    if (ethMonth > 13) {
        ethYear += 1;
        ethMonth = 1;
    }
    
    return { 
        year: ethYear, 
        month: ethMonth, 
        day: ethDay 
    };
}

// Test function for February 28, 2026
export function testDate() {
    const testDate = new Date(2026, 1, 28); // February 28, 2026
    const result = gcToEth(testDate);
    console.log('Test Result:', result);
    return result;
}

export const ethiopianMonths = [
    "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
    "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

export const ethiopianWeekdays = [
    "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ", "እሁድ"
];

export const gregorianMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const dayNames = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
export const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];