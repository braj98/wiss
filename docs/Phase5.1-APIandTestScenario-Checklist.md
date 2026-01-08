# Phase 5.1 - API and Test Scenario Checklist

## API Specification

### Holiday API Endpoints

#### Get Holidays Endpoint
- [ ] Endpoint path defined: `/api/holidays`
- [ ] HTTP method: GET
- [ ] Query parameters documented (country, year, month)
- [ ] Request validation rules specified
- [ ] Response schema defined
- [ ] Response examples provided
- [ ] Error codes listed

#### Success Response (200 OK)
- [ ] Status code 200 specified
- [ ] Holiday data structure defined
- [ ] Date format (YYYY-MM-DD) confirmed
- [ ] All required fields present
- [ ] Optional fields documented

#### Error Responses
- [ ] 400 Bad Request (invalid params)
- [ ] 401 Unauthorized (invalid API key)
- [ ] 404 Not Found (country not supported)
- [ ] 429 Too Many Requests (rate limit)
- [ ] 500 Internal Server Error
- [ ] Error response format consistent
- [ ] Error messages clear and actionable

### Request Specification

#### Query Parameters
- [ ] `country` parameter: ISO 3166-1 alpha-2 code
- [ ] `year` parameter: valid year (e.g., 2025)
- [ ] `month` parameter: valid month (1-12)
- [ ] Parameter validation rules
- [ ] Parameter constraints documented
- [ ] Optional vs. required parameters clear

#### Request Headers
- [ ] Content-Type specified
- [ ] Authorization header format (if needed)
- [ ] Accept header specified
- [ ] Custom headers documented

#### Request Examples
- [ ] Valid request example provided
- [ ] Invalid parameter example provided
- [ ] Missing parameter example provided
- [ ] All edge cases covered

### Response Specification

#### Response Body
- [ ] JSON response format specified
- [ ] Field names and types documented
- [ ] Field order consistent
- [ ] No unnecessary fields included
- [ ] Compression format specified (gzip)

#### Response Headers
- [ ] Cache-Control header specified (30 days)
- [ ] ETag header for freshness
- [ ] Content-Type: application/json
- [ ] CORS headers if applicable

#### Response Examples
- [ ] Successful response example (full)
- [ ] Successful response with no holidays
- [ ] Error response example
- [ ] Edge case response examples

### Caching Specification

#### Client-Side Caching
- [ ] Cache key format specified
- [ ] Cache TTL: 30 days
- [ ] Cache invalidation strategy
- [ ] Manual refresh option
- [ ] Stale cache handling

#### Server-Side Caching
- [ ] Cache headers configured
- [ ] 304 Not Modified response
- [ ] ETag generation strategy
- [ ] Cache bust strategy (if needed)

### API Error Handling

#### Error Scenarios
- [ ] Network timeout (retry strategy)
- [ ] Invalid API key (clear error message)
- [ ] Rate limit exceeded (backoff strategy)
- [ ] Server error (fallback to cache)
- [ ] Malformed response (validation)

#### Retry Strategy
- [ ] Maximum retries defined
- [ ] Exponential backoff implemented
- [ ] Retry conditions specified
- [ ] Timeout values set

#### User Communication
- [ ] Error messages clear and helpful
- [ ] Error logged for debugging
- [ ] User notified of issues
- [ ] Fallback data displayed (cached)

---

## Mocked Work Holiday Data API

### Mock Data Endpoints

#### Data Source
- [ ] Location: `src/data/mockWorkHolidays.ts`
- [ ] Format: JSON array
- [ ] No network call required
- [ ] Instant availability
- [ ] Easy to update/modify

#### Mock Data Functions
- [ ] `getWorkHolidaysForMonth(year, month)` defined
- [ ] `getAllWorkHolidays()` defined
- [ ] `getWorkHolidayById(id)` defined
- [ ] `getWorkHolidaysByDepartment(dept)` defined (optional)

#### Mock Data Structure
- [ ] Sample data provided for all 23 months
- [ ] Multiple holidays on same day covered
- [ ] Different departments covered (if applicable)
- [ ] Edge cases included (leap year, year boundary)

#### Mock Data Updates
- [ ] Easy configuration method
- [ ] No code changes needed for updates
- [ ] Validation on mock data
- [ ] Documentation on how to update

---

## Test Scenarios

### Unit Tests

#### API Service Tests
- [ ] Holiday fetch succeeds with valid params
- [ ] API error handling (timeout, 500, etc.)
- [ ] Response validation (malformed data)
- [ ] Caching works correctly
- [ ] Cache expiration handled
- [ ] Retry logic on failure

#### Data Transformation Tests
- [ ] API response → internal model transformation
- [ ] Work holiday loading from mock data
- [ ] Data merging (regular + work)
- [ ] Data validation and filtering
- [ ] Deduplication logic

#### Redux Tests
- [ ] Actions dispatch correctly
- [ ] Reducers update state correctly
- [ ] Selectors return expected values
- [ ] Memoized selectors cache correctly
- [ ] State normalization works

#### Utility Tests
- [ ] Date calculations (week, month)
- [ ] ISO week number calculation
- [ ] Leap year handling
- [ ] 23-month window validation
- [ ] Primary holiday determination

### Component Tests

#### Calendar Container Tests
- [ ] Mounts and fetches data on load
- [ ] Month navigation triggers fetch
- [ ] Loading state displayed
- [ ] Error state handled
- [ ] Data displayed correctly

#### Navigation Bar Tests
- [ ] Previous/Next buttons work
- [ ] Buttons disabled at boundaries
- [ ] Month/year displayed correctly
- [ ] Accessibility features work

#### Calendar Grid Tests
- [ ] Displays 3 months correctly
- [ ] Days rendered in correct grid positions
- [ ] Current day highlighted
- [ ] Holiday indicators displayed
- [ ] Week indicators shown

#### Day Cell Tests
- [ ] Day number displayed
- [ ] Holiday indicator shown
- [ ] Click opens detail modal
- [ ] Correct styling for holiday type
- [ ] Multiple holidays handled

#### Week Indicator Tests
- [ ] Not shown if no work holidays
- [ ] Shows for single work holiday
- [ ] Shows different style for multiple
- [ ] Tooltip displays correctly
- [ ] Count is accurate

### Integration Tests

#### API Integration
- [ ] Successful API fetch and display
- [ ] API error → cached data fallback
- [ ] Timeout → retry with backoff
- [ ] Response caching works
- [ ] Cache expiration triggers refetch

#### Navigation Integration
- [ ] Navigate → fetch new month
- [ ] Navigate back → use cache
- [ ] Navigate to boundary → stop
- [ ] Month change → UI updates
- [ ] History preserved (optional)

#### Data Display Integration
- [ ] Regular holidays displayed in correct color
- [ ] Work holidays displayed in correct color
- [ ] Multiple holidays: work takes priority
- [ ] Week indicators update correctly
- [ ] Tooltips show correct information

### E2E Tests

#### User Journey 1: Initial Load
1. User opens app
2. Calendar loads with 3-month view
3. Current day highlighted
4. Holidays displayed
5. No errors shown

#### User Journey 2: Navigate Months
1. User clicks next month
2. Calendar updates to new month
3. Holidays loaded correctly
4. Week indicators show correctly
5. User can navigate back

#### User Journey 3: View Holiday Details
1. User clicks on holiday
2. Modal opens with details
3. Multiple holidays shown if applicable
4. Modal closes on escape/close button
5. Calendar remains unchanged

#### User Journey 4: Offline Fallback
1. App loads with cached data
2. Network goes offline
3. User can still navigate (cached months)
4. Error message shown (if attempting new month)
5. Uses cached data gracefully

#### User Journey 5: Error Handling
1. API returns 500 error
2. Fallback to cached data
3. Error notification shown
4. User can retry
5. Works when network recovers

---

## Test Data Sets

### Regular Holidays Test Data
- [ ] Sample holidays for year 2025
- [ ] Sample holidays for year 2024
- [ ] Sample holidays for year 2026
- [ ] Multiple holidays on same date
- [ ] Holidays on weekends
- [ ] Holidays on leap day (Feb 29)
- [ ] Holidays at year boundaries

### Work Holidays Test Data
- [ ] Sample work holidays for all months
- [ ] Single work holiday per week
- [ ] Multiple work holidays in week
- [ ] Work holidays on regular holidays
- [ ] Work holidays on weekends
- [ ] Department-specific holidays

### Edge Case Test Data
- [ ] Empty month (no holidays)
- [ ] Full month (many holidays)
- [ ] Very long holiday names (200+ chars)
- [ ] Special characters in names (©, ®, etc.)
- [ ] Unicode/emoji characters
- [ ] All-caps names
- [ ] Mixed case names

### Performance Test Data
- [ ] 23 months of holidays (500+ entries)
- [ ] Large API response (10KB+)
- [ ] Slow network simulation (3G)
- [ ] High latency simulation (500ms)
- [ ] Timeout scenario (>5s)
- [ ] Partial data scenario

---

## Test Coverage

### Code Coverage Goals
- [ ] Statements: ≥ 80%
- [ ] Branches: ≥ 75%
- [ ] Functions: ≥ 80%
- [ ] Lines: ≥ 80%

### Critical Path Coverage
- [ ] 100% coverage for data fetch
- [ ] 100% coverage for error handling
- [ ] 100% coverage for date calculations
- [ ] 100% coverage for holiday filtering

### Component Coverage
- [ ] CalendarContainer: ≥ 90%
- [ ] CalendarGrid: ≥ 85%
- [ ] DayCell: ≥ 85%
- [ ] NavigationBar: ≥ 85%
- [ ] WeekIndicator: ≥ 80%

---

## Test Tools & Configuration

### Testing Framework
- [ ] Vitest configured
- [ ] Test file structure defined
- [ ] Test naming convention established
- [ ] Test utilities created

### Component Testing
- [ ] React Testing Library configured
- [ ] render() utility available
- [ ] fireEvent/userEvent available
- [ ] Query methods documented

### Mocking
- [ ] Mock Service Worker (MSW) configured
- [ ] API mocks created
- [ ] Redux mock store available
- [ ] Component mocks created

### Coverage Tools
- [ ] Coverage reporter configured
- [ ] Thresholds set
- [ ] Coverage reports generated
- [ ] CI integration configured

---

## Test Execution

### Local Testing
- [ ] `npm run test` runs all tests
- [ ] `npm run test:watch` for development
- [ ] `npm run test:coverage` for coverage
- [ ] Tests pass before commit (pre-commit hook)

### CI/CD Testing
- [ ] Tests run on every push
- [ ] Coverage reports generated
- [ ] Failing tests block deployment
- [ ] Coverage thresholds enforced

### Performance Testing
- [ ] Lighthouse tests run
- [ ] Bundle size checked
- [ ] Performance benchmarks recorded
- [ ] Regressions detected

---

## API Documentation

### Documentation Format
- [ ] OpenAPI/Swagger spec created
- [ ] Request/response examples provided
- [ ] Error codes documented
- [ ] Rate limits documented
- [ ] Authentication documented

### Developer Guide
- [ ] Setup instructions clear
- [ ] API examples provided
- [ ] Common issues documented
- [ ] FAQ section included

### Changelog
- [ ] API versions tracked
- [ ] Breaking changes documented
- [ ] Deprecations noted
- [ ] Migration guides provided

---

## Sign-Off

- [ ] All API endpoints defined
- [ ] All test scenarios documented
- [ ] Test data prepared
- [ ] Tools configured
- [ ] Coverage goals set
- [ ] Documentation complete
- [ ] Team has reviewed and approved

**Checklist Status:** Ready for Review

**Next Step:** Await approval to create detailed specification document
