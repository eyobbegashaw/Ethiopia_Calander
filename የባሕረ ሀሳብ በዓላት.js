 
// Sample Ethiopian holidays data
const ethHolidays = {
  "1-1": "አዲስ አመት (New Year)",
  "1-17": "መስቀል (Finding of True Cross)",
  "4-29": "ገና (Christmas)",
  "5-11": "ጥምቀት (Epiphany)",
  "7-23": "ዓደዋ (Victory of Adwa)",
  "8-20": "የአቶ አርአያ ዕለት",
  "9-11": "ፋሲካ (Easter)",
  "13-1": "ንጉሠ ነገሥት ቀን",
};

const gcHolidays = {
  "1-1": "New Year",
  "3-8": "Women's Day",
  "5-1": "Labour Day",
  "12-25": "Christmas",
};

// Holiday calculator functionality
function initializeHolidayCalculator() {
  // Set current year as default
  document.getElementById("holiday-year").value = new Date().getFullYear() - 7;
  calculateHolidays();
}

function calculateHolidays() {
  const year = parseInt(document.getElementById("holiday-year").value);
  const holidaysList = document.getElementById("holidays-list");
  holidaysList.innerHTML = "";

  // Sample holiday data - in a real implementation, these would be calculated
  const holidays = [
    { name: "አዲስ አመት (New Year)", date: `መስከረም 1, ${toEthNum(year)}` },
    {
      name: "መስቀል (Finding of True Cross)",
      date: `መስከረም 17, ${toEthNum(year)}`,
    },
    { name: "ገና (Christmas)", date: `ታኅሣሥ 29, ${toEthNum(year)}` },
    { name: "ጥምቀት (Epiphany)", date: `ጥር 11, ${toEthNum(year)}` },
    { name: "ዓደዋ (Victory of Adwa)", date: `የካቲት 23, ${toEthNum(year)}` },
    { name: "ፋሲካ (Easter)", date: `መጋቢት 11, ${toEthNum(year)}` },
    { name: "ልደተ መለኮት (Birth of Jesus)", date: `ሚያዝያ 29, ${toEthNum(year)}` },
    { name: "ገስቀስ (St. Gabriel)", date: `ሰኔ 19, ${toEthNum(year)}` },
    { name: "ጾመ ድንኳን (Fast of the Ark)", date: `ሐምሌ 1-16, ${toEthNum(year)}` },
    {
      name: "በዓለ ንህነት (Feast of Salvation)",
      date: `ነሐሴ 13, ${toEthNum(year)}`,
    },
    { name: "ንጉሠ ነገሥት ቀን", date: `ጳጉሜ 1, ${toEthNum(year)}` },
  ];

  holidays.forEach((holiday) => {
    const holidayItem = document.createElement("div");
    holidayItem.className = "holiday-item";
    holidayItem.innerHTML = `
            <div class="holiday-name">${holiday.name}</div>
            <div class="holiday-date">${holiday.date}</div>
        `;
    holidaysList.appendChild(holidayItem);
  });

  // Save to user history if logged in
  if (currentUser) {
    saveToHistory(
      "holiday_calculation",
      `Calculated holidays for Ethiopian year ${year}`
    );
  }
}

// Calculate movable holidays (Easter, etc.)
function calculateMovableHolidays(year) {
  // This is a simplified version
  // In a real implementation, you would use the computus algorithm for Easter
  const holidays = [];

  // Easter calculation (simplified)
  // Note: This is a placeholder - actual calculation requires complex algorithm
  const easterMonth = 9; // መጋቢት (March/April)
  const easterDay = 11; // Simplified

  holidays.push({
    name: "ፋሲካ (Easter)",
    date: `${ethiopianMonths[easterMonth - 1]} ${toEthNum(
      easterDay
    )}, ${toEthNum(year)}`,
  });

  return holidays;
}

// Calculate all holidays for a given Ethiopian year
function getAllHolidays(year) {
  const fixedHolidays = [
    { name: "አዲስ አመት (New Year)", month: 1, day: 1 },
    { name: "መስቀል (Finding of True Cross)", month: 1, day: 17 },
    { name: "ገና (Christmas)", month: 4, day: 29 },
    { name: "ጥምቀት (Epiphany)", month: 5, day: 11 },
    { name: "ዓደዋ (Victory of Adwa)", month: 7, day: 23 },
    { name: "ንጉሠ ነገሥት ቀን", month: 13, day: 1 },
  ];

  const movableHolidays = calculateMovableHolidays(year);

  return [
    ...fixedHolidays.map((h) => ({
      name: h.name,
      date: `${ethiopianMonths[h.month - 1]} ${toEthNum(h.day)}, ${toEthNum(
        year
      )}`,
    })),
    ...movableHolidays,
  ];
}

// Make functions available globally
window.initializeHolidayCalculator = initializeHolidayCalculator;
window.calculateHolidays = calculateHolidays;
