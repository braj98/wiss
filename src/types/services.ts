/**
 * Service interfaces for dependency injection (Interface Segregation Principle)
 * These define contracts that implementations must fulfill
 */

import type { RegularHoliday, WorkHoliday } from './holiday'

/**
 * Interface for HTTP client operations
 * Handles low-level HTTP communication
 */
export interface IHttpClient {
  get<T>(url: string, options?: RequestInit): Promise<T>
  post<T>(url: string, data: unknown, options?: RequestInit): Promise<T>
}

/**
 * Interface for holiday API communication
 * Abstracts the specific API provider
 */
export interface IHolidayApiClient {
  fetchHolidays(country: string, year: number, month: number): Promise<RegularHoliday[]>
}

/**
 * Interface for cache operations
 * Abstracts storage mechanism (localStorage, memory, etc.)
 */
export interface ICache {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttlMs?: number): void
  remove(key: string): void
  clear(): void
  isValid(key: string): boolean
}

/**
 * Interface for work holiday data source
 */
export interface IWorkHolidayDataSource {
  getAllWorkHolidays(): Promise<WorkHoliday[]>
  getWorkHolidaysForMonth(year: number, month: number): Promise<WorkHoliday[]>
}

/**
 * Interface for holiday service (high-level orchestration)
 * Combines regular and work holidays with caching and error handling
 */
export interface IHolidayService {
  getHolidaysForMonth(country: string, year: number, month: number): Promise<{
    regularHolidays: RegularHoliday[]
    workHolidays: WorkHoliday[]
  }>
  clearCache(): void
}
