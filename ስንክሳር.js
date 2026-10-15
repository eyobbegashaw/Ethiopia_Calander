// Sample Saints Data for Synaxarium
const saintsData = {
    "1-1": [
        { 
            name: "ዮሐንስ መጥምቅ (John the Baptist)", 
            description: "የኢየሱስ ክርስቶስ መጥምቅ እና መሐይም። የጥምቀት ቀን መሐይም። እሱ ክርስቶስን በዮርዳኖስ እንባ ተጠምቆ ነበር።"
        }
    ],
    "1-5": [
        { 
            name: "ቅድስት ድንግል ማርያም (St. Virgin Mary)", 
            description: "የቅድስት ድንግል ማርያም ልደት በዓል። እሷ ለሁሉም ክርስቲያኖች እናት እንደሆነች ይታሰባል። በኖህስ ዘመን ተወልዳለች።"
        }
    ],
    "1-17": [
        { 
            name: "መስቀል (Finding of True Cross)", 
            description: "የቅዱስ እልፍ አድባር መስቀል መገኘት በዓል። በንግስት ሄለና በ320 ዓ.ም. ተገኝቷል።"
        }
    ],
    "1-21": [
        { 
            name: "ቅዱስ ማቴዎስ (St. Matthew)", 
            description: "የክርስቶስ ሐዋርያ እና ወንጌላዊ። ቀራጭ ነበር እና ክርስቶስ ጠርቶታል። ወንጌል ጽፎታል።"
        }
    ],
    "2-3": [
        { 
            name: "ቅዱስ ዳዊት (King David)", 
            description: "የእስራኤል ንጉሥ እና ዘፈኖች ደራሲ። ከጎልያድ ጋንንት አሸንፏል። የመሲህ ተአምራት አባት።"
        }
    ],
    "4-29": [
        { 
            name: "የኢየሱስ ክርስቶስ ልደት (Christmas)", 
            description: "የጌታችን ኢየሱስ ክርስቶስ ልደት በዓል። በቤተልሔም ከቅድስት ድንግል ማርያም ተወለደ።"
        }
    ],
    "5-11": [
        { 
            name: "ጥምቀት (Epiphany)", 
            description: "የጌታችን ኢየሱስ ክርስቶስ ጥምቀት በዓል። በዮርዳኖስ በዮሐንስ መጥምቅ ተጠምቆ ሲሳደብ ሦስት ሰማያት ተከፈቱ።"
        }
    ],
    "7-23": [
        { 
            name: "ቅዱስ ጊዮርጊስ (St. George)", 
            description: "የእምነት ተሟጋች እና ታላቅ ቅዱስ። በሊድዳ ከተማ አገልግሏል። አውራ አጥብ ገድሎታል።"
        }
    ],
    "9-11": [
        { 
            name: "ፋሲካ (Easter)", 
            description: "የጌታችን ኢየሱስ ክርስቶስ ትንሣኤ በዓል። ከሞት ተነስቷል እና ለሰማያት ተወግዷል።"
        }
    ],
    "12-12": [
        { 
            name: "ቅዱስ ተክለ ሃይማኖት (St. Tekle Haimanot)", 
            description: "የኢትዮጵያ ታላቅ ቅዱስ እና የቤተክርስቲያን አባት። ለ27 ዓመት በአንድ እግር ቆሟል። ደብረ አስቡስ ገዳም መስራች።"
        }
    ]
};

// Initialize Synaxarium
function initializeSynaxarium() {
    // Initialize day dropdown
    updateDayDropdown();
    
    // Load today's saints
    loadTodaysSaints();
    
    // Load initial saints for current month
    searchSaints();
}

// Update day dropdown based on selected month
function updateDayDropdown() {
    const monthSelect = document.getElementById('month-select');
    const daySelect = document.getElementById('day-select');
    const selectedMonth = parseInt(monthSelect.value);
    
    // Clear existing options
    daySelect.innerHTML = '';
    
    // Determine days in month (30 for all months except Pagume which has 5-6)
    const daysInMonth = selectedMonth === 13 ? 6 : 30;
    
    // Add day options
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = toEthNum(day);
        daySelect.appendChild(option);
    }
}

// Load today's saints (for demonstration, using a fixed date)
function loadTodaysSaints() {
    const now = new Date();
    const { month: eMonth, day: eDay } = gcToEth(now);
    const todayKey = `${eMonth}-${eDay}`;
    const todaySaintsContainer = document.getElementById('today-saints');
    
    if (saintsData[todayKey]) {
        displaySaintsInContainer(saintsData[todayKey], `${ethiopianMonths[eMonth-1]} ${toEthNum(eDay)}`, todaySaintsContainer, true);
    } else {
        todaySaintsContainer.innerHTML = `
            <div class="saint-item today-saints">
                <div class="saint-date">${ethiopianMonths[eMonth-1]} ${toEthNum(eDay)}</div>
                <div class="saint-description">ለዛሬ የተመዘገቡ ቅዱሳን የሉም።</div>
            </div>
        `;
    }
}

// Search for saints by month and day
function searchSaints() {
    const monthSelect = document.getElementById('month-select');
    const daySelect = document.getElementById('day-select');
    
    const month = monthSelect.value;
    const day = daySelect.value;
    
    const key = `${month}-${day}`;
    const saints = saintsData[key] || [];
    
    displaySaints(saints, `${ethiopianMonths[month-1]} ${toEthNum(day)}`);
    
    // Save to user history if logged in
    if (currentUser) {
        saveToHistory('saint_search', `Searched saints for ${ethiopianMonths[month-1]} ${day}`);
    }
}

// Display saints in the results area
function displaySaints(saints, date) {
    const resultsContainer = document.getElementById('saints-results');
    displaySaintsInContainer(saints, date, resultsContainer, false);
}

// Display saints in a specific container
function displaySaintsInContainer(saints, date, container, isToday) {
    container.innerHTML = '';
    
    if (saints.length === 0) {
        container.innerHTML = `
            <div class="saint-item ${isToday ? 'today-saints' : ''}">
                <div class="saint-date">${date}</div>
                <div class="saint-description">ለዚህ ቀን የተመዘገቡ ቅዱሳን የሉም።</div>
            </div>
        `;
        return;
    }
    
    saints.forEach(saint => {
        const saintItem = document.createElement('div');
        saintItem.className = `saint-item ${isToday ? 'today-saints' : ''}`;
        saintItem.innerHTML = `
            <div class="saint-date">${date}</div>
            <div class="saint-name">${saint.name}</div>
            <div class="saint-description">${saint.description}</div>
            <div class="saint-tags">
                <span class="saint-tag">Saint</span>
                <span class="saint-tag">Commemoration</span>
            </div>
        `;
        container.appendChild(saintItem);
    });
}

// Show saints when a calendar day is clicked
function showSaintsForDate(month, day) {
    const key = `${month}-${day}`;
    const saints = saintsData[key] || [];
    
    // Update the synaxarium controls to show this date
    document.getElementById('month-select').value = month;
    updateDayDropdown();
    document.getElementById('day-select').value = day;
    
    // Display the saints
    displaySaints(saints, `${ethiopianMonths[month-1]} ${toEthNum(day)}`);
    
    // Scroll to the synaxarium section
    document.getElementById('synaxarium').scrollIntoView({ behavior: 'smooth' });
    
    // Save to user history if logged in
    if (currentUser) {
        saveToHistory('saint_view', `Viewed saints for ${ethiopianMonths[month-1]} ${day} from calendar`);
    }
}

// Make functions available globally
window.initializeSynaxarium = initializeSynaxarium;
window.updateDayDropdown = updateDayDropdown;
window.searchSaints = searchSaints;
window.showSaintsForDate = showSaintsForDate;