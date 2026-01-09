import { CacheStore } from './cache.js';
import { HolidayDataProvider } from './HolidayDataProvider.js';

/**
 * HolidayService
 *
 * Service for fetching and caching holiday data
 * Implements caching with TTL and provides methods for fetching holidays
 */
export class HolidayService {
  constructor(cache) {
    this.cache = cache || new CacheStore(30 * 24 * 60 * 1000); // 30 days TTL
    this.dataProvider = new HolidayDataProvider();
  }

  /**
   * Fetch holidays for a specific country, year, and month
   */
  async fetchHolidays(country, year, month) {
    console.log(`[HolidayService] Fetching holidays for ${country} ${year}-${month}`);
    
    try {
      const holidays = await this.dataProvider.getHolidays(country, year, month);
      console.log(`[HolidayService] Successfully fetched ${holidays.length} holidays for ${country} ${year}-${month}`);
      return holidays;
    } catch (error) {
      console.error('[HolidayService] Error fetching holidays:', error);
      throw error;
    }
  }

  /**
   * Fetch holidays for multiple months with caching
   */
  async fetchHolidaysForMonths(country, year, months) {
    // Fetch all months (parallel)
    const promises = months.map((month) =>
      this.fetchHolidays(country, year, month)
    );

    const allHolidays = await Promise.all(promises);

    // Group by date
    const byDate = new Map();

    for (const holidays of allHolidays) {
      for (const holiday of holidays) {
        const date = holiday.date;
        if (!byDate.has(date)) {
          byDate.set(date, []);
        }
        byDate.get(date).push(holiday);
      }
    }

    return byDate;
  }

  /**
   * Clear cache for specific country/year/month
   */
  clearCache(country, year, month) {
    const cacheKey = this.getCacheKey(country, year, month);
    this.cache.delete(cacheKey);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Generate cache key
   */
  getCacheKey(country, year, month) {
    return `${country}-${year}-${month}`;
  }
}
