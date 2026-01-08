# Phase 3.2 - Data Schema Specification

## Executive Summary

This document provides comprehensive data schema definitions for the **Reactive Web Calendar Application**. It defines all data models, their storage mechanisms (backend), retrieval logic, validation rules, and data flow between frontend and backend.

---

## 1. Backend Data Models & Storage

### 1.1 Regular Holidays In-Memory Store

**Location:** Backend service layer, in-memory Map

**Purpose:** Cache government/regular holidays fetched from external API

**Data Structure:**
```javascript
// Key: ISO date string (YYYY-MM-DD)
// Value: Array of regular holiday objects
const regularHolidaysMap = new Map([
  ["2025-12-25", [
    {
      id: "us_christmas_2025",
      name: "Christmas",
      date: "2025-12-25",
      country: "US",
      region: null,
      category: "national",
      description: "Christian holiday celebrating Jesus Christ's birth",
      isPublicHoliday: true
    }
  ]],
  ["2025-01-01", [
    {
      id: "us_new_year_2025",
      name: "New Year's Day",
      date: "2025-01-01",
      country: "US",
      region: null,
      category: "national",
      description: "First day of the year",
      isPublicHoliday: true
    }
  ]]
]);
```

**RegularHoliday Object Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (e.g., "us_christmas_2025") |
| name | string | Yes | Holiday name (max 200 chars) |
| date | string (ISO 8601) | Yes | YYYY-MM-DD format |
| country | string | Yes | ISO 3166-1 alpha-2 code |
| region | string \| null | No | State/region code (e.g., "CA", "NY") |
| category | string | Yes | "national", "state", "religious", "cultural" |
| description | string | No | Optional description |
| isPublicHoliday | boolean | Yes | Is it a public holiday |

**Cache Properties:**
- **TTL:** 30 days
- **Key Format:** `holidays_${country}_${year}_${month}` (for localStorage sync)
- **Expiration:** Checked on each API call, refetch if expired
- **Persistence:** Can be persisted to localStorage for offline access

---

### 1.2 Work Holidays Configuration (JSON-Based)

**Location:** `src/data/workHolidays.ts` (Backend)

**Purpose:** Store mocked/configured company-specific holidays

**File Structure:**
```typescript
// src/data/workHolidays.ts

export const WORK_HOLIDAYS = [
  {
    id: "company_foundation_2025",
    name: "Company Foundation Day",
    date: "2025-03-15",
    department: "all",
    description: "Celebrating company's 10th anniversary",
    category: "company"
  },
  {
    id: "company_year_end_2025",
    name: "Year End Extended Closure",
    date: "2025-12-26",
    department: "all",
    description: "Extended closure for year-end holidays",
    category: "company"
  },
  {
    id: "tech_hackathon_2025",
    name: "Tech Hackathon Week",
    date: "2025-05-12",
    department: "engineering",
    description: "Internal innovation hackathon event",
    category: "team"
  },
  {
    id: "sales_offsite_2025",
    name: "Sales Annual Offsite",
    date: "2025-06-15",
    department: "sales",
    description: "Annual sales team offsite and training",
    category: "team"
  }
  // ... more holidays
];
```

**WorkHoliday Object Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (e.g., "company_foundation_2025") |
| name | string | Yes | Holiday name (max 200 chars) |
| date | string (ISO 8601) | Yes | YYYY-MM-DD format |
| department | string | No | Department/team (default: "all") |
| description | string | No | Why this is a work holiday |
| category | string | Yes | "company", "team", "department" |

**Access Functions (Backend Service):**

```typescript
// Get all work holidays
export function getAllWorkHolidays(): WorkHoliday[] {
  return [...WORK_HOLIDAYS];
}

// Get work holidays for specific month
export function getWorkHolidaysForMonth(
  year: number,
  month: number
): WorkHoliday[] {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return WORK_HOLIDAYS.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= startDate && holidayDate <= endDate;
  });
}

// Get work holiday by ID
export function getWorkHolidayById(id: string): WorkHoliday | null {
  return WORK_HOLIDAYS.find(h => h.id === id) || null;
}

// Get work holidays by department
export function getWorkHolidaysByDepartment(department: string): WorkHoliday[] {
  return WORK_HOLIDAYS.filter(h => h.department === department);
}
```

---

### 1.3 In-Memory Holiday Aggregation Store

**Purpose:** Cache merged regular + work holidays for quick retrieval

**Data Structure:**
```javascript
// Key: ISO date string (YYYY-MM-DD)
// Value: Aggregated holidays for that day
const holidaysByDateMap = new Map([
  ["2025-12-25", {
    date: "2025-12-25",
    regularHolidays: [
      { id: "us_christmas_2025", name: "Christmas", ... }
    ],
    workHolidays: [],
    primaryType: "regular",
    hasBoth: false
  }],
  ["2025-03-15", {
    date: "2025-03-15",
    regularHolidays: [],
    workHolidays: [
      { id: "company_foundation_2025", name: "Company Foundation Day", ... }
    ],
    primaryType: "work",
    hasBoth: false
  }]
]);
```

**AggregatedHoliday Object Schema:**

| Field | Type | Description |
|-------|------|-------------|
| date | string | ISO date (YYYY-MM-DD) |
| regularHolidays | array | Array of regular holiday objects |
| workHolidays | array | Array of work holiday objects |
| primaryType | "work" \| "regular" \| null | Which type to display primarily |
| hasBoth | boolean | Whether both types exist on this date |

**Priority Logic:**
- If work holidays exist → `primaryType = "work"`
- Else if regular holidays exist → `primaryType = "regular"`
- Else → `primaryType = null`

---

## 2. Backend API Endpoints

### 2.1 GET /api/holidays

**Purpose:** Fetch regular (government) holidays for a specific country/month

**Request:**
```
GET /api/holidays?country=US&year=2025&month=3
```

**Query Parameters:**
- `country` (string, required): ISO 3166-1 alpha-2 code (e.g., "US", "IN", "GB")
- `year` (number, required): Year (1900-2100)
- `month` (number, required): Month (1-12)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "holidays": [
      {
        "id": "us_women_day_2025",
        "name": "International Women's Day",
        "date": "2025-03-08",
        "country": "US",
        "region": null,
        "category": "observance",
        "description": "Celebration of women's achievements",
        "isPublicHoliday": false
      },
      {
        "id": "us_st_patrick_2025",
        "name": "St. Patrick's Day",
        "date": "2025-03-17",
        "country": "US",
        "region": null,
        "category": "observance",
        "description": "Irish cultural celebration",
        "isPublicHoliday": false
      }
    ],
    "year": 2025,
    "month": 3,
    "count": 2
  },
  "timestamp": "2025-01-08T10:30:00Z"
}
```

**Error Responses:**
- 400: Invalid parameters
- 404: Country not supported
- 429: Rate limit exceeded
- 500: Server error (fallback to cached data)

**Caching:**
- `Cache-Control: max-age=2592000, public` (30 days)
- `ETag` for validation
- Backend maintains in-memory cache

---

### 2.2 GET /api/work-holidays

**Purpose:** Fetch company/work-specific holidays for a month

**Request:**
```
GET /api/work-holidays?year=2025&month=3
```

**Query Parameters:**
- `year` (number, required): Year
- `month` (number, required): Month (1-12)
- `department` (string, optional): Filter by department

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "holidays": [
      {
        "id": "company_foundation_2025",
        "name": "Company Foundation Day",
        "date": "2025-03-15",
        "department": "all",
        "description": "Celebrating company's 10th anniversary",
        "category": "company"
      }
    ],
    "year": 2025,
    "month": 3,
    "count": 1
  },
  "timestamp": "2025-01-08T10:30:00Z"
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

**Note:** No external API call, instant response from in-memory store

**Indexes:**
- PRIMARY KEY (cacheKey)
- INDEX (expiresAt) for cleanup queries

**Note:** This table is optional and used for performance optimization only. Can be cleared and rebuilt anytime.

---

## 2. Redux State Schema

## 2. Redux State Schema

### 2.1 Calendar State (Application Layer)

**Purpose:** Stores current view data and fetched holiday information

**Key Fields:**
- `viewMonth` / `viewYear` - Currently viewing month/year
- `currentMonth` / `currentYear` / `currentDay` - Actual current date
- `holidays` - Object indexed by date (YYYY-MM-DD) containing holiday details
- `loading` - Boolean indicating data fetch in progress
- `error` - Error message if fetch failed
- `cachedMonths` - Set of months already fetched and cached

**Data Organization:**
```
{
  holidays: {
    "2025-03-15": {
      regularHolidayIds: ["id1", "id2"],
      workHolidayIds: ["id3"],
      primaryType: "work",
      count: { regular: 2, work: 1 }
    },
    "2025-03-25": { ... }
  },
  loading: false,
  error: null
}
```

### 2.2 UI State (Application Layer)

**Purpose:** Stores UI-related state

**Key Fields:**
- `selectedDayModalOpen` - Is day details modal open
- `selectedDay` - Currently selected day (YYYY-MM-DD)
- `isDarkMode` - Theme preference
- `weekStartDay` - Calendar week start preference

---

## 3. In-Memory Database Implementation

For implementation, an in-memory database can be used instead of a traditional SQL database.

### 3.1 In-Memory Database Options

**Recommended Options:**
- **IndexedDB** (Browser storage, persistent)
- **SQLite (via sql.js)** (In-memory SQL engine in browser)
- **Simple JSON-based store** (for development/MVP)
- **TanStack Query** with in-memory caching

### 3.2 In-Memory Store Structure

```
DataStore {
  regularHolidays: Map<string, RegularHoliday>  // key: id
  workHolidays: Map<string, WorkHoliday>        // key: id
  holidaysByDate: Map<string, HolidayIds>       // key: YYYY-MM-DD
  cache: Map<string, CachedMonth>               // key: YYYY-MM
}
```

### 3.3 Simple In-Memory Implementation Example

**Pseudocode:**
```javascript
class HolidayStore {
  constructor() {
    this.regularHolidays = new Map();      // Store by id
    this.workHolidays = new Map();         // Store by id
    this.holidaysByDate = new Map();       // Index by YYYY-MM-DD
    this.cacheExpiry = new Map();          // Track cache TTL
  }
  
  // Add regular holiday
  addRegularHoliday(holiday) {
    this.regularHolidays.set(holiday.id, holiday);
    this._updateHolidaysByDate(holiday.date);
  }
  
  // Get holidays for a date
  getHolidaysForDate(date) {
    return this.holidaysByDate.get(date) || { regular: [], work: [] };
  }
  
  // Clear expired cache
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry) {
      if (now > expiry) {
        this.cacheExpiry.delete(key);
      }
    }
  }
  
  // Get month cache
  getMonthCache(monthKey) {
    return this.cache.get(monthKey);
  }
  
  // Set month cache
  setMonthCache(monthKey, data, ttlMs) {
    this.cache.set(monthKey, data);
    this.cacheExpiry.set(monthKey, Date.now() + ttlMs);
  }
}
```

### 3.4 Benefits of In-Memory Database

✅ Fast O(1) lookups using Map/Hash structures
✅ No network calls for data retrieval
✅ Perfect for MVP and testing
✅ Easy to debug and introspect
✅ Suitable for single-user applications
✅ Can be persisted to localStorage if needed
✅ Can be loaded with pre-fetched data

### 3.5 Migration Path to Real Database

If needed in future:
- Keep the same data model and structure
- Replace in-memory store with actual database queries (SQL, NoSQL, etc.)
- Redux state management remains unchanged
- Only the service/data access layer needs updates
- API layer remains compatible

---

## 4. API Response Schema (External Data)

### 4.1 Regular Holiday API Response

**API Provider:** Calendarific (or similar holiday API)

**Request:**
```
GET /api/holidays?country=US&year=2025&month=3
```

**Response Structure:**
| Field | Type | Description |
|-------|------|-------------|
| status | INT | HTTP status code (200 for success) |
| date | DATE | Holiday date (YYYY-MM-DD) |
| name | VARCHAR | Holiday name |
| description | TEXT | Holiday description |
| country | VARCHAR | Country code |
| type | VARCHAR | Type (national, regional, religious, etc.) |

**Transformation:** API response → RegularHoliday model (stored in database)

**Request:**
```
GET /api/holidays?country=US&year=2025&month=3
```

**Response Schema:**
```typescript
interface HolidayAPIResponse {
  status: number;                      // 200 for success
  response: {
    holidays: {
      date: {
        iso: string;                   // ISO 8601 date: YYYY-MM-DD
      };
      name: string;                    // Holiday name
      description: string;             // Holiday description
      country: {
        id: string;                    // Country code (e.g., "US")
        name: string;                  // Country name
      };
      type: string[];                  // Type array: ["National holiday"] etc
    }[];
  };
}

// Response example:
{
  "status": 200,
  "response": {
    "holidays": [
      {
        "date": { "iso": "2025-12-25" },
        "name": "Christmas",
        "description": "Christian celebration of the birth of Jesus",
        "country": { "id": "US", "name": "United States" },
        "type": ["National holiday"]
      }
    ]
  }
}
```

### 3.2 Error Response

```typescript
interface APIErrorResponse {
  status: number;                      // 4xx or 5xx
  error: {
    code: string;                      // Error code
    message: string;                   // Error message
  };
}

// Example:
{
  "status": 401,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "Invalid API key provided"
  }
}
```

### 3.3 Data Transformation

```typescript
// Transform API response to internal RegularHoliday model
function transformAPIHolidayToInternal(
  apiHoliday: APIHoliday,
  country: string
): RegularHoliday {
  return {
    id: `${country.toLowerCase()}_${apiHoliday.name.toLowerCase().replace(/ /g, '_')}_${apiHoliday.date.iso}`,
    name: apiHoliday.name,
    date: apiHoliday.date.iso,
    country: country,
    category: apiHoliday.type.includes("National holiday") ? "national" : "regional",
    description: apiHoliday.description,
    isPublicHoliday: true
  };
}
```

---

## 4. Work Holiday Mock Data

### 4.1 Mock Data Structure

```typescript
// File: src/data/mockWorkHolidays.ts

const WORK_HOLIDAYS: WorkHoliday[] = [
  {
    id: "company_foundation_2025",
    name: "Company Foundation Day",
    date: "2025-03-15",
    department: "all",
    description: "Celebrating our company's founding",
    category: "company"
  },
  {
    id: "company_year_end_2025",
    name: "Year End Closure",
    date: "2025-12-26",
    department: "all",
    description: "Company closure for year-end",
    category: "company"
  },
  {
    id: "tech_team_hackathon_2025",
    name: "Tech Hackathon Week",
    date: "2025-05-12",
    department: "engineering",
    description: "Internal hackathon event",
    category: "team"
  },
  // ... more holidays
];

// Function to get work holidays for a specific month
export function getWorkHolidaysForMonth(
  year: number,
  month: number
): WorkHoliday[] {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return WORK_HOLIDAYS.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= startDate && holidayDate <= endDate;
  });
}
```

### 4.2 Easy Configuration

```typescript
// Can be easily updated by modifying the array above
// Future: Could load from JSON config file or environment

// Example dynamic loading:
export function loadWorkHolidaysFromConfig(configPath: string): WorkHoliday[] {
  // Load from JSON file or API
}
```

---

## 5. Date & Time Handling

### 5.1 Date Format Standards

**All dates use ISO 8601 format:** `YYYY-MM-DD`

Examples:
- `"2025-03-08"` (March 8, 2025)
- `"2025-12-25"` (December 25, 2025)

### 5.2 Timezone Handling

**Assumption:** All dates are in **UTC** timezone. No timezone conversion.

**Rationale:** Holidays are typically defined by date, not by specific time or timezone. Using UTC avoids confusion.

```typescript
// Correct: Use ISO date strings without time component
const date = "2025-03-15";  // ✅ Correct

// Avoid: JavaScript Date objects (may include time/timezone)
const date = new Date(2025, 2, 15);  // ❌ Problematic

// Conversion function if needed:
function dateToISO(date: Date): string {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

function ISOToDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00Z');
}
```

### 5.3 Week Calculations

**Standard:** ISO 8601 (Week starts on Monday)

```typescript
interface Week {
  weekNumber: number;      // 1-53
  year: number;           // Year of the week
  startDate: string;      // Monday, YYYY-MM-DD
  endDate: string;        // Sunday, YYYY-MM-DD
}

// Calculate ISO week number
function getISOWeekNumber(date: string): number {
  const d = new Date(date + 'T00:00:00Z');
  const target = new Date(d.valueOf());
  const dayNr = (d.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  return Math.ceil((firstThursday - target.valueOf()) / 604800000) + 1;
}
```

### 5.4 Daylight Saving Time

**No explicit handling needed** since all dates use YYYY-MM-DD format without time component. DST changes don't affect date calculations.

### 5.5 Leap Year Handling

**Automatic:** JavaScript Date objects handle leap years correctly.

```typescript
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Examples:
getDaysInMonth(2024, 2);  // 29 (leap year)
getDaysInMonth(2025, 2);  // 28 (non-leap year)
```

---

## 6. Data Validation Rules

### 6.1 Holiday Date Validation

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateHolidayDate(dateString: string): ValidationResult {
  const errors: string[] = [];
  
  // Check format
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(dateString)) {
    errors.push(`Date must be in ISO 8601 format: YYYY-MM-DD`);
    return { isValid: false, errors };
  }
  
  // Check valid date
  const date = new Date(dateString + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    errors.push(`Invalid date: ${dateString}`);
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### 6.2 Holiday Name Validation

```typescript
function validateHolidayName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name || typeof name !== 'string') {
    errors.push('Holiday name is required and must be a string');
    return { isValid: false, errors };
  }
  
  if (name.length < 1 || name.length > 200) {
    errors.push('Holiday name must be between 1 and 200 characters');
  }
  
  // Allow alphanumeric, spaces, hyphens, apostrophes
  const validRegex = /^[a-zA-Z0-9\s\-'&.,()]+$/;
  if (!validRegex.test(name)) {
    errors.push('Holiday name contains invalid characters');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### 6.3 Country Code Validation

```typescript
const VALID_COUNTRY_CODES = ['US', 'IN', 'GB', 'CA', 'AU', 'DE', 'FR', /* ... */];

function validateCountryCode(code: string): ValidationResult {
  const errors: string[] = [];
  
  if (!VALID_COUNTRY_CODES.includes(code.toUpperCase())) {
    errors.push(`Invalid country code: ${code}`);
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### 6.4 Complete Holiday Validation

```typescript
function validateRegularHoliday(holiday: RegularHoliday): ValidationResult {
  const errors: string[] = [];
  
  // Validate date
  const dateValidation = validateHolidayDate(holiday.date);
  errors.push(...dateValidation.errors);
  
  // Validate name
  const nameValidation = validateHolidayName(holiday.name);
  errors.push(...nameValidation.errors);
  
  // Validate country
  const countryValidation = validateCountryCode(holiday.country);
  errors.push(...countryValidation.errors);
  
  // Validate category
  const validCategories = ['national', 'state', 'religious', 'cultural'];
  if (!validCategories.includes(holiday.category)) {
    errors.push(`Invalid category: ${holiday.category}`);
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## 7. Data Consistency Rules

### 7.1 Single Source of Truth

- Redux store is the single source of truth for all holiday data
- Components derive data from Redux, not from local state
- API cache is secondary to Redux store

### 7.2 Primary Holiday Determination

```typescript
// When multiple holidays exist on same day
function determinePrimaryHoliday(
  regularHolidays: RegularHoliday[],
  workHolidays: WorkHoliday[]
): 'work' | 'regular' | null {
  // Work holidays take priority
  if (workHolidays.length > 0) return 'work';
  if (regularHolidays.length > 0) return 'regular';
  return null;
}
```

### 7.3 23-Month Window Validation

```typescript
interface DataWindow {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
}

function isDateWithinWindow(
  dateString: string,
  window: DataWindow
): boolean {
  const [year, month] = dateString.split('-').map(Number);
  
  const startMonthNum = window.startYear * 12 + window.startMonth;
  const endMonthNum = window.endYear * 12 + window.endMonth;
  const dateMonthNum = year * 12 + month;
  
  return dateMonthNum >= startMonthNum && dateMonthNum <= endMonthNum;
}
```

### 7.4 Duplicate Holiday Prevention

```typescript
function deduplicateHolidays(holidays: Holiday[]): Holiday[] {
  const seen = new Set<string>();
  return holidays.filter(holiday => {
    const key = `${holiday.date}_${holiday.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

---

## 8. Redux Selectors (Memoized with Reselect)

### 8.1 Calendar Selectors

```typescript
import { createSelector } from '@reduxjs/toolkit';

// Base selectors
const selectCalendarState = (state: RootState) => state.calendar;
const selectUIState = (state: RootState) => state.ui;

// Memoized selectors for current view
export const selectCurrentCalendarView = createSelector(
  [selectCalendarState],
  (calendar) => ({
    viewMonth: calendar.viewMonth,
    viewYear: calendar.viewYear,
    currentMonth: calendar.currentMonth,
    currentYear: calendar.currentYear,
    currentDay: calendar.currentDay
  })
);

// Get holidays for a specific day
export const selectHolidaysForDay = createSelector(
  [selectCalendarState, (_state, day: string) => day],
  (calendar, day) => calendar.holidays[day] || null
);

// Get work holiday count for a week
export const selectWorkHolidayCountForWeek = createSelector(
  [selectCalendarState, (_state, weekDates: string[]) => weekDates],
  (calendar, weekDates) => {
    let count = 0;
    weekDates.forEach(date => {
      if (calendar.holidays[date]?.workHolidays?.length > 0) {
        count += calendar.holidays[date].workHolidays.length;
      }
    });
    return count;
  }
);

// Check if loading
export const selectIsLoading = createSelector(
  [selectCalendarState],
  (calendar) => calendar.loading
);

// Get error message
export const selectErrorMessage = createSelector(
  [selectCalendarState],
  (calendar) => calendar.error
);
```

---

## 9. Local Storage Schema

### 9.1 Cache Keys

```typescript
// Key format for caching holiday data
function getCacheKey(year: number, month: number): string {
  return `holidays_${year}_${String(month).padStart(2, '0')}`;
}

// Example keys:
// "holidays_2025_03"
// "holidays_2025_12"
// "holidays_2024_01"
```

### 9.2 Cache Value Structure

```typescript
interface CachedHolidayData {
  month: number;
  year: number;
  holidays: {
    [dateKey: string]: {
      regularHolidays: RegularHoliday[];
      workHolidays: WorkHoliday[];
    };
  };
  timestamp: number;  // When cached (epoch milliseconds)
  ttl: number;        // Time to live in milliseconds (30 days = 2592000000)
}

// Example:
{
  "month": 3,
  "year": 2025,
  "holidays": {
    "2025-03-08": { "regularHolidays": [], "workHolidays": [] },
    "2025-03-15": { ... }
  },
  "timestamp": 1709880000000,
  "ttl": 2592000000
}
```

### 9.3 Cache Management

```typescript
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

function saveCacheToLocalStorage(key: string, data: CachedHolidayData): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Handle quota exceeded or other errors
    console.error('Failed to save cache:', e);
  }
}

function getCacheFromLocalStorage(key: string): CachedHolidayData | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    if (isCacheValid(data.timestamp)) {
      return data;
    } else {
      // Cache expired, remove it
      localStorage.removeItem(key);
      return null;
    }
  } catch (e) {
    console.error('Failed to read cache:', e);
    return null;
  }
}
```

---

## 10. Error Handling Data Models

### 10.1 Error Types

```typescript
type ErrorType = 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'INVALID_DATA'
  | 'CACHE_ERROR'
  | 'UNKNOWN_ERROR';

interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  timestamp: number;
  retryable: boolean;
}

// Examples:
const networkError: AppError = {
  type: 'NETWORK_ERROR',
  message: 'Failed to fetch holidays from API. Using cached data.',
  timestamp: Date.now(),
  retryable: true
};

const apiError: AppError = {
  type: 'API_ERROR',
  message: 'Holiday API returned status 500. Please try again later.',
  timestamp: Date.now(),
  retryable: true
};
```

---

## 11. Data Flow Examples

### 11.1 Loading Holiday Data for March 2025

```
User opens app or navigates to March 2025
    ↓
checkIfCached("2025_03") → false
    ↓
API Request: GET /holidays?country=US&year=2025&month=3
    ↓
API Response: Array of RegularHoliday
    ↓
Transform & Validate: transformAPIHolidayToInternal()
    ↓
Load Work Holidays: getWorkHolidaysForMonth(2025, 3)
    ↓
Combine: Merge regular + work holidays by date
    ↓
Deduplicate: deduplicateHolidays()
    ↓
Organize by date: Create holidays lookup object
    ↓
Save to Redux store
    ↓
Save to localStorage cache
    ↓
Components render with data
```

### 11.2 Multiple Holidays on Same Day

```
Holiday exists on 2025-12-25:
  - RegularHoliday: "Christmas"
  - WorkHoliday: "Company Holiday"
    ↓
determinePrimaryHoliday([christmas], [companyHoliday])
    ↓
Returns: 'work'
    ↓
UI renders with WorkHoliday styling
    ↓
Tooltip shows: "Work Holiday: Company Holiday" + "Also Regular Holiday: Christmas"
```

---

## 12. Testing Data Sets

### 12.1 Sample Holiday Data

```typescript
// src/data/testHolidays.ts

// Regular holidays for testing
export const TEST_REGULAR_HOLIDAYS: RegularHoliday[] = [
  {
    id: "us_new_year_2025",
    name: "New Year's Day",
    date: "2025-01-01",
    country: "US",
    category: "national",
    isPublicHoliday: true
  },
  {
    id: "us_mlk_day_2025",
    name: "Martin Luther King Jr. Day",
    date: "2025-01-20",
    country: "US",
    category: "national",
    isPublicHoliday: true
  },
  // ... more holidays
];

// Work holidays for testing
export const TEST_WORK_HOLIDAYS: WorkHoliday[] = [
  {
    id: "test_work_holiday_1",
    name: "Test Work Holiday",
    date: "2025-03-15",
    department: "all"
  },
  // ... more holidays
];
```

### 12.2 Edge Case Data

```typescript
// Leap year (Feb 29)
const leapYearData = {
  date: "2024-02-29",
  hasHoliday: false,
  isValid: true
};

// Year boundary (Dec 31 - Jan 1)
const yearBoundaryDates = [
  "2024-12-31",
  "2025-01-01"
];

// Multiple holidays on same day
const multiHolidayDay = "2025-12-25";
```

---

## 13. Migration & Versioning

### 13.1 Data Version

```typescript
interface DataVersion {
  schema: string;  // "1.0", "1.1", etc.
  lastUpdated: string; // ISO 8601 timestamp
}
```

### 13.2 Future Schema Changes

- Maintain backward compatibility with localStorage cache
- Version cache entries to handle migration
- Plan for adding user preferences, custom holidays, etc.

---

## Approval Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Data Architect | | | |
| Backend Lead | | | |
| Frontend Lead | | | |

**Document Status:** Ready for Review

**Next Step:** Proceed to Phase 4 (Performance & Scalability) upon approval
