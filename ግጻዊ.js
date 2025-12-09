// ግጻዊ.js - Daily Readings functionality

// Sample ግጻዊ (Daily Readings) Data
const gizaeData = {
    "1-1": [
        {
            title: "የመጀመሪያ ንባብ",
            content: "በመጀመሪያ ቃል ነበረ፥ ቃልም ከእግዚአብሔር ጋር ነበረ፥ እግዚአብሔርም ቃል ነበረ። ይህ በመጀመሪያ ከእግዚአብሔር ጋር ነበረ። ሁሉ በእርሱ ተፈጥሮአል፥ ያለእርሱም ከተፈጠረ ምንም አልተፈጠረም።",
            reference: "ዮሐንስ 1:1-3"
        },
        {
            title: "የሁለተኛ ንባብ",
            content: "እግዚአብሔር ለአዳምና ለሔዋን እንዲህ አላቸው፡ ከገነት ውስጥ ያለውን የሕይወት ዛፍ ብቻ አትበሉ። ከእርሱ ብትበሉ በዚያች ቀን ትሞታላችሁ።",
            reference: "ዘፍጥረት 2:16-17"
        }
    ],
    "1-5": [
        {
            title: "የእምነት ንባብ",
            content: "እምነት ግን ተስፋ ከሚደረግበት ነገር መሠረት ነው፥ የማይታዩትንም ማረጋገጫ ነው። በእምነት እግዚአብሔር ቃሉን በሰማይና በምድር እንደ ፈጠረ እናውቃለን።",
            reference: "ዕብራውያን 11:1-3"
        },
        {
            title: "የፍቅር ንባብ",
            content: "ፍቅር ትላቅ ነው፥ ፍቅርም ከእግዚአብሔር ነው። ያለ ፍቅር ያለው ሁሉ ከእግዚአብሔር የተገኘ አይደለም። እግዚአብሔር ፍቅር ነውና።",
            reference: "1 ዮሐንስ 4:7-8"
        }
    ],
    "4-29": [
        {
            title: "የገና ንባብ",
            content: "እነሆም ወንድ ልጅ ተወለደላችሁ፥ ይህም ክርስቶስ ጌታ ነው። ይህ ለእናንተ ምልክት ነው፡ አንድ ሕፃን ተጠንቅቆ በግመል ላይ ተኝቶ ታገኛላችሁ።",
            reference: "ሉቃስ 2:11-12"
        },
        {
            title: "የደስታ ንባብ",
            content: "እኔ ግን ደስታን አወራለሁ፥ በእግዚአብሔር ደስታን አወራለሁ። እግዚአብሔር ለሰው ልጆች ሰላምን ሰጠ፥ ሰላምንም አቀረበ።",
            reference: "ኢሳይያስ 61:10"
        }
    ]
};

// Initialize ግጻዊ
function initializeGizae() {
    // Initialize day dropdown
    updateGizaeDayDropdown();
    
    // Load today's readings
    loadTodaysGizae();
}

// Update ግጻዊ day dropdown based on selected month
function updateGizaeDayDropdown() {
    const monthSelect = document.getElementById('gizae-month-select');
    const daySelect = document.getElementById('gizae-day-select');
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

// Load today's ግጻዊ readings
function loadTodaysGizae() {
    const now = new Date();
    const { month: eMonth, day: eDay } = gcToEth(now);
    const todayKey = `${eMonth}-${eDay}`;
    displayGizaeReadings(todayKey);
}

// Search for ግጻዊ readings by month and day
function searchGizae() {
    const monthSelect = document.getElementById('gizae-month-select');
    const daySelect = document.getElementById('gizae-day-select');
    
    const month = monthSelect.value;
    const day = daySelect.value;
    
    const key = `${month}-${day}`;
    displayGizaeReadings(key);
    
    // Save to user history if logged in
    if (currentUser) {
        saveToHistory('gizae_search', `Searched readings for ${ethiopianMonths[month-1]} ${day}`);
    }
}

// Display ግጻዊ readings
function displayGizaeReadings(key) {
    const resultsContainer = document.getElementById('gizae-results');
    resultsContainer.innerHTML = '';
    
    const readings = gizaeData[key] || [];
    
    if (readings.length === 0) {
        resultsContainer.innerHTML = `
            <div class="gizae-reading">
                <div class="reading-title">
                    <i class="fas fa-book"></i> ለዚህ ቀን የተመዘገቡ ንባቦች የሉም
                </div>
                <div class="reading-content">
                    እባክዎ ሌላ ቀን ይምረጡ።
                </div>
            </div>
        `;
        return;
    }
    
    readings.forEach(reading => {
        const readingElement = document.createElement('div');
        readingElement.className = 'gizae-reading';
        readingElement.innerHTML = `
            <div class="reading-title">
                <i class="fas fa-book"></i> ${reading.title}
            </div>
            <div class="reading-content">
                ${reading.content}
            </div>
            <div class="reading-reference">
                ${reading.reference}
            </div>
        `;
        resultsContainer.appendChild(readingElement);
    });
}

// Make functions available globally
window.initializeGizae = initializeGizae;
window.updateGizaeDayDropdown = updateGizaeDayDropdown;
window.searchGizae = searchGizae;