# Phase 6 - Implementation Plan

## Executive Summary

This document outlines the detailed implementation plan for building the Reactive Web Calendar Application. The implementation follows a **modular, SOLID-principle-based approach** with independent development and testing of each API at a time.

**Approach:** Backend First → Frontend Integration → Testing

---

## 1. Project Structure

```
mycalapp/
├── backend/                          # Node.js/Express server
│   ├── src/
│   │   ├── services/
│   │   │   ├── ExternalHolidayApiClient.ts
│   │   │   ├── HolidayService.ts
│   │   │   ├── WorkHolidayService.ts
│   │   │   └── cache/
│   │   │       └── CacheStore.ts
│   │   ├── routes/
│   │   │   └── holidays.routes.ts
│   │   ├── data/
│   │   │   └── workHolidays.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   └── errorHandler.ts
│   │   ├── __tests__/
│   │   │   ├── services/
│   │   │   │   ├── ExternalHolidayApiClient.test.ts
│   │   │   │   ├── HolidayService.test.ts
│   │   │   │   └── WorkHolidayService.test.ts
│   │   │   └── routes/
│   │   │       └── holidays.routes.test.ts
│   │   ├── app.ts                   # Express app setup
│   │   └── server.ts                # Server entry point
│   ├── .env
│   └── package.json
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── services/
│   │   │   └── api/
│   │   │       └── HolidayApiClient.ts
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   │   ├── calendarSlice.ts
│   │   │   │   └── uiSlice.ts
│   │   │   ├── selectors/
│   │   │   │   └── calendarSelectors.ts
│   │   │   └── store.ts
│   │   ├── components/
│   │   │   ├── CalendarContainer.tsx
│   │   │   ├── CalendarGrid.tsx
│   │   │   └── ...other components
│   │   ├── __tests__/
│   │   │   ├── services/
│   │   │   │   └── api.client.test.ts
│   │   │   ├── redux/
│   │   │   │   └── calendarSlice.test.ts
│   │   │   └── components/
│   │   │       └── CalendarContainer.test.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
│
└── docs/
    ├── Phase1.2-Requirements...
    ├── Phase2.2-HighLevelDesign...
    ├── Phase3.2-DataSchema...
    ├── Phase4.2-Performance...
    ├── Phase5.2-API...
    └── Phase6-ImplementationPlan.md
```

---

## 2. Backend Implementation (One API at a Time)

### Step 1: ExternalHolidayApiClient (First API)

**Duration:** 2-3 days

**Files to Create:**
- `backend/src/services/ExternalHolidayApiClient.ts`
- `backend/src/__tests__/services/ExternalHolidayApiClient.test.ts`

**Implementation Tasks:**

1. **Create ExternalHolidayApiClient class**
   - Constructor accepting API base URL
   - `fetchHolidays(country, year, month)` method
   - `fetchWithRetry()` with exponential backoff
   - `transformResponse()` to convert external API → internal model
   - `isRetryable()` to check if error should retry

2. **Implement Retry Logic**
   - Max retries: 3
   - Base delay: 1000ms
   - Multiplier: 2x
   - Max delay: 8000ms
   - Retryable errors: Network, Timeout, 5xx
   - Non-retryable: 400, 401, 404

3. **Write Unit Tests**
   - ✅ Test successful API fetch
   - ✅ Test timeout → retry → success
   - ✅ Test max retries exceeded
   - ✅ Test response transformation
   - ✅ Test non-retryable errors (400, 401)
   - ✅ Test error logging

**Code Quality:**
- ✅ Follow SOLID (Single Responsibility)
- ✅ No framework dependencies
- ✅ Type-safe with TypeScript
- ✅ Comprehensive JSDoc comments
- ✅ 90%+ test coverage

**Acceptance Criteria:**
- All unit tests pass
- Manual API call works (can test with real API)
- Retry logic verified with mocked failures
- Response correctly transforms to internal model

---

### Step 2: CacheStore & HolidayService (Second API)

**Duration:** 3-4 days

**Files to Create:**
- `backend/src/services/cache/CacheStore.ts`
- `backend/src/services/HolidayService.ts`
- `backend/src/__tests__/services/CacheStore.test.ts`
- `backend/src/__tests__/services/HolidayService.test.ts`

**Implementation Tasks:**

1. **Create CacheStore Interface & InMemoryImplementation**
   - `get<T>(key: string): T | null`
   - `set<T>(key: string, value: T, ttl: number): void`
   - `delete(key: string): void`
   - `isExpired(key: string): boolean`
   - TTL-based expiration tracking
   - Garbage collection for expired entries

2. **Create HolidayService**
   - Constructor accepts: ExternalHolidayApiClient, CacheStore
   - `getHolidaysForMonth(country, year, month)` - main public method
   - Private: `fetchRegularHolidays()` - calls external API or cache
   - Private: `cacheKey()` - generates cache key
   - Private: `isCacheValid()` - checks TTL

3. **Write Unit Tests**
   - ✅ Cache hit returns cached data (no API call)
   - ✅ Cache miss fetches from API and caches
   - ✅ Expired cache triggers refetch
   - ✅ Cache key format correct
   - ✅ TTL validation

**Code Quality:**
- ✅ Dependency injection (pass services to constructor)
- ✅ No direct Express imports
- ✅ Testable in isolation
- ✅ Error handling for cache failures

**Acceptance Criteria:**
- All tests pass
- Cache hit and miss scenarios verified
- TTL mechanism works correctly
- Service can be tested independently

---

### Step 3: WorkHolidayService (Third API)

**Duration:** 1-2 days

**Files to Create:**
- `backend/src/services/WorkHolidayService.ts`
- `backend/src/data/workHolidays.ts`
- `backend/src/__tests__/services/WorkHolidayService.test.ts`

**Implementation Tasks:**

1. **Create workHolidays.ts data file**
   - Export WORK_HOLIDAYS array with sample data
   - Include: id, name, date, department, description, category
   - 10-15 sample holidays across multiple months and departments

2. **Create WorkHolidayService**
   - `getHolidaysForMonth(year, month, department?)` - filter by month/department
   - `getHolidayById(id)` - get single holiday
   - `getHolidaysByDepartment(dept)` - all holidays for department
   - Date range validation (ensure valid dates)

3. **Write Unit Tests**
   - ✅ Get all holidays for specific month
   - ✅ Filter by department
   - ✅ Get by ID returns correct holiday
   - ✅ Invalid month returns empty array
   - ✅ Optional department filter works

**Code Quality:**
- ✅ No external API calls
- ✅ Instant response (in-memory)
- ✅ Simple, focused service

**Acceptance Criteria:**
- All tests pass
- Service returns correct filtered data
- Manual testing with different date ranges works

---

### Step 4: Backend API Routes & Express App

**Duration:** 3-4 days

**Files to Create:**
- `backend/src/routes/holidays.routes.ts`
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/utils/validators.ts`
- `backend/src/utils/errorHandler.ts`
- `backend/.env.example`

**Implementation Tasks:**

1. **Create Route Handlers**
   - `GET /api/holidays?country=US&year=2025&month=3`
     - Validate query params
     - Call HolidayService.getHolidaysForMonth()
     - Return standardized JSON response
   - `GET /api/work-holidays?year=2025&month=3[&department=...]`
     - Validate params
     - Call WorkHolidayService
     - Return standardized response

2. **Create Validators**
   - `validateHolidayParams(country, year, month)`
   - `validateWorkHolidayParams(year, month)`
   - Return detailed error messages for invalid inputs

3. **Create Error Handler Middleware**
   - Catch all errors
   - Log errors with context
   - Return standardized error responses
   - Distinguish between client (4xx) and server (5xx) errors

4. **Create Express App Setup**
   - Initialize Express
   - Register middleware (logging, JSON parsing, CORS)
   - Register routes
   - Register error handler
   - Return configured app

5. **Create Server Entry Point**
   - Load environment variables from .env
   - Start Express server on port 3001 (or configurable)
   - Handle graceful shutdown
   - Log startup message

6. **Write API Integration Tests**
   - ✅ GET /api/holidays with valid params → 200
   - ✅ GET /api/holidays with invalid country → 400
   - ✅ GET /api/holidays with unsupported country → 404
   - ✅ GET /api/work-holidays with valid params → 200
   - ✅ GET /api/work-holidays with invalid month → 400
   - ✅ Error response format is consistent

**Code Quality:**
- ✅ Standardized response format
- ✅ Comprehensive error handling
- ✅ CORS enabled for frontend development
- ✅ Request/response logging
- ✅ Environment-based configuration

**Acceptance Criteria:**
- API responds on http://localhost:3001
- All endpoints return correct status codes and formats
- Error responses are helpful
- Manual testing with Postman/curl works
- All integration tests pass

---

### Step 5: Backend Tests & Documentation

**Duration:** 2 days

**Tasks:**
- ✅ Add npm scripts for testing:
  - `npm run test` - run all tests
  - `npm run test:services` - run service tests only
  - `npm run test:api` - run API route tests only
  - `npm run test:coverage` - coverage report
- ✅ Generate coverage report (target: 80%+)
- ✅ Create README with:
  - How to run backend
  - API endpoint documentation
  - Error codes reference
  - Example requests/responses

---

## 3. Frontend Implementation

### Step 6: Frontend API Client

**Duration:** 2 days

**Files to Create:**
- `frontend/src/services/api/HolidayApiClient.ts`
- `frontend/src/services/api/types.ts`
- `frontend/src/__tests__/services/api.client.test.ts`

**Implementation Tasks:**

1. **Create HolidayApiClient**
   - Constructor with base URL (configurable)
   - `getHolidays(country, year, month)`
   - `getWorkHolidays(year, month, department?)`
   - `fetchWithRetry()` with exponential backoff
   - Error handling with proper error types

2. **Create Type Definitions**
   - RegularHoliday interface
   - WorkHoliday interface
   - ApiError interface
   - ApiResponse wrapper

3. **Write Unit Tests**
   - ✅ Successful API call returns parsed response
   - ✅ Network error handling
   - ✅ HTTP error handling (4xx, 5xx)
   - ✅ Retry logic works
   - ✅ Timeout handling

**Acceptance Criteria:**
- All tests pass
- Can call real backend API
- Proper error handling

---

### Step 7: Redux State Management

**Duration:** 2-3 days

**Files to Create:**
- `frontend/src/redux/slices/calendarSlice.ts`
- `frontend/src/redux/selectors/calendarSelectors.ts`
- `frontend/src/redux/store.ts`
- `frontend/src/__tests__/redux/calendarSlice.test.ts`

**Implementation Tasks:**

1. **Create Calendar Slice**
   - State shape: { holidays: {}, loading, error, viewMonth, viewYear }
   - Actions: setViewMonth, setViewYear
   - Async thunk: fetchHolidaysForMonth (calls API client)
   - Reducers: handle pending/fulfilled/rejected states

2. **Create Selectors**
   - `selectHolidaysForMonth(state)` - memoized
   - `selectHolidaysForDay(state, date)` - memoized
   - `selectLoading(state)`
   - `selectError(state)`
   - `selectWorkHolidayCountForWeek(state, weekDates)` - memoized

3. **Configure Redux Store**
   - Create store with calendar slice
   - Add Redux DevTools extension
   - Configure middleware

4. **Write Unit Tests**
   - ✅ Reducer updates state correctly
   - ✅ Async thunk handles loading/success/error
   - ✅ Selectors return correct data
   - ✅ Memoization works (same reference)

**Acceptance Criteria:**
- Store initializes correctly
- Actions update state as expected
- Selectors return correct data
- Thunk dispatches proper actions

---

### Step 8: Frontend Components (Integrating API)

**Duration:** 3-4 days

**Files to Modify/Create:**
- `frontend/src/components/CalendarContainer.tsx`
- `frontend/src/components/NavigationBar.tsx`
- `frontend/src/__tests__/components/CalendarContainer.test.tsx`

**Implementation Tasks:**

1. **Update CalendarContainer**
   - Connect to Redux store (useSelector, useDispatch)
   - useEffect to fetch holidays on mount and view change
   - Dispatch fetchHolidaysForMonth with country/year/month
   - Handle loading state (show spinner)
   - Handle error state (show error message + retry button)
   - Pass fetched holidays to CalendarGrid

2. **Update NavigationBar**
   - Dispatch month navigation actions
   - Disable buttons at boundaries (±11 months)

3. **Update CalendarGrid**
   - Receive holidays from parent
   - Apply holiday styling to day cells
   - Show week indicators
   - Show tooltips

4. **Write Component Tests**
   - ✅ Component fetches data on mount
   - ✅ Navigation triggers new fetch
   - ✅ Loading state displays
   - ✅ Error state shows error + retry button
   - ✅ Data displays when loaded

**Acceptance Criteria:**
- Calendar displays holidays from API
- Navigation works end-to-end
- Error states handled gracefully
- Holidays styled correctly

---

### Step 9: Frontend Testing

**Duration:** 2 days

**Tasks:**
- ✅ Write additional integration tests:
  - Fetch → Redux → Component flow
  - Error handling → fallback
  - Multiple holidays on same date
- ✅ Add test scripts:
  - `npm run test:frontend`
  - `npm run test:e2e` (Playwright/Cypress)
- ✅ Coverage report (target: 75%+)

---

## 4. Full-Stack Testing & Deployment

### Step 10: End-to-End Testing

**Duration:** 1-2 days

**Tasks:**
- ✅ Test complete user journeys:
  - Load app → Display calendar
  - Navigate months → Update view
  - Click holiday → Show details
  - Offline → Use cached data
  - API error → Retry succeeds

**Tools:** Playwright or Cypress

---

### Step 11: Documentation & Deployment

**Duration:** 1 day

**Tasks:**
- ✅ Create API documentation (README, Swagger)
- ✅ Create deployment guide
- ✅ Docker setup (optional)
- ✅ CI/CD pipeline (GitHub Actions)

---

## 5. Implementation Schedule

| Step | Component | Duration | Start | End |
|------|-----------|----------|-------|-----|
| 1 | ExternalHolidayApiClient + Tests | 2-3d | Day 1 | Day 3 |
| 2 | CacheStore + HolidayService + Tests | 3-4d | Day 4 | Day 7 |
| 3 | WorkHolidayService + Tests | 1-2d | Day 8 | Day 9 |
| 4 | Routes + Express App + Tests | 3-4d | Day 10 | Day 13 |
| 5 | Backend Tests & Docs | 2d | Day 14 | Day 15 |
| **Backend Total** | | **14 days** | | |
| 6 | Frontend API Client | 2d | Day 16 | Day 17 |
| 7 | Redux State Management | 2-3d | Day 18 | Day 20 |
| 8 | Components Integration | 3-4d | Day 21 | Day 24 |
| 9 | Frontend Testing | 2d | Day 25 | Day 26 |
| 10 | E2E Testing | 1-2d | Day 27 | Day 28 |
| 11 | Documentation & Deploy | 1d | Day 29 | Day 29 |
| **Total** | | **~29 days** | | |

---

## 6. Code Quality Standards

### Modularity (SOLID Principles)
- ✅ Single Responsibility: Each service has one job
- ✅ Open/Closed: Services can be extended without modification
- ✅ Liskov Substitution: Services can be swapped with mocks
- ✅ Interface Segregation: Only expose necessary methods
- ✅ Dependency Inversion: Depend on abstractions, not concrete implementations

### Testing
- ✅ Unit tests for all services
- ✅ Integration tests for all routes
- ✅ Component tests for all UI components
- ✅ E2E tests for user journeys
- ✅ Target coverage: Backend 80%+, Frontend 75%+

### Documentation
- ✅ JSDoc comments on all public methods
- ✅ Type definitions for all data models
- ✅ README with setup instructions
- ✅ API documentation with examples
- ✅ Test documentation with examples

---

## 7. Success Criteria

- ✅ Backend API serves holidays correctly
- ✅ Frontend fetches and displays holidays
- ✅ All month navigation works
- ✅ Holiday styling applied correctly
- ✅ Week indicators display correctly
- ✅ Error handling works (offline, timeout, API errors)
- ✅ Test coverage: Backend 80%+, Frontend 75%+
- ✅ Performance targets met (LCP < 2.5s, FID < 100ms)
- ✅ Responsive design works (mobile, tablet, desktop)
- ✅ No console errors or warnings

---

## 8. Next Steps

1. ✅ Set up backend project structure
2. ✅ Begin Step 1: Implement ExternalHolidayApiClient
3. Keep implementation modular and test-driven
4. Each API tested independently before moving next
5. Regular integration points to ensure full-stack works

**Ready to start Phase 6 implementation!**
