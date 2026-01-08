# Phase 5.2 - API and Test Scenario Specification

## Executive Summary

This document provides comprehensive specifications for the **Backend Holiday API** and **Test Scenarios** for the Reactive Web Calendar Application. The architecture uses a **Node.js/Express backend** that aggregates holiday data and serves REST API endpoints to the React frontend.

**Architecture:** Frontend-independent backend API layer that can serve multiple clients (web, mobile, desktop)

---

## 1. Backend Architecture & API Specification

### 1.1 Technology Stack

**Backend:**
- Node.js 18+ LTS
- Express.js (lightweight, flexible)
- TypeScript (type safety)
- In-memory cache (MVP), Redis (future)

**Frontend Consumption:**
- React 18+ frontend calls backend REST APIs
- Redux Thunk for async operations
- Error handling with fallback to cached Redux state

### 1.2 Endpoint 1: GET /api/holidays

**Purpose:** Fetch government/regular holidays for a country and month

**Endpoint:** `GET /api/holidays?country=US&year=2025&month=3`

**Query Parameters:**

| Parameter | Type | Required | Validation | Example |
|-----------|------|----------|-----------|---------|
| country | string | Yes | ISO 3166-1 alpha-2, length=2 | US, IN, GB |
| year | number | Yes | 1900 ≤ year ≤ 2100 | 2025 |
| month | number | Yes | 1 ≤ month ≤ 12 | 3 |

**Backend Flow:**
```
Request → Validate Params
         → Check In-Memory Cache
         ├─ If Valid Cache: Return cached data
         └─ If Invalid/Missing:
            → Fetch from External API (holidayapi.com)
            → Cache in In-Memory Store (30-day TTL)
            → Return response
```

**Success Response (200 OK):**
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
    "country": "US",
    "year": 2025,
    "month": 3,
    "count": 2
  },
  "timestamp": "2025-01-08T10:30:00Z"
}
```

**Response Headers:**
```
Content-Type: application/json
Cache-Control: max-age=2592000, public
ETag: "abc123def456"
X-Cache: HIT (or MISS)
```

**Error: 400 Bad Request**
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid parameters: country must be 2-letter code",
    "details": { "country": "Invalid format" }
  }
}
```

**Error: 404 Country Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "COUNTRY_NOT_FOUND",
    "message": "Country 'XX' not supported",
    "supported": ["US", "IN", "GB", "CA"]
  }
}
```

**Error: 429 Rate Limited**
```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Reset at 2025-01-09 10:00:00 UTC"
  }
}
```

**Error: 500 External API Down (Uses Cache)**
```json
{
  "status": "error",
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "External API unavailable. Using cached data if available",
    "fallback": true
  }
}
```

---

### 1.3 Endpoint 2: GET /api/work-holidays

**Purpose:** Fetch company/work-specific holidays

**Endpoint:** `GET /api/work-holidays?year=2025&month=3[&department=engineering]`

**Query Parameters:**

| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| year | number | Yes | 2025 |
| month | number | Yes | 3 |
| department | string | No | engineering |

**Backend Flow:**
```
Request → Validate Params
         → Load Work Holidays from src/data/workHolidays.ts
         → Filter by month (and department if provided)
         → Return response (instant, no external API)
```

**Success Response (200 OK):**
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
      },
      {
        "id": "tech_team_event_2025",
        "name": "Tech Planning Session",
        "date": "2025-03-20",
        "department": "engineering",
        "description": "Q2 planning for engineering team",
        "category": "team"
      }
    ],
    "year": 2025,
    "month": 3,
    "count": 2,
    "department": "all"
  },
  "timestamp": "2025-01-08T10:30:00Z"
}
```

---

## 2. Backend Service Layer (SOLID Principles)

### 2.1 ExternalHolidayApiClient (Single Responsibility)

**File:** `src/services/ExternalHolidayApiClient.ts`

**Responsibility:** Only calls external holiday API

```typescript
class ExternalHolidayApiClient {
  async fetchHolidays(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]>
  
  private async fetchWithRetry(
    url: string,
    maxRetries: number = 3
  ): Promise<any>
  
  private transformResponse(apiResponse: any): RegularHoliday[]
  
  private isRetryable(error: Error): boolean
}
```

---

### 2.2 HolidayService (Coordination & Aggregation)

**File:** `src/services/HolidayService.ts`

**Responsibility:** Coordinate data fetching, caching, aggregation

```typescript
class HolidayService {
  constructor(
    private externalApiClient: ExternalHolidayApiClient,
    private workHolidayService: WorkHolidayService,
    private cache: CacheStore
  ) {}
  
  async getHolidaysForMonth(
    country: string,
    year: number,
    month: number
  ): Promise<AggregatedHoliday[]>
  
  private async fetchRegularHolidays(...): Promise<RegularHoliday[]>
  
  private aggregateHolidays(
    regular: RegularHoliday[],
    work: WorkHoliday[]
  ): AggregatedHoliday[]
}
```

---

### 2.3 WorkHolidayService

**File:** `src/services/WorkHolidayService.ts`

**Responsibility:** Load and filter work holidays from config

```typescript
class WorkHolidayService {
  getHolidaysForMonth(
    year: number,
    month: number,
    department?: string
  ): WorkHoliday[]
  
  getHolidayById(id: string): WorkHoliday | null
  
  getHolidaysByDepartment(department: string): WorkHoliday[]
}
```

---

### 2.4 CacheStore (Abstraction)

**File:** `src/services/cache/CacheStore.ts`

**Purpose:** Abstract cache mechanism (easy to swap implementations)

```typescript
interface CacheStore {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttl: number): void
  delete(key: string): void
  isExpired(key: string): boolean
}

class InMemoryCacheStore implements CacheStore {
  private store = new Map<string, CacheEntry>();
  
  // Implementation with TTL tracking
}
```

---

### 2.5 Retry Strategy (Backend)

```typescript
async function fetchWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  const baseDelay = 1000; // 1 second
  const multiplier = 2;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries && isRetryable(error)) {
        const delay = Math.min(
          baseDelay * Math.pow(multiplier, attempt),
          8000 // 8 second cap
        );
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}
```

---

## 3. Frontend API Integration

### 3.1 Frontend API Client

**File:** `src/services/api/HolidayApiClient.ts`

```typescript
class HolidayApiClient {
  constructor(private baseUrl: string = 'http://localhost:3001') {}
  
  async getHolidays(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]>
  
  async getWorkHolidays(
    year: number,
    month: number,
    department?: string
  ): Promise<WorkHoliday[]>
  
  private async fetchWithRetry<T>(
    url: string,
    options?: RequestInit
  ): Promise<T>
}
```

### 3.2 Redux Integration

**Async Thunk:**
```typescript
export const fetchHolidaysForMonth = createAsyncThunk(
  'calendar/fetchHolidaysForMonth',
  async ({ country, year, month }) => {
    const apiClient = new HolidayApiClient();
    const [regular, work] = await Promise.all([
      apiClient.getHolidays(country, year, month),
      apiClient.getWorkHolidays(year, month)
    ]);
    return { regular, work, year, month };
  }
);
```

### 3.3 Error Handling (Frontend)

```typescript
interface CalendarState {
  holidays: Record<string, Holiday[]>;
  loading: boolean;
  error: ApiError | null;
}

interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}
```

---

## 4. Backend Testing

### 4.1 Unit Tests (Services)

**ExternalHolidayApiClient Tests:**
- ✅ Successful API fetch
- ✅ Retry on timeout (exponential backoff)
- ✅ Response transformation
- ✅ Non-retryable error (400) fails immediately

**HolidayService Tests:**
- ✅ Cache hit returns cached data
- ✅ Cache miss fetches from API
- ✅ Cache expiration triggers refetch
- ✅ Aggregates regular + work holidays
- ✅ Work holiday takes priority

**WorkHolidayService Tests:**
- ✅ Load work holidays for month
- ✅ Filter by department
- ✅ Get by ID

### 4.2 API Integration Tests

**GET /api/holidays Tests:**
- ✅ Valid request returns 200
- ✅ Invalid country returns 400
- ✅ Unsupported country returns 404
- ✅ Rate limit returns 429 with Retry-After
- ✅ External API down returns 503

**GET /api/work-holidays Tests:**
- ✅ Valid request returns 200
- ✅ Filter by department works
- ✅ Empty month returns empty array
- ✅ Invalid month returns 400

### 4.3 Retry Logic Tests

- ✅ Timeout → Retry → Success
- ✅ Multiple retries with exponential backoff
- ✅ Max retries exceeded → Error
- ✅ Non-retryable errors → No retry

---

## 5. Frontend Testing

### 5.1 Frontend Unit Tests

**HolidayApiClient Tests:**
- ✅ Successful API call
- ✅ Network error handling
- ✅ Response parsing

**Redux Thunk Tests:**
- ✅ Dispatches loading → success → data update
- ✅ Handles API errors
- ✅ Stores data in Redux state

**Selector Tests:**
- ✅ Memoization works (same reference on same input)
- ✅ Correct filtering by date

### 5.2 Component Tests

- ✅ CalendarContainer fetches on mount
- ✅ Month navigation triggers new fetch
- ✅ Error state shows error message with retry button
- ✅ DayCell applies holiday styling

### 5.3 E2E Scenarios

**Scenario 1: Initial Load**
- User opens app → Backend serves holidays → Calendar displays correctly

**Scenario 2: Navigation**
- User navigates to next month → Backend fetches new data → Calendar updates

**Scenario 3: Error Recovery**
- API times out → Retry logic kicks in → Data eventually loads

**Scenario 4: Multiple Holidays**
- Dec 25 has both Christmas (regular) and Company Holiday (work)
- Work holiday displays as primary
- Both shown in tooltip/detail

---

## 6. Work Holiday Configuration

**File:** `src/data/workHolidays.ts`

```typescript
export const WORK_HOLIDAYS: WorkHoliday[] = [
  {
    id: "company_foundation_2025",
    name: "Company Foundation Day",
    date: "2025-03-15",
    department: "all",
    description: "10th anniversary celebration",
    category: "company"
  },
  {
    id: "tech_hackathon_2025",
    name: "Tech Hackathon Week",
    date: "2025-05-12",
    department: "engineering",
    description: "Innovation hackathon",
    category: "team"
  },
  // ... more holidays
];
```

**To Update:** Just add/modify entries in this array - no code changes needed

---

## 7. Test Coverage Goals

| Component | Target | Critical Paths |
|-----------|--------|-----------------|
| ExternalHolidayApiClient | 90% | API fetch, retry, error handling |
| HolidayService | 90% | Cache logic, aggregation |
| WorkHolidayService | 85% | Filtering, retrieval |
| API Routes | 90% | Happy path, error paths |
| Frontend API Client | 85% | Fetch, error handling |
| Redux (reducers) | 90% | State updates |
| Redux (selectors) | 80% | Memoization |
| Components | 75% | Render, user interactions |

---

## 8. Testing Tools

**Backend:**
```bash
npm install -D vitest supertest @types/supertest
```

**Frontend:**
```bash
npm install -D vitest @testing-library/react
```

**Test Scripts:**
```json
{
  "test": "vitest",
  "test:backend": "vitest src/services",
  "test:api": "vitest src/__tests__/api.test.ts",
  "test:frontend": "vitest src/components",
  "test:coverage": "vitest --coverage"
}
```

---

## 9. Implementation Order

**Phase 6.1:** Backend services (ExternalHolidayApiClient)
**Phase 6.2:** Backend services (HolidayService, WorkHolidayService)
**Phase 6.3:** Backend API routes
**Phase 6.4:** Backend tests
**Phase 6.5:** Frontend API client
**Phase 6.6:** Frontend Redux integration
**Phase 6.7:** Frontend tests

---

## Approval Sign-Off

**Document Status:** Ready for Implementation Review

**Next Step:** Proceed to Phase 6 (Actual Implementation)
