import { InMemoryCacheStore, ICacheStore } from './cache/CacheStore.js';
import { HolidayDataProvider } from './HolidayDataProvider.js';
import { RegularHoliday } from '../types/index.js';

/**
 * HolidayService
 *
 * Orchestration service that coordinates caching and data provider calls.
 * Supports 3 data sources: file, mock, api (based on HOLIDAY_SOURCE env var)
 * Follows Single Responsibility Principle - only handles coordination, not implementation details.
 */
export class HolidayService {
  private cache: ICacheStore;
  private dataProvider: HolidayDataProvider;

  constructor(
    cache?: ICacheStore,
    dataProvider?: HolidayDataProvider
  ) {
    this.cache = cache || new InMemoryCacheStore();
    this.dataProvider = dataProvider || new HolidayDataProvider();
  }

  /**
   * Fetch holidays for a specific country, year, and month
   * Uses cache-first strategy with 30-day TTL
   */
  async fetchHolidays(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
    const cacheKey = this.generateCacheKey(country, year, month);

    console.log(`[HolidayService] Fetching holidays for ${country} ${year}-${month}`);

    // Check cache first
    const cached = this.cache.get<RegularHoliday[]>(cacheKey);
    if (cached) {
      console.log(`[HolidayService] Cache hit for ${cacheKey} (${cached.length} holidays)`);
      return cached;
    }

    console.log(`[HolidayService] Cache miss for ${cacheKey}, calling data provider`);

    // Fetch from data provider (respects HOLIDAY_SOURCE env var)
    const holidays = await this.dataProvider.getHolidays(country, year, month);

    // Cache the result
    this.cache.set(cacheKey, holidays);
    console.log(`[HolidayService] Cached ${holidays.length} holidays for ${cacheKey}`);

    return holidays;
  }

  /**
   * Fetch holidays for multiple months in parallel
   */
  async fetchHolidaysForMonths(
    country: string,
    year: number,
    months: number[]
  ): Promise<Map<string, RegularHoliday[]>> {
    console.log(`[HolidayService] Fetching holidays for ${country} ${year}, months: ${months.join(', ')}`);

    // Fetch all months in parallel
    const promises = months.map(month =>
      this.fetchHolidays(country, year, month)
    );

    const results = await Promise.all(promises);

    // Group by month
    const byMonth = new Map<string, RegularHoliday[]>();
    months.forEach((month, index) => {
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      byMonth.set(monthKey, results[index]);
    });

    console.log(`[HolidayService] Fetched holidays for ${results.length} months`);
    return byMonth;
  }

  /**
   * Clear cache for specific country/year/month
   */
  clearCache(country: string, year: number, month: number): void {
    const cacheKey = this.generateCacheKey(country, year, month);
    this.cache.delete(cacheKey);
    console.log(`[HolidayService] Cleared cache for ${cacheKey}`);
  }

  /**
   * Clear all cache entries
   */
  clearAllCache(): void {
    this.cache.clear();
    console.log('[HolidayService] Cleared all cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; ttlMs: number } {
    const size = this.cache.size();
    const ttlMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    return { size, ttlMs };
  }

  /**
   * Generate cache key for holidays
   */
  private generateCacheKey(country: string, year: number, month: number): string {
    return `holidays:${country.toUpperCase()}:${year}:${month}`;
  }
}