/**
 * Holiday Utils - Backend
 * 
 * Helper functions for working with dates and weekends
 */

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
