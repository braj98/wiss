/**
 * HolidayService
 * 
 * Coordinates holiday data fetching with caching
 * Supports 3 data sources: file, mock, or API (configured via HOLIDAY_SOURCE env)
 * Single Responsibility: Holiday data orchestration
 */

import { HolidayDataProvider } from './HolidayDataProvider.js';
import { ICacheStore, InMemoryCacheStore } from './cache/CacheStore.js';
import type { RegularHoliday } from '../types/index.js';

export class HolidayService {
  private dataProvider: HolidayDataProvider;
  private cache: ICacheStore;
  private readonly cacheTtlMs = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(
    dataProvider?: HolidayDataProvider,
    cache?: ICacheStore
  ) {
    this.dataProvider = dataProvider || new HolidayDataProvider();
    this.cache = cache || new InMemoryCacheStore();
  }

  /**
   * Fetch holidays with caching
   * @param country ISO country code
   * @param year Year (1900-2100)
   * @param month Month (1-12)
   * @returns Array of RegularHoliday objects
   */
  async fetchHolidays(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
    // Generate cache key
    const cacheKey = this.getCacheKey(country, year, month);

    // Check cache first
    const cached = this.cache.get<RegularHoliday[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Fetch from data provider (file/mock/api based on HOLIDAY_SOURCE env)
    const holidays = await this.dataProvider.getHolidays(country, year, month);

    // Store in cache
    this.cache.set(cacheKey, holidays, this.cacheTtlMs);

    return holidays;
  }

  /**
   * Fetch holidays for multiple months with caching
   * @param country ISO country code
   * @param year Year
   * @param months Array of months (1-12)
   * @returns Map of holidays keyed by date
   */
  async fetchHolidaysForMonths(
    country: string,
    year: number,
    months: number[]
  ): Promise<Map<string, RegularHoliday[]>> {

    // Fetch all months (parallel)
    const promises = months.map((month) =>
      this.fetchHolidays(country, year, month)
    );

    const allHolidays = await Promise.all(promises);

    // Group by date
    const byDate = new Map<string, RegularHoliday[]>();

    for (const holidays of allHolidays) {
      for (const holiday of holidays) {
        const date = holiday.date;
        if (!byDate.has(date)) {
          byDate.set(date, []);
        }
        byDate.get(date)!.push(holiday);
      }
    }

    return byDate;
  }

  /**
   * Clear cache for specific country/year/month
   */
  clearCache(country: string, year: number, month: number): void {
    const cacheKey = this.getCacheKey(country, year, month);
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; ttlMs: number } {
    return {
      size: this.cache.size(),
      ttlMs: this.cacheTtlMs
    };
  }

  /**
   * Generate cache key
   */
  private getCacheKey(country: string, year: number, month: number): string {
    return `holidays:${country.toUpperCase()}:${year}:${month.toString().padStart(2, '0')}`;
  }
}
