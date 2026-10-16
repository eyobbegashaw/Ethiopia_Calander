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

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function utcDayNumber(year, month, day) {
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, month, day);
    return date.getTime() / MILLISECONDS_PER_DAY;
}

function localDateFromParts(year, month, day) {
    const date = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(year, month, day);
    return date;
}

function ethiopianNewYearDayNumber(year) {
    const gregorianYear = year + 7;
    const startDay = isEthLeap(year - 1) ? 12 : 11;
    return utcDayNumber(gregorianYear, 8, startDay);
}

export function ethToGC(ey, em, ed) {
    if (!Number.isInteger(ey) || ey < 1 ||
        !Number.isInteger(em) || em < 1 || em > 13 ||
        !Number.isInteger(ed) || ed < 1 ||
        ed > (em === 13 ? (isEthLeap(ey) ? 6 : 5) : 30)) {
        throw new RangeError('Invalid Ethiopian date.');
    }

    const daysSinceNewYear = (em - 1) * 30 + ed - 1;
    const newYear = ethiopianNewYearDayNumber(ey);
    const convertedDay = newYear + daysSinceNewYear;
    const convertedDate = new Date(convertedDay * MILLISECONDS_PER_DAY);
    return localDateFromParts(
        convertedDate.getUTCFullYear(),
        convertedDate.getUTCMonth(),
        convertedDate.getUTCDate()
    );
}

export function gcToEth(gDate) {
    if (!(gDate instanceof Date) || Number.isNaN(gDate.getTime())) {
        throw new TypeError('A valid Gregorian date is required.');
    }

    const gregorianYear = gDate.getFullYear();
    const dateDayNumber = utcDayNumber(
        gregorianYear,
        gDate.getMonth(),
        gDate.getDate()
    );
    const possibleEthYear = gregorianYear - 7;
    const ethYear = dateDayNumber >= ethiopianNewYearDayNumber(possibleEthYear)
        ? possibleEthYear
        : possibleEthYear - 1;
    const daysSinceNewYear = dateDayNumber - ethiopianNewYearDayNumber(ethYear);
    const ethMonth = Math.floor(daysSinceNewYear / 30) + 1;
    const ethDay = (daysSinceNewYear % 30) + 1;

    return {
        year: ethYear, 
        month: ethMonth, 
        day: ethDay 
    };
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