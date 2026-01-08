/**
 * Holiday Utilities
 * 
 * Helper functions for working with holidays, dates, and weekends
 */

import type { RegularHoliday, WorkHoliday } from './holiday.js'

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param dateString ISO 8601 date string (YYYY-MM-DD)
 * @returns true if date falls on Saturday (6) or Sunday (0)
 */
export function isWeekend(dateString: string): boolean {
  const date = new Date(`${dateString}T00:00:00Z`)
  const dayOfWeek = date.getUTCDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // 0 = Sunday, 6 = Saturday
}

/**
 * Check if a date is a weekday (Monday-Friday)
 * @param dateString ISO 8601 date string (YYYY-MM-DD)
 * @returns true if date falls on Monday-Friday
 */
export function isWeekday(dateString: string): boolean {
  return !isWeekend(dateString)
}

/**
 * Get day of week name from date
 * @param dateString ISO 8601 date string (YYYY-MM-DD)
 * @returns Day name (Monday, Tuesday, etc.)
 */
export function getDayName(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00Z`)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getUTCDay()]
}

/**
 * Get week number from date
 * @param dateString ISO 8601 date string (YYYY-MM-DD)
 * @returns Week number (1-53)
 */
export function getWeekNumber(dateString: string): number {
  const date = new Date(`${dateString}T00:00:00Z`)
  const firstDay = new Date(date.getUTCFullYear(), 0, 1)
  const lastday = date.getTime() - firstDay.getTime()
  const day = 1000 * 60 * 60 * 24
  return Math.ceil((lastday / day + firstDay.getUTCDay() + 1) / 7)
}

/**
 * Enriches holidays with weekend information
 * @param holidays Array of holidays
 * @returns Holidays with isWeekend property set
 */
export function enrichHolidaysWithWeekendInfo<T extends { date: string }>(
  holidays: T[]
): Array<T & { isWeekend: boolean }> {
  return holidays.map((holiday) => ({
    ...holiday,
    isWeekend: isWeekend(holiday.date)
  }))
}

/**
 * Filter holidays by type
 */
export function filterRegularHolidays(holidays: (RegularHoliday | WorkHoliday)[]): RegularHoliday[] {
  return holidays.filter((h) => 'country' in h) as RegularHoliday[]
}

export function filterWorkHolidays(holidays: (RegularHoliday | WorkHoliday)[]): WorkHoliday[] {
  return holidays.filter((h) => 'department' in h || !('country' in h)) as WorkHoliday[]
}

/**
 * Group holidays by date
 */
export function groupHolidaysByDate(
  holidays: (RegularHoliday | WorkHoliday)[]
): Map<string, (RegularHoliday | WorkHoliday)[]> {
  const grouped = new Map<string, (RegularHoliday | WorkHoliday)[]>()

  for (const holiday of holidays) {
    const date = holiday.date
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(holiday)
  }

  return grouped
}

/**
 * Get public vs work holidays summary for a date range
 */
export function getHolidaySummary(
  regularHolidays: RegularHoliday[],
  workHolidays: WorkHoliday[],
  startDate: string,
  endDate: string
): {
  totalRegular: number
  totalWork: number
  regularOnWeekends: number
  workOnWeekends: number
  regularOnWeekdays: number
  workOnWeekdays: number
} {
  const regularInRange = regularHolidays.filter(
    (h) => h.date >= startDate && h.date <= endDate
  )
  const workInRange = workHolidays.filter(
    (h) => h.date >= startDate && h.date <= endDate
  )

  return {
    totalRegular: regularInRange.length,
    totalWork: workInRange.length,
    regularOnWeekends: regularInRange.filter((h) => isWeekend(h.date)).length,
    workOnWeekends: workInRange.filter((h) => isWeekend(h.date)).length,
    regularOnWeekdays: regularInRange.filter((h) => isWeekday(h.date)).length,
    workOnWeekdays: workInRange.filter((h) => isWeekday(h.date)).length
  }
}

/**
 * Format date to readable string
 * @param dateString ISO 8601 date string (YYYY-MM-DD)
 * @returns Formatted string like "Monday, January 26, 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00Z`)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateString === today
}

/**
 * Check if date is in the past
 */
export function isPast(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateString < today
}

/**
 * Check if date is in the future
 */
export function isFuture(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateString > today
}
