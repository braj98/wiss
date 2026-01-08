# Holiday Categorization System

## Overview

The application categorizes holidays into two main types with additional distinctions for weekdays vs weekends:

### 1. **Regular Holidays** (Public Holidays)
- **Source**: External API (holidayapi.com)
- **Categories**:
  - `national` - National public holidays (e.g., Independence Day, New Year)
  - `state` - State/region-specific holidays
  - `religious` - Religious holidays (e.g., Christmas, Diwali)
  - `cultural` - Cultural observances
  - `observance` - International observances
  - `public-holiday` - General public holidays

**Examples**:
- January 26 (India) - Republic Day
- December 25 (US) - Christmas Day
- July 4 (US) - Independence Day

### 2. **Work Holidays** (Company-Specific)
- **Source**: Internal mocked data (can be extended to database)
- **Categories**:
  - `company` - Company-wide holidays
  - `team` - Team-specific holidays
  - `department` - Department-specific holidays
  - `event` - Team events/celebrations
  - `break` - Company breaks/shutdowns
  - `company-event` - Official company events
  - `public-holiday` - When public holidays are tracked as work holidays

**Examples**:
- Team lunch and learn session
- Department training day
- Company annual outing
- Office closure for Diwali (for Indian company)

---

## Date Classification

Each holiday can be classified by the day of the week:

### **Weekday Holidays**
- Monday through Friday
- Typically affect work schedules directly
- Often require special work arrangements or day-off compensation

### **Weekend Holidays**
- Saturday or Sunday
- May not directly affect work schedules
- Useful for calendar display and planning

---

## API Response Structure

### Regular Holidays Response
```json
{
  "data": [
    {
      "id": "ind_1",
      "name": "Republic Day",
      "date": "2026-01-26",
      "country": "IN",
      "category": "national",
      "description": "National Holiday - Celebrating Indian Constitution",
      "isPublicHoliday": true,
      "isWeekend": false  // Monday
    }
  ],
  "meta": {
    "country": "IN",
    "year": 2026,
    "month": 1,
    "count": 1,
    "cached": false
  }
}
```

### Work Holidays Response
```json
{
  "data": [
    {
      "id": "work_1",
      "name": "Team Building Day",
      "date": "2026-01-15",
      "department": "engineering",
      "category": "company-event",
      "description": "Quarterly team building event",
      "isWeekend": false  // Thursday
    }
  ],
  "meta": {
    "year": 2026,
    "month": 1,
    "department": "engineering",
    "count": 1
  }
}
```

---

## Utility Functions

### Frontend (src/utils/holidayUtils.ts)

```typescript
// Check if date is weekend
isWeekend('2026-01-26')  // false (Monday)
isWeekend('2026-01-25')  // true (Sunday)

// Get day name
getDayName('2026-01-26')  // "Monday"

// Get week number
getWeekNumber('2026-01-26')  // 4

// Filter holidays by type
const regular = filterRegularHolidays(holidays)
const work = filterWorkHolidays(holidays)

// Get summary statistics
const summary = getHolidaySummary(
  regularHolidays,
  workHolidays,
  '2026-01-01',
  '2026-01-31'
)
// Returns: { totalRegular, totalWork, regularOnWeekends, etc. }

// Format date
formatDate('2026-01-26')  // "Monday, January 26, 2026"
```

### Backend (src/utils/dateUtils.ts)

Similar utility functions available for backend processing.

---

## Display Logic

### Calendar Cell Display

For each date in the calendar:

1. **Check for holidays** (Regular + Work)
2. **Identify day type** (Weekday/Weekend)
3. **Visual styling**:
   - Regular holidays: Blue/Official color
   - Work holidays: Green/Company color
   - Weekends: Slightly dimmed background
   - Both types: Combined visual (e.g., blue + green indicator)

### Example: January 2026 (India)

| Date | Day | Regular | Work | Weekday/Weekend |
|------|-----|---------|------|-----------------|
| 26   | Mon | Republic Day | - | Weekday |
| 25   | Sun | - | - | Weekend |
| 24   | Sat | - | - | Weekend |
| 15   | Thu | - | Team Building | Weekday |

---

## Query Parameters

### Get Regular Holidays with Type Info
```
GET /api/holidays?country=IN&year=2026&month=1
```

### Get Work Holidays with Department Filter
```
GET /api/work-holidays?year=2026&month=1&department=engineering
```

### Get All Holidays by Date Range
```
GET /api/holidays/by-range?country=IN&year=2026&startMonth=1&endMonth=3
GET /api/work-holidays/by-range?year=2026&startMonth=1&endMonth=3
```

---

## Frontend State Management

### Redux Store Structure

```typescript
interface CalendarState {
  regularHolidays: {
    data: Map<string, RegularHoliday[]>  // Grouped by date
    loading: boolean
    error: Error | null
    lastFetched: number | null
  }
  workHolidays: {
    data: Map<string, WorkHoliday[]>  // Grouped by date
    loading: boolean
    error: Error | null
    lastFetched: number | null
  }
  filters: {
    country: string
    department?: string
  }
  selectedDate: string | null
}
```

---

## Implementation Checklist

- [x] Type definitions for Regular + Work holidays
- [x] Weekend detection utilities
- [x] API endpoints returning enriched data
- [x] Backend date utility functions
- [x] Frontend utility functions
- [ ] Redux state management for holidays
- [ ] Calendar component integration
- [ ] Display logic with styling
- [ ] Filtering and sorting capabilities
- [ ] API client integration tests

