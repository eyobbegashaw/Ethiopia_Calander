// script.js - Main JavaScript file for Ethiopian Calendar

// ----------- Ethiopian Numerals -----------
function toEthNum(num){
    const base={1:'፩',2:'፪',3:'፫',4:'፬',5:'፭',6:'፮',7:'፯',8:'፰',9:'፱',10:'፲',20:'፳',30:'፴',40:'፵',50:'፶',60:'፷',70:'፸',80:'፹',90:'፺',100:'፻'};
    if(num===0) return '0';
    let res='';
    if(num>=10000){ let t=Math.floor(num/10000); res+=(t>1?toEthNum(t):'')+'፼'; num%=10000; }
    if(num>=100){ let h=Math.floor(num/100); res+=(h>1?toEthNum(h):'')+'፻'; num%=100; }
    if(num>=10){ let t=Math.floor(num/10)*10; res+=base[t]||''; num%=10; }
    if(num>0) res+=base[num];
    return res;
}

// ----------- Ethiopian-Gregorian Conversion -----------
function isEthLeap(year){ return year%4===3; }

function ethToGC(ey, em, ed){
    const gcNewYear=new Date(ey+7,8,isEthLeap(ey+7)?12:11);
    let days=(em-1)*30+(ed-1);
    if(em===13) days=360+ed-1;
    return new Date(gcNewYear.getTime()+days*24*60*60*1000);
}

function gcToEth(gDate){
    const gYear = gDate.getFullYear();
    const ethYear = gYear - 7;
    const newYear = new Date(gYear, 8, isEthLeap(ethYear) ? 12 : 11);
    
    if (gDate < newYear) {
        return gcToEth(new Date(gYear - 1, 8, isEthLeap(ethYear - 1) ? 12 : 11));
    }
    
    const diff = Math.floor((gDate - newYear) / (24 * 60 * 60 * 1000));
    const ethMonth = Math.floor(diff / 30) + 1;
    const ethDay = (diff % 30) + 1;
    
    return { year: ethYear, month: ethMonth, day: ethDay };
}

// Ethiopian Calendar Data
const ethiopianMonths = [
    "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", 
    "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

const ethiopianWeekdays = [
    "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ", "እሁድ"
];

const gregorianMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// User Management
let currentUser = null;
let users = JSON.parse(localStorage.getItem('ethiopianCalendarUsers')) || [];
let userHistory = JSON.parse(localStorage.getItem('userHistory')) || {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Set current date
    updateCurrentDate();
    
    // Initialize date converter dropdowns
    initializeDateDropdowns();
    
    // Initialize calendar
    initializeCalendar();
    
    // Initialize holiday calculator
    initializeHolidayCalculator();
    
    // Initialize Synaxarium
    initializeSynaxarium();
    
    // Initialize ግጻዊ
    initializeGizae();
    
    // Set up event listeners
    setupEventListeners();
    
    // Generate notifications
    generateNotifications();
});

// Setup event listeners
function setupEventListeners() {
    // Auth and user panel
    document.getElementById('user-avatar').addEventListener('click', toggleUserPanel);
    document.getElementById('close-panel').addEventListener('click', toggleUserPanel);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('login-tab').addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('signup-tab').addEventListener('click', () => switchAuthTab('signup'));
    document.getElementById('show-signup').addEventListener('click', () => switchAuthTab('signup'));
    document.getElementById('show-login').addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('signup-form').addEventListener('submit', signup);
    
    // Font size controls
    document.getElementById('font-decrease').addEventListener('click', decreaseFontSize);
    document.getElementById('font-reset').addEventListener('click', resetFontSize);
    document.getElementById('font-increase').addEventListener('click', increaseFontSize);
    
    // Calendar and converter
    document.getElementById('convert-to-ethiopian').addEventListener('click', convertToEthiopian);
    document.getElementById('convert-to-gregorian').addEventListener('click', convertToGregorian);
    document.getElementById('prev-month').addEventListener('click', previousMonth);
    document.getElementById('next-month').addEventListener('click', nextMonth);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('calculate-holidays').addEventListener('click', calculateHolidays);
    document.getElementById('month-select').addEventListener('change', updateDayDropdown);
    document.getElementById('search-saints').addEventListener('click', searchSaints);
    document.getElementById('gizae-month-select').addEventListener('change', updateGizaeDayDropdown);
    document.getElementById('search-gizae').addEventListener('click', searchGizae);
}

// Check authentication status
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    } else {
        // Show auth modal if no user is logged in
        setTimeout(() => {
            document.getElementById('auth-modal').classList.add('active');
        }, 1000);
    }
}

// Update user interface based on auth status
function updateUserInterface() {
    if (currentUser) {
        document.getElementById('user-display-name').textContent = currentUser.username;
        document.getElementById('user-email').textContent = currentUser.email;
        
        const avatar = document.getElementById('user-avatar');
        const avatarLarge = document.getElementById('user-avatar-large');
        
        if (currentUser.avatar) {
            avatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.username}">`;
            avatarLarge.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.username}">`;
        } else {
            // Create initials avatar
            const initials = currentUser.username.charAt(0).toUpperCase();
            avatar.innerHTML = initials;
            avatarLarge.innerHTML = initials;
        }
        
        // Hide auth modal
        document.getElementById('auth-modal').classList.remove('active');
    }
}

// Toggle user panel
function toggleUserPanel() {
    document.getElementById('user-panel').classList.toggle('active');
}

// Switch auth tab
function switchAuthTab(tab) {
    if (tab === 'login') {
        document.getElementById('login-tab').classList.add('active');
        document.getElementById('signup-tab').classList.remove('active');
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    } else {
        document.getElementById('signup-tab').classList.add('active');
        document.getElementById('login-tab').classList.remove('active');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }
}

// Login function
function login(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInterface();
        generateNotifications();
    } else {
        alert('Invalid username or password');
    }
}

// Signup function
function signup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        joined: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('ethiopianCalendarUsers', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInterface();
    generateNotifications();
    
    // Switch to login tab after successful signup
    switchAuthTab('login');
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('user-panel').classList.remove('active');
    document.getElementById('auth-modal').classList.add('active');
    document.getElementById('user-display-name').textContent = 'Guest User';
    document.getElementById('user-email').textContent = 'Not logged in';
    document.getElementById('user-avatar').innerHTML = '<i class="fas fa-user"></i>';
    document.getElementById('user-avatar-large').innerHTML = '<i class="fas fa-user"></i>';
}

// Font size controls
function decreaseFontSize() {
    const root = document.documentElement;
    let currentSize = parseFloat(getComputedStyle(root).getPropertyValue('--font-size'));
    if (currentSize > 12) {
        root.style.setProperty('--font-size', (currentSize - 1) + 'px');
    }
}

function resetFontSize() {
    document.documentElement.style.setProperty('--font-size', '16px');
}

function increaseFontSize() {
    const root = document.documentElement;
    let currentSize = parseFloat(getComputedStyle(root).getPropertyValue('--font-size'));
    if (currentSize < 24) {
        root.style.setProperty('--font-size', (currentSize + 1) + 'px');
    }
}

// Generate notifications for saints
function generateNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    notificationsList.innerHTML = '';
    
    // Today's saints
    const todayKey = "1-5"; // For demo, using Meskerem 5
    const todaySaints = saintsData[todayKey];
    
    if (todaySaints) {
        const todayNotification = document.createElement('div');
        todayNotification.className = 'notification-item';
        todayNotification.innerHTML = `
            <div class="notification-date">Today - መስከረም 5</div>
            <div class="notification-content">
                Today is the commemoration of ${todaySaints.map(s => s.name).join(' and ')}.
            </div>
        `;
        notificationsList.appendChild(todayNotification);
    }
    
    // Tomorrow's saints (demo - using Meskerem 6)
    const tomorrowKey = "1-6";
    const tomorrowSaints = saintsData[tomorrowKey];
    
    if (tomorrowSaints) {
        const tomorrowNotification = document.createElement('div');
        tomorrowNotification.className = 'notification-item';
        tomorrowNotification.innerHTML = `
            <div class="notification-date">Tomorrow - መስከረም 6</div>
            <div class="notification-content">
                Tomorrow is the commemoration of ${tomorrowSaints.map(s => s.name).join(' and ')}.
            </div>
        `;
        notificationsList.appendChild(tomorrowNotification);
    } else {
        // If no saints for tomorrow, show a generic message
        const tomorrowNotification = document.createElement('div');
        tomorrowNotification.className = 'notification-item';
        tomorrowNotification.innerHTML = `
            <div class="notification-date">Tomorrow - መስከረም 6</div>
            <div class="notification-content">
                No major saint commemorations tomorrow.
            </div>
        `;
        notificationsList.appendChild(tomorrowNotification);
    }
    
    // Add a notification about upcoming holidays
    const holidayNotification = document.createElement('div');
    holidayNotification.className = 'notification-item';
    holidayNotification.innerHTML = `
        <div class="notification-date">Upcoming - መስከረም 17</div>
        <div class="notification-content">
            Meskel (Finding of the True Cross) is coming soon!
        </div>
    `;
    notificationsList.appendChild(holidayNotification);
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const { year: eYear, month: eMonth, day: eDay } = gcToEth(now);
    
    document.getElementById('ethiopian-date').textContent = `${ethiopianMonths[eMonth - 1]} ${toEthNum(eDay)}, ${toEthNum(eYear)} እ.ኤ.አ.`;
    document.getElementById('gregorian-date').textContent = `${gregorianMonths[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} G.C.`;
    
    // Day name
    const dayNames = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
    const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = now.getDay();
    document.getElementById('day-name').textContent = `${dayNames[dayIndex]} (${englishDays[dayIndex]})`;
}

// Initialize date dropdowns for converter
function initializeDateDropdowns() {
    // Gregorian day dropdown
    const gDaySelect = document.getElementById('g-day');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        gDaySelect.appendChild(option);
    }
    
    // Gregorian month dropdown
    const gMonthSelect = document.getElementById('g-month');
    gregorianMonths.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        gMonthSelect.appendChild(option);
    });
    
    // Gregorian year dropdown
    const gYearSelect = document.getElementById('g-year');
    for (let i = 2020; i <= 2030; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        gYearSelect.appendChild(option);
    }
    gYearSelect.value = new Date().getFullYear();
    
    // Ethiopian day dropdown
    const eDaySelect = document.getElementById('e-day');
    for (let i = 1; i <= 30; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = toEthNum(i);
        eDaySelect.appendChild(option);
    }
    
    // Ethiopian month dropdown
    const eMonthSelect = document.getElementById('e-month');
    ethiopianMonths.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        eMonthSelect.appendChild(option);
    });
    
    // Ethiopian year dropdown
    const eYearSelect = document.getElementById('e-year');
    for (let i = 2015; i <= 2025; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = toEthNum(i);
        eYearSelect.appendChild(option);
    }
    eYearSelect.value = new Date().getFullYear() - 7;
}

// Convert Gregorian to Ethiopian date
function convertToEthiopian() {
    const day = parseInt(document.getElementById('g-day').value);
    const month = parseInt(document.getElementById('g-month').value);
    const year = parseInt(document.getElementById('g-year').value);
    
    const gDate = new Date(year, month - 1, day);
    const { year: ethYear, month: ethMonth, day: ethDay } = gcToEth(gDate);
    const result = `${ethiopianMonths[ethMonth - 1]} ${toEthNum(ethDay)}, ${toEthNum(ethYear)} እ.ኤ.አ.`;
    document.getElementById('g-to-e-result').textContent = result;
    
    // Save to user history if logged in
    if (currentUser) {
        saveToHistory('conversion', `Gregorian ${month}/${day}/${year} → Ethiopian ${ethiopianMonths[ethMonth - 1]} ${ethDay}, ${ethYear}`);
    }
}

// Convert Ethiopian to Gregorian date
function convertToGregorian() {
    const day = parseInt(document.getElementById('e-day').value);
    const month = parseInt(document.getElementById('e-month').value);
    const year = parseInt(document.getElementById('e-year').value);
    
    const gDate = ethToGC(year, month, day);
    const result = `${gregorianMonths[gDate.getMonth()]} ${gDate.getDate()}, ${gDate.getFullYear()} G.C.`;
    document.getElementById('e-to-g-result').textContent = result;
    
    // Save to user history if logged in
    if (currentUser) {
        saveToHistory('conversion', `Ethiopian ${ethiopianMonths[month - 1]} ${day}, ${year} → Gregorian ${gregorianMonths[gDate.getMonth()]} ${gDate.getDate()}, ${gDate.getFullYear()}`);
    }
}

// Save action to user history
function saveToHistory(type, action) {
    if (!currentUser) return;
    
    if (!userHistory[currentUser.id]) {
        userHistory[currentUser.id] = [];
    }
    
    userHistory[currentUser.id].push({
        type,
        action,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 items
    if (userHistory[currentUser.id].length > 50) {
        userHistory[currentUser.id] = userHistory[currentUser.id].slice(-50);
    }
    
    localStorage.setItem('userHistory', JSON.stringify(userHistory));
}

// Calendar functionality
let currentEthiopianMonth = 1; // Meskerem
let currentEthiopianYear = new Date().getFullYear() - 7;

function initializeCalendar() {
    renderCalendar(currentEthiopianMonth, currentEthiopianYear);
}

function renderCalendar(month, year) {
    document.getElementById('current-month-year').textContent = 
        `${ethiopianMonths[month-1]} ${toEthNum(year)}`;
    
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    // Calculate the first day of the month
    const firstDayGC = ethToGC(year, month, 1);
    const firstDay = firstDayGC.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Add days of the month
    const daysInMonth = month === 13 ? (isEthLeap(year) ? 6 : 5) : 30;
    const now = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const gDate = ethToGC(year, month, day);
        
        // Highlight today
        if (gDate.toDateString() === now.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Add saint indicator if there are saints for this day
        const saintKey = `${month}-${day}`;
        if (saintsData[saintKey]) {
            dayElement.classList.add('has-saint');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = toEthNum(day);
        dayElement.appendChild(dayNumber);
        
        // Add Gregorian date
        const gregDate = document.createElement('small');
        gregDate.textContent = `${gDate.getDate()} ${gregorianMonths[gDate.getMonth()]}`;
        dayElement.appendChild(gregDate);
        
        // Add events if any
        const ethHolidayKey = `${month}-${day}`;
        const gcHolidayKey = `${gDate.getMonth() + 1}-${gDate.getDate()}`;
        
        let holiday = ethHolidays[ethHolidayKey] || gcHolidays[gcHolidayKey];
        
        if (holiday) {
            const holidayElement = document.createElement('div');
            holidayElement.className = 'holiday-text';
            holidayElement.textContent = holiday;
            dayElement.appendChild(holidayElement);
            dayElement.classList.add('holiday');
        }
        
        // Add click event to show saints for this day
        dayElement.addEventListener('click', function() {
            showSaintsForDate(month, day);
        });
        
        calendarDays.appendChild(dayElement);
    }
}

function previousMonth() {
    currentEthiopianMonth--;
    if (currentEthiopianMonth < 1) {
        currentEthiopianMonth = 13;
        currentEthiopianYear--;
    }
    renderCalendar(currentEthiopianMonth, currentEthiopianYear);
}

function nextMonth() {
    currentEthiopianMonth++;
    if (currentEthiopianMonth > 13) {
        currentEthiopianMonth = 1;
        currentEthiopianYear++;
    }
    renderCalendar(currentEthiopianMonth, currentEthiopianYear);
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.querySelector('#theme-toggle i');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Make functions available globally
window.toEthNum = toEthNum;
window.gcToEth = gcToEth;
window.ethToGC = ethToGC;