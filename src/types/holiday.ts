/**
 * Core domain types for the calendar application
 * These types represent the business entities used throughout the application
 */

/**
 * Represents a regular (government) holiday
 */
export interface RegularHoliday {
  id: string
  name: string
  date: string // ISO 8601 format (YYYY-MM-DD)
  country: string // ISO 3166-1 alpha-2 code (e.g., "US", "IN")
  region?: string // Optional region/state code
  category: string // e.g., "national", "state", "religious"
  description?: string
  isPublicHoliday: boolean
}

/**
 * Represents a work-specific holiday (mocked data)
 */
export interface WorkHoliday {
  id: string
  name: string
  date: string // ISO 8601 format (YYYY-MM-DD)
  department?: string // Which department (optional)
  description?: string // Why this day is a work holiday
  category?: string // e.g., "company", "team"
}

/**
 * Union type for any holiday
 */
export type Holiday = RegularHoliday | WorkHoliday

/**
 * Represents holidays for a specific day
 */
export interface DayHolidays {
  date: string // ISO 8601 format (YYYY-MM-DD)
  regularHolidays: RegularHoliday[]
  workHolidays: WorkHoliday[]
  primaryType: 'work' | 'regular' | null // Which type takes visual priority
}

/**
 * Represents holidays for a specific week
 */
export interface WeekHolidays {
  weekNumber: number
  startDate: string // ISO 8601 format
  endDate: string // ISO 8601 format
  workHolidayCount: number // Count of work holidays in this week
  days: DayHolidays[]
}

/**
 * Represents holidays for a specific month
 */
export interface MonthHolidays {
  year: number
  month: number // 1-12
  weeks: WeekHolidays[]
  totalWorkHolidays: number
  totalRegularHolidays: number
}

/**
 * Represents the state of holiday data (for loading/error states)
 */
export interface HolidayDataState {
  loading: boolean
  error: HolidayError | null
  lastFetchedAt: number | null // Timestamp of last successful fetch
}

/**
 * Represents holiday-related errors
 */
export interface HolidayError {
  code: string // e.g., "NETWORK_ERROR", "INVALID_API_KEY"
  message: string // User-friendly error message
  details?: unknown // Additional error details for debugging
  retryable: boolean // Whether the user can retry this operation
}
