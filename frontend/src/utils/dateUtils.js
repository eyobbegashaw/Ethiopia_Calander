// Date formatting utilities
export const formatDate = (date, format = 'full') => {
    const d = new Date(date);
    
    const formats = {
        short: d.toLocaleDateString(),
        medium: d.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        full: d.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        time: d.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        datetime: d.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
    
    return formats[format] || formats.full;
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        
        if (interval >= 1) {
            return interval === 1 
                ? `1 ${unit} ago` 
                : `${interval} ${unit}s ago`;
        }
    }
    
    return 'just now';
};

// Check if date is today
export const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
};

// Check if date is yesterday
export const isYesterday = (date) => {
    const d = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
};

// Get start of day
export const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Get end of day
export const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

// Get date range
export const getDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
};

// Format Ethiopian date
export const formatEthiopianDate = (year, month, day) => {
    const ethiopianMonths = [
        'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
        'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
    ];
    
    return `${ethiopianMonths[month - 1]} ${day}, ${year}`;
};

// Parse date string
export const parseDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? null : date;
};

// Get days in month
export const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
};

// Add days to date
export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Subtract days from date
export const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

// Get difference in days between two dates
export const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diff = Math.abs(new Date(date1) - new Date(date2));
    return Math.round(diff / oneDay);
};

// Check if date is in range
export const isDateInRange = (date, start, end) => {
    const d = new Date(date);
    return d >= new Date(start) && d <= new Date(end);
};

// Get the week number of the year
export const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// Get month name
export const getMonthName = (month, locale = 'en') => {
    const months = {
        en: ['January', 'February', 'March', 'April', 'May', 'June', 
             'July', 'August', 'September', 'October', 'November', 'December'],
        am: ['ጃንዩወሪ', 'ፌብሩወሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን',
             'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር', 'ዲሴምበር']
    };
    
    return months[locale]?.[month] || months.en[month];
};

// Get day name
export const getDayName = (day, locale = 'en') => {
    const days = {
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        am: ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']
    };
    
    return days[locale]?.[day] || days.en[day];
};

// Check if year is leap year (Gregorian)
export const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Get age from birthdate
export const getAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
};

// Format time remaining
// Format time remaining (continued)
export const formatTimeRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    if (minutes > 0) return `${minutes}m remaining`;
    return 'Less than a minute';
};

// Get calendar month data
export const getCalendarMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday
    
    const weeks = [];
    let currentWeek = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
        currentWeek.push(null);
    }
    
    // Fill in the days
    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(day);
        
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    
    // Add empty cells for remaining days
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }
    
    return {
        year,
        month,
        daysInMonth,
        startingDay,
        weeks
    };
};

// Get quarter
export const getQuarter = (date) => {
    const month = new Date(date).getMonth();
    return Math.floor(month / 3) + 1;
};

// Check if dates are same day
export const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
};

// Get start of week (Sunday)
export const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
};

// Get end of week (Saturday)
export const endOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (6 - day));
    return d;
};

// Get start of month
export const startOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Get end of month
export const endOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// Get start of year
export const startOfYear = (date) => {
    return new Date(date.getFullYear(), 0, 1);
};

// Get end of year
export const endOfYear = (date) => {
    return new Date(date.getFullYear(), 11, 31);
};

// Format date for API
export const formatForAPI = (date) => {
    return date.toISOString().split('T')[0];
};

// Parse API date
export const parseAPIDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Get timezone offset
export const getTimezoneOffset = () => {
    const date = new Date();
    return -date.getTimezoneOffset() / 60;
};

// Convert to timezone
export const toTimeZone = (date, timezone) => {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
};

// Get business days between dates
export const getBusinessDaysBetween = (startDate, endDate) => {
    let count = 0;
    const curDate = new Date(startDate);
    
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    
    return count;
};

// Check if date is weekend
export const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

// Check if date is weekday
export const isWeekday = (date) => {
    return !isWeekend(date);
};

// Get next occurrence of a day
export const getNextDay = (date, targetDay) => {
    const result = new Date(date);
    const currentDay = result.getDay();
    const daysToAdd = (targetDay - currentDay + 7) % 7;
    if (daysToAdd === 0) return result;
    result.setDate(result.getDate() + daysToAdd);
    return result;
};

// Get previous occurrence of a day
export const getPreviousDay = (date, targetDay) => {
    const result = new Date(date);
    const currentDay = result.getDay();
    const daysToSubtract = (currentDay - targetDay + 7) % 7;
    if (daysToSubtract === 0) return result;
    result.setDate(result.getDate() - daysToSubtract);
    return result;
};

// Format duration
export const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);
    
    return parts.join(' ') || '0s';
};

// Get month calendar with events
export const getMonthCalendar = (year, month, events = []) => {
    const calendar = getCalendarMonth(year, month);
    
    // Add events to calendar days
    calendar.weeks = calendar.weeks.map(week => 
        week.map(day => {
            if (!day) return { day: null };
            
            const date = new Date(year, month, day);
            const dayEvents = events.filter(event => 
                isSameDay(new Date(event.date), date)
            );
            
            return {
                day,
                events: dayEvents,
                isToday: isSameDay(date, new Date()),
                isWeekend: isWeekend(date)
            };
        })
    );
    
    return calendar;
};