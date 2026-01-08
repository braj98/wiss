# MyCalApp - Development Roadmap

## Project Development Process

This document outlines the structured approach to building a reactive app with comprehensive documentation at each phase.

---

## Phase 1: Requirements and Edge Cases
**Status:** In Review

### Deliverables:
- [x] **1.1 - Checklist**: [Requirements & Edge Cases Checklist](docs/Phase1.1-Requirements-EdgeCases-Checklist.md)
- [x] **1.2 - Document**: [Requirements & Edge Cases Specification](docs/Phase1.2-Requirements-EdgeCases-Specification.md) (Sharable)

**Next Step:** Await approval before proceeding to Phase 2

---

## Phase 2: High Level Design
**Status:** In Review

### Deliverables:
- [x] **2.1 - Checklist**: [High Level Design Checklist](docs/Phase2.1-HighLevelDesign-Checklist.md)
- [x] **2.2 - Document**: [High Level Design Specification](docs/Phase2.2-HighLevelDesign-Specification.md) (Sharable)

**Next Step:** Await approval before proceeding to Phase 3

---

## Phase 3: Data Schema
**Status:** In Review

### Deliverables:
- [x] **3.1 - Checklist**: [Data Schema Checklist](docs/Phase3.1-DataSchema-Checklist.md)
- [x] **3.2 - Document**: [Data Schema Specification](docs/Phase3.2-DataSchema-Specification.md) (Sharable)

**Note:** Updated to focus on database schema with in-memory implementation recommendation

**Next Step:** Await approval before proceeding to Phase 4

---

## Phase 4: Performance and Scalability
**Status:** In Review

### Deliverables:
- [x] **4.1 - Checklist**: [Performance & Scalability Checklist](docs/Phase4.1-PerformanceAndScalability-Checklist.md)
- [x] **4.2 - Document**: [Performance & Scalability Specification](docs/Phase4.2-PerformanceAndScalability-Specification.md) (Sharable)

**Next Step:** Await approval before proceeding to Phase 5

---

## Phase 5: API and Test Scenario (BACKEND-INTEGRATED APPROACH)
**Status:** Approved - Ready for Implementation

### Deliverables:
- [x] **5.1 - Checklist**: [API & Test Scenario Checklist](docs/Phase5.1-APIandTestScenario-Checklist.md)
- [x] **5.2 - Document**: [API & Test Scenario Specification](docs/Phase5.2-APIandTestScenario-Specification.md) (Sharable)

**Key Changes:**
- ✅ Backend API layer added (Node.js/Express)
- ✅ Two REST endpoints: `/api/holidays`, `/api/work-holidays`
- ✅ Service layer architecture (SOLID principles)
- ✅ Caching strategy at backend level
- ✅ Retry logic with exponential backoff
- ✅ Frontend consumes backend APIs via Redux
- ✅ Comprehensive test strategy for both backend and frontend

**Next Step:** Proceed to Phase 6 (Implementation)

---

## Phase 6: Actual Implementation
**Status:** Ready to Start - Backend-First Approach

### Implementation Plan:
- [x] [Phase 6 Implementation Plan](docs/Phase6-ImplementationPlan.md) Created

### Backend Tasks (One API at a time):

**Step 1: ExternalHolidayApiClient (2-3 days)**
- [ ] Create backend project structure
- [ ] Create `backend/src/services/ExternalHolidayApiClient.ts`
- [ ] Implement fetchHolidays() with retry logic
- [ ] Write unit tests (90%+ coverage)
- [ ] Manual testing with real API

**Step 2: CacheStore & HolidayService (3-4 days)**
- [ ] Create `backend/src/services/cache/CacheStore.ts`
- [ ] Create `backend/src/services/HolidayService.ts`
- [ ] Implement cache logic + TTL
- [ ] Write unit tests (90%+ coverage)

**Step 3: WorkHolidayService (1-2 days)**
- [ ] Create `backend/src/data/workHolidays.ts`
- [ ] Create `backend/src/services/WorkHolidayService.ts`
- [ ] Write unit tests (85%+ coverage)

**Step 4: Backend API Routes (3-4 days)**
- [ ] Create routes + Express app
- [ ] Implement GET /api/holidays
- [ ] Implement GET /api/work-holidays
- [ ] Write API integration tests
- [ ] Manual testing with Postman

**Step 5: Backend Testing & Docs (2 days)**
- [ ] Set up test scripts
- [ ] Generate coverage reports
- [ ] Create API documentation

### Frontend Tasks:

**Step 6: Frontend API Client (2 days)**
- [ ] Create `frontend/src/services/api/HolidayApiClient.ts`
- [ ] Write unit tests

**Step 7: Redux State Management (2-3 days)**
- [ ] Create Redux slices + selectors
- [ ] Write reducer/selector tests

**Step 8: Components Integration (3-4 days)**
- [ ] Connect components to Redux
- [ ] Implement API calls
- [ ] Write component tests

**Step 9: Frontend Testing (2 days)**
- [ ] Integration tests
- [ ] Coverage reports (75%+)

**Step 10: End-to-End Testing (1-2 days)**
- [ ] User journey testing with Playwright

**Step 11: Documentation & Deploy (1 day)**
- [ ] Final docs + deployment

**Total Estimated Duration:** ~29 days

### Progress Tracking:
- [ ] All backend services implemented and tested
- [ ] All API endpoints working
- [ ] Frontend integration complete
- [ ] Full-stack testing done
- [ ] Deployment ready

**Next Step:** Begin Step 1 - ExternalHolidayApiClient implementation

---

## Phase 7: Verification by Running Test Cases
**Status:** Not Started

### Deliverables:
- [ ] **7.1 - Test Results**: Test execution reports and validation

**Dependencies:** Phase 6 must be completed

**Note:** Single document phase (no separate checklist)

**Final Step:** Project completion

---

## Notes

- Each phase requires explicit approval before moving forward
- Checklists ensure all requirements for that phase are met
- Sharable documents serve as reference and communication tools
- Implementation and verification are single-document phases
- This roadmap will be updated as progress is made
