/**
 * API-specific types for external holiday data
 */

/**
 * Response from external holiday API
 */
export interface ApiHolidayResponse {
  date: string // ISO 8601 format
  name: string
  country: {
    id: string
    name: string
  }
  description?: string
  type: string[] // e.g., ["National holiday"], ["Observance"]
}

/**
 * Wrapper for API response
 */
export interface ApiResponse<T> {
  status: number
  response?: {
    holidays: T[]
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  cacheKey: string
  year: number
  month: number
  data: T
  timestamp: number // When cached
  ttl: number // Time-to-live in milliseconds
}
