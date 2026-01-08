# Phase 2.2 - High Level Design Specification

## Executive Summary

This document provides a comprehensive high-level design for a **Reactive Web Calendar Application** with integrated holiday management. The design emphasizes modularity, responsiveness, simplicity, and adherence to SOLID principles.

---

## 1. Technology Stack

### 1.1 Backend (Server-Side)
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js (lightweight, flexible, industry standard)
- **Language:** TypeScript (for type safety and better developer experience)
- **Package Manager:** npm or yarn
- **Port:** 3001 (development), configurable for production

### 1.2 Frontend Framework
- **Primary Framework:** React 18+ (Chosen for: component reusability, reactive state management, large ecosystem, strong community)
- **Language:** TypeScript (for type safety and better developer experience)
- **Package Manager:** npm or yarn
- **Node Version:** 18+ LTS

### 1.3 State Management
- **Library:** Redux Toolkit (for predictable state management with minimal boilerplate)
- **Middleware:** Redux Thunk (for async operations like API calls)
- **Rationale:** Ensures single source of truth, predictable data flow, excellent debugging tools

### 1.4 Styling
- **Approach:** CSS Modules + CSS-in-JS (styled-components or Emotion)
- **Responsive Framework:** Custom CSS Grid/Flexbox (or Tailwind CSS alternative)
- **Design Tokens:** CSS variables for colors, spacing, typography

### 1.5 Build & Bundling
- **Build Tool:** Vite (fast bundling, excellent HMR, ESM support)
- **Module Format:** ES Modules
- **Code Splitting:** Automatic with dynamic imports

### 1.6 Backend Data Storage
- **Primary:** In-memory Map-based store (MVP, fast for single-server deployments)
- **Optional Future:** SQLite/PostgreSQL/MongoDB (easy migration path)
- **Caching:** Redis (optional, for distributed deployments)

### 1.7 Testing
- **Backend Testing:** Vitest + Supertest (for HTTP endpoints)
- **Frontend Testing:** Vitest + React Testing Library
- **E2E Testing:** Playwright or Cypress (TBD based on preference)
- **API Testing:** Postman collections for manual verification
- **Type Checking:** TypeScript compiler

### 1.8 Development Tools
- **Linting:** ESLint + Prettier (backend & frontend)
- **Git Hooks:** Husky + lint-staged (for pre-commit checks)
- **API Documentation:** Swagger/OpenAPI (auto-generated from Express routes)
- **Development Server:** Nodemon (auto-restart on changes)

### 1.9 Deployment
- **Backend Hosting:** Vercel, Railway, Heroku, or AWS EC2/Lambda
- **Frontend Hosting:** Vercel, Netlify, or AWS S3 + CloudFront
- **CI/CD:** GitHub Actions (automated testing, building, deployment)
- **Environment Management:** Environment variables via `.env` files

---

## 2. Architecture Overview

### 2.1 Full-Stack Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Browser Client                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                   React Application                            │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │              Presentation Layer (Components)             │ │  │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │ │  │
│  │  │  │   Calendar   │ │  Navigation  │ │  HolidayView    │ │ │  │
│  │  │  │  Container   │ │  Component   │ │  Components     │ │ │  │
│  │  │  └──────────────┘ └──────────────┘ └─────────────────┘ │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                          ▼                                     │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │        State Management Layer (Redux)                    │ │  │
│  │  │  ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │ │  │
│  │  │  │  Calendar  │ │   Holiday    │ │   UI State       │  │ │  │
│  │  │  │   Slice    │ │    Slice     │ │    Slice         │  │ │  │
│  │  │  └────────────┘ └──────────────┘ └──────────────────┘  │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                          ▼                                     │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │        Frontend Service/API Layer                        │ │  │
│  │  │  ┌──────────────────────────────────────────────────┐   │ │  │
│  │  │  │      API Client (Backend Communication)         │   │ │  │
│  │  │  │   - HolidayApiClient                           │   │ │  │
│  │  │  │   - DateUtilService                            │   │ │  │
│  │  │  └──────────────────────────────────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ▼ (HTTP/REST)                           │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
┌──────────────────────────────────────────────────────────────────────┐
│                       Backend Server (Node.js/Express)               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │               API Routes Layer (REST Endpoints)               │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  GET /api/holidays?country=US&year=2025&month=3      │   │  │
│  │  │  GET /api/work-holidays?year=2025&month=3            │   │  │
│  │  │  POST/PUT/DELETE work-holidays (future admin)         │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ▼                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │            Service Layer (Business Logic)                     │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────────┐  │  │
│  │  │ HolidayService   │  │ ExternalHolidayApiClient         │  │  │
│  │  │ - Fetch holidays │  │ - Calls holidayapi.com           │  │  │
│  │  │ - Aggregate data │  │ - Implements retry logic         │  │  │
│  │  │ - Cache mgmt     │  │ - Error handling                 │  │  │
│  │  └──────────────────┘  └──────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────────┐  │  │
│  │  │WorkHolidayService│  │ DateUtilService                  │  │  │
│  │  │ - Get work hol.  │  │ - Week calculations              │  │  │
│  │  │ - Manage config  │  │ - Date validations               │  │  │
│  │  └──────────────────┘  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ▼                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │            Data Layer (In-Memory Store)                       │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────────┐  │  │
│  │  │ Regular Holidays │  │  Work Holidays Config            │  │  │
│  │  │ (Map: date→[])   │  │  (JSON Array)                    │  │  │
│  │  │ With 30d cache   │  │  In src/data/workHolidays.ts     │  │  │
│  │  └──────────────────┘  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ▼                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │              External Data Sources                            │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  Holiday API (e.g., holidayapi.com or similar)        │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Layered Architecture

#### Backend API Layer (Express Routes)
- **Responsibility:** HTTP endpoint handling, request validation, response formatting
- **Routes:** REST endpoints for holidays and work holidays
- **Validation:** Request parameter validation, error handling
- **Response Format:** JSON with consistent error/success structure

#### Service Layer (Business Logic - Backend)
- **Responsibility:** Core business logic, external API integration, data aggregation
- **Components:**
  - `HolidayService`: Coordinates regular + work holiday fetching
  - `ExternalHolidayApiClient`: Calls holidayapi.com (or similar), handles retries
  - `WorkHolidayService`: Manages mocked work holiday data
  - `DateUtilService`: Date calculations, validations
- **Isolation:** Services are independent of Express/HTTP details
- **Testing:** Easy to unit test in isolation

#### Data Layer (Backend)
- **Responsibility:** Data storage and retrieval
- **Components:**
  - In-memory Map store for regular holidays (cached, 30-day TTL)
  - JSON file/in-memory array for work holidays
- **Caching:** HTTP cache headers, server-side cache validation
- **Future Migration:** Easy to upgrade to SQLite/PostgreSQL/MongoDB

#### Frontend Service/API Layer (React)
- **Responsibility:** HTTP communication with backend
- **Components:**
  - `HolidayApiClient`: Fetch holidays from backend `/api/holidays`
  - `WorkHolidayApiClient`: Fetch work holidays from backend `/api/work-holidays`
  - Redux actions for state management
- **Error Handling:** Network errors, timeout handling, fallback to cached Redux state

#### Presentation Layer (Components - React)
- **Responsibility:** Render UI and capture user interactions
- **Components:** React functional components with hooks
- **Communication:** Redux connect/useSelector for state, Redux dispatch for actions
- **Styling:** CSS Modules or styled-components

---

## 3. Component Structure

### 3.1 Component Hierarchy

```
App
├── CalendarContainer (Smart Component)
│   ├── NavigationBar
│   │   ├── PreviousButton
│   │   ├── MonthYearDisplay
│   │   └── NextButton
│   ├── CalendarGrid (Dumb Component)
│   │   ├── MonthSection (3 instances for prev, current, next)
│   │   │   ├── MonthHeader
│   │   │   ├── WeekHeader (for day names: Sun-Sat)
│   │   │   └── WeekRow (multiple instances)
│   │   │       ├── DayCell
│   │   │       │   ├── DayNumber
│   │   │       │   ├── HolidayIndicator
│   │   │       │   └── HolidayList (hidden until clicked)
│   │   │       └── WeekIndicator
│   │   │           └── WorkHolidayBadge
│   └── Loading / Error Boundary
```

### 3.2 Component Descriptions

#### CalendarContainer (Smart Component)
- **Purpose:** Orchestrate calendar logic and state
- **Responsibilities:**
  - Connect to Redux store
  - Handle navigation actions
  - Manage data loading
  - Error handling
- **Props:** None (connects directly to store)
- **Children:** NavigationBar, CalendarGrid, Loading/Error states

#### NavigationBar (Dumb Component)
- **Purpose:** Provide month navigation UI
- **Responsibilities:**
  - Display current month/year
  - Provide previous/next buttons
  - Dispatch navigation actions on button click
- **Props:** `currentMonth`, `onPrevious`, `onNext`, `canGoBack`, `canGoForward`
- **Children:** PreviousButton, MonthYearDisplay, NextButton

#### CalendarGrid (Dumb Component)
- **Purpose:** Render the 3-month calendar view
- **Responsibilities:**
  - Display 3 months in grid layout
  - Render day cells with holiday information
  - Show week indicators
- **Props:** `months` (array of 3 month objects), `selectedDay`, `onDayClick`
- **Children:** MonthSection (3 instances)

#### MonthSection (Dumb Component)
- **Purpose:** Render a single month
- **Responsibilities:**
  - Display month header
  - Display day grid for the month
  - Show week indicators
- **Props:** `month`, `holidays`, `onDayClick`
- **Children:** MonthHeader, DayCell (multiple), WeekIndicator

#### DayCell (Dumb Component)
- **Purpose:** Render a single day cell
- **Responsibilities:**
  - Display day number
  - Show holiday indicators
  - Handle click to show full holiday list
  - Highlight current day
- **Props:** `day`, `holidays`, `isCurrentDay`, `isCurrentMonth`, `onClick`
- **State:** Local state for tooltip/popup visibility
- **Children:** HolidayIndicator, HolidayPopup

#### WeekIndicator (Dumb Component)
- **Purpose:** Show work holiday indicator for a week
- **Responsibilities:**
  - Display visual indicator if week contains work holidays
  - Show count or distinction (single vs. multiple)
  - Tooltip showing details
- **Props:** `week`, `workHolidayCount`
- **State:** Local state for tooltip

---

## 4. State Management (Redux Structure)

### 4.1 Redux Store Schema

```typescript
{
  calendar: {
    // Current view month/year
    viewMonth: number (1-12),
    viewYear: number,
    
    // Metadata
    currentMonth: number,
    currentYear: number,
    currentDay: number,
    
    // Calendar data (23 months worth)
    months: {
      [key: "YYYY-MM"]: {
        year: number,
        month: number,
        weeks: Week[],
        regularHolidayCount: number,
        workHolidayCount: number
      }
    },
    
    // All holidays by date
    holidays: {
      [key: "YYYY-MM-DD"]: {
        regularHolidays: RegularHoliday[],
        workHolidays: WorkHoliday[],
        primaryType: "work" | "regular" | null
      }
    },
    
    // Loading and error states
    loading: boolean,
    error: string | null,
    lastFetch: number (timestamp)
  },
  
  ui: {
    // Modal/popup states
    selectedDayModalOpen: boolean,
    selectedDay: "YYYY-MM-DD" | null,
    
    // Theme
    isDarkMode: boolean
  }
}
```

### 4.2 Redux Slices

#### Calendar Slice
**Actions:**
- `initializeCalendar()` - Load initial data
- `nextMonth()` - Navigate to next month
- `previousMonth()` - Navigate to previous month
- `fetchHolidaysForMonth(month, year)` - Async thunk to fetch holidays
- `setHolidays(holidays)` - Set holidays in state
- `setLoading(boolean)` - Set loading state
- `setError(error)` - Set error state

**Selectors:**
- `selectCurrentView()` - Get current 3-month view
- `selectHolidaysForDay(day)` - Get holidays for specific day
- `selectWeekWorkHolidayCount(week)` - Get work holidays in a week
- `selectIsLoading()` - Get loading state
- `selectError()` - Get error message

#### UI Slice
**Actions:**
- `openDayModal(day)` - Open holiday details for a day
- `closeDayModal()` - Close modal
- `toggleDarkMode()` - Toggle theme

**Selectors:**
- `selectIsDayModalOpen()` - Is modal open
- `selectSelectedDay()` - Get selected day
- `selectIsDarkMode()` - Get theme mode

---

## 5. Service Layer Design

### 5.1 Holiday Service

```typescript
class HolidayService {
  // Fetch regular holidays from online API
  async fetchRegularHolidays(
    year: number,
    month: number,
    country: string
  ): Promise<RegularHoliday[]>
  
  // Get work holidays (mocked data)
  getWorkHolidays(year: number, month: number): WorkHoliday[]
  
  // Merge and prioritize holidays
  combineHolidays(
    regular: RegularHoliday[],
    work: WorkHoliday[]
  ): Holiday[]
  
  // Cache management
  isCacheValid(lastFetch: number): boolean
  getCachedHolidays(month, year): Holiday[] | null
  setCachedHolidays(month, year, holidays): void
}
```

### 5.2 Date Utility Service

```typescript
class DateUtilService {
  // Get 3-month view starting from a month
  getThreeMonthView(month: number, year: number): Month[]
  
  // Check if date is current day
  isCurrentDay(date: Date): boolean
  
  // Get week containing a date
  getWeekOfDate(date: Date): Week
  
  // Format date to ISO string
  formatToISO(date: Date): string
  
  // Parse ISO date string
  parseISO(dateString: string): Date
  
  // Get all weeks in a month
  getWeeksInMonth(month: number, year: number): Week[]
  
  // Check if within 23-month window
  isWithinDataWindow(month: number, year: number): boolean
}
```

### 5.3 API Client Service

```typescript
class HolidayApiClient {
  // Configure API endpoint and headers
  constructor(baseUrl: string, apiKey: string)
  
  // Make authenticated requests
  async get(endpoint: string): Promise<Response>
  
  // Handle retries and timeouts
  async getWithRetry(
    endpoint: string,
    maxRetries: number
  ): Promise<Response>
  
  // Handle errors gracefully
  private handleError(error: Error): ApiError
}
```

---

## 6. Data Flow

### 6.1 Initial Load Flow

```
App Mounts
    ↓
CalendarContainer useEffect
    ↓
Dispatch initializeCalendar()
    ↓
Redux Thunk: Fetch holidays for 3 months
    ↓
API Service: Call holiday API for each month
    ↓
Redux: Store holidays + set loading=false
    ↓
CalendarGrid re-renders with holiday data
    ↓
UI displayed to user
```

### 6.2 Month Navigation Flow

```
User clicks Next/Previous
    ↓
onClick handler dispatches nextMonth()/previousMonth()
    ↓
Redux updates viewMonth/viewYear
    ↓
Redux selector triggers fetch for new month (if not cached)
    ↓
API Service fetches holiday data
    ↓
Redux stores new data
    ↓
Components re-render with new month view
    ↓
Smooth transition to new month
```

### 6.3 Holiday Display Flow

```
Holiday data in Redux
    ↓
Selectors derive: primaryHoliday, allHolidays per day
    ↓
DayCell component receives holiday props
    ↓
Conditional styling based on holiday type
    ↓
WeekIndicator calculates work holiday count
    ↓
Render with appropriate visual distinctions
```

---

## 7. Styling Architecture

### 7.1 Design System

#### Color Palette
```
Primary:
  - Primary Brand: #0066CC (Blue)
  - Primary Light: #E6F2FF
  - Primary Dark: #003366

Secondary:
  - Work Holiday: #FF9900 (Orange/Gold)
  - Regular Holiday: #0099CC (Light Blue)
  - Current Day: #00AA00 (Green)

Neutral:
  - Background: #FFFFFF
  - Text Primary: #333333
  - Text Secondary: #666666
  - Border: #DDDDDD

State:
  - Hover: #F5F5F5
  - Active: #0066CC
  - Disabled: #CCCCCC
  - Error: #CC0000
```

#### Typography
```
Headings:
  - H1: 32px, Bold, Line-height 1.2
  - H2: 24px, Bold, Line-height 1.3
  - H3: 20px, Semi-bold, Line-height 1.4

Body:
  - Regular: 16px, Regular, Line-height 1.5
  - Small: 14px, Regular, Line-height 1.4
  - Extra Small: 12px, Regular, Line-height 1.3

Font Family: System stack (Segoe UI, Roboto, -apple-system, etc.)
```

#### Spacing Scale
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### 7.2 Responsive Breakpoints

```
Mobile: 320px - 767px
  - Single column layout
  - Stacked calendar (1 month per view or horizontal scroll)
  - Touch-optimized buttons (44x44px min)

Tablet: 768px - 1023px
  - 2-column layout (possible)
  - 3 months in a grid
  - Balanced spacing

Desktop: 1024px+
  - Full 3-month grid layout
  - Optimal spacing and typography
  - Hover states visible
```

### 7.3 CSS Architecture

**Approach:** CSS Modules + styled-components

**Structure:**
```
styles/
├── globals.css (reset, variables)
├── components/
│   ├── CalendarGrid.module.css
│   ├── DayCell.module.css
│   ├── NavigationBar.module.css
│   └── ...
└── utils/
    ├── colors.ts
    ├── spacing.ts
    └── breakpoints.ts
```

---

## 8. Testing Strategy

### 8.1 Unit Testing
- **Framework:** Vitest + React Testing Library
- **Coverage Goal:** 80%+
- **Scope:**
  - Component rendering with different props
  - Redux reducers and selectors
  - Service functions (date utils, holiday service)
  - Utility functions

### 8.2 Component Testing
- **Focus:** Component integration and prop passing
- **Scope:**
  - CalendarGrid receives correct months
  - DayCell displays holidays correctly
  - Navigation buttons trigger correct actions
  - Loading/error states display correctly

### 8.3 Integration Testing
- **Framework:** Vitest or Cypress
- **Scope:**
  - Redux flow (dispatch → state → selector)
  - API mocking (MSW)
  - User interactions (click navigation, open modal)
  - Data caching and refresh

### 8.4 E2E Testing
- **Framework:** Playwright or Cypress
- **Scope:**
  - Full user workflows (load page, navigate months, view holidays)
  - API integrations
  - Error scenarios (API down, network timeout)
  - Responsive design on different devices

---

## 9. Performance Considerations

### 9.1 Code Splitting
- **Route-based:** If multi-page app (future expansion)
- **Component-based:** Lazy load components if bundle size grows

### 9.2 Rendering Optimization
- **Memoization:** useMemo for derived data, React.memo for dumb components
- **Selectors:** Reselect for memoized Redux selectors
- **Virtual Lists:** Not needed initially (fixed 3-month view)

### 9.3 Data Fetching
- **Caching:** Cache holidays locally (localStorage or Redux)
- **Lazy Loading:** Fetch holidays for adjacent months on demand
- **Batch Requests:** Combine API calls for multiple months if API supports it

### 9.4 Bundle Size
- **Target:** < 200KB gzipped (initial + vendor)
- **Monitoring:** Use webpack-bundle-analyzer
- **Optimizations:** Tree-shaking, minification, image optimization

---

## 10. Error Handling Strategy

### 10.1 Error Types

| Error Type | Scenario | Handling |
|-----------|----------|----------|
| Network Error | API unreachable | Show error message, use cached data |
| API Error | 500, 403, 404 | Log error, show user-friendly message |
| Timeout | API slow to respond | Retry with exponential backoff |
| Invalid Data | API returns malformed data | Validate, fall back to empty holidays |
| Browser API | localStorage unavailable | Graceful degradation, use memory cache |

### 10.2 Error Boundaries
- Wrap main calendar component in Error Boundary
- Log errors to monitoring service (Sentry, LogRocket)
- Display fallback UI with error message and retry option

---

## 11. Accessibility (a11y) Design

### 11.1 Keyboard Navigation
- Tab order: Navigation buttons → Day cells
- Arrow keys: Navigate between days within a month
- Enter: Open day details modal
- Escape: Close modal

### 11.2 Screen Reader Support
- ARIA labels on buttons: "Previous month", "Next month"
- ARIA live regions: Load states, error messages
- Semantic HTML: `<button>`, `<nav>`, `<main>`
- Holiday announcements: "Work holiday: Company Foundation Day"

### 11.3 Visual Accessibility
- Color contrast: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- Icons + Text: Don't rely on icons alone for holidays
- Focus indicators: Clear outline/ring on focused elements

---

## 12. Security Considerations

### 12.1 API Integration
- **API Keys:** Store in environment variables, never expose in client code
- **CORS:** Configure appropriate CORS policies
- **Validation:** Validate all API responses before storing

### 12.2 Input Validation
- Validate month/year inputs to ensure within 23-month window
- Sanitize holiday names if displayed as HTML

### 12.3 Data Protection
- Don't store sensitive user data
- Use HTTPS for all API calls
- Implement CSP (Content Security Policy) headers

---

## 13. Development Workflow

### 13.1 Project Structure

```
mycalapp/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Calendar/
│   │   │   ├── CalendarContainer.tsx
│   │   │   ├── CalendarGrid.tsx
│   │   │   └── styles.module.css
│   │   ├── Navigation/
│   │   │   ├── NavigationBar.tsx
│   │   │   └── styles.module.css
│   │   ├── DayCell/
│   │   │   ├── DayCell.tsx
│   │   │   └── styles.module.css
│   │   └── ...
│   ├── services/
│   │   ├── HolidayService.ts
│   │   ├── DateUtilService.ts
│   │   ├── HolidayApiClient.ts
│   │   └── ...
│   ├── store/
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── calendarSlice.ts
│   │   │   ├── uiSlice.ts
│   │   │   └── ...
│   │   └── selectors/
│   │       ├── calendarSelectors.ts
│   │       └── ...
│   ├── types/
│   │   ├── Holiday.ts
│   │   ├── Calendar.ts
│   │   └── ...
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── components/
│   ├── services/
│   ├── store/
│   └── ...
├── .env.example
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 13.2 Development Workflow

1. **Setup:** `npm install` → `npm run dev`
2. **Feature Development:** Create feature branch → develop → test
3. **Code Review:** Push to GitHub → Open PR → Review
4. **Testing:** Run test suite → Check coverage
5. **Deployment:** Merge to main → CI/CD runs → Auto-deploy

### 13.3 Git Strategy
- **Main:** Production-ready code
- **Develop:** Integration branch for features
- **Feature branches:** `feature/holiday-api-integration`
- **Commit messages:** Conventional commits (feat:, fix:, docs:, etc.)

---

## 14. Deployment & Infrastructure

### 14.1 Build Process
1. Run tests
2. Build with Vite (`npm run build`)
3. Output to `dist/` folder
4. Minify and optimize assets

### 14.2 Hosting Options
- **Vercel:** Automatic deployments from Git, serverless functions available
- **Netlify:** Similar to Vercel, good for static sites
- **AWS:** S3 + CloudFront for more control

### 14.3 Environment Configuration
```
Development:  http://localhost:5173
Staging:      https://staging.mycalapp.vercel.app
Production:   https://mycalapp.vercel.app

API Endpoints:
Dev:          http://localhost:3000/api
Staging:      https://api-staging.example.com
Prod:         https://api.example.com
```

---

## 15. Monitoring & Analytics

### 15.1 Performance Monitoring
- Core Web Vitals (LCP, FID, CLS)
- Bundle size tracking
- API response times
- Tools: Vercel Analytics, WebVitals, Sentry

### 15.2 Error Tracking
- Unhandled exceptions
- API failures
- Network errors
- Tools: Sentry, LogRocket, Datadog

### 15.3 Usage Analytics
- Page views, navigation patterns
- User interactions
- Conversion funnels
- Tools: Google Analytics, Mixpanel, Amplitude

---

## Approval Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Tech Lead | | | |
| Product Owner | | | |

**Document Status:** Ready for Review

**Next Step:** Proceed to Phase 3 (Data Schema) upon approval
