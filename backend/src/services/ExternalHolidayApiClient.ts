import axios, { AxiosResponse } from 'axios';
import { RegularHoliday, ExternalApiHoliday } from '../types/index.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * ExternalHolidayApiClient
 *
 * Service for fetching holiday data from external APIs with intelligent retry logic.
 * Follows Single Responsibility Principle - only handles external API communication.
 */
export class ExternalHolidayApiClient {
  private readonly baseUrl = 'https://api.holidayapi.com/v1/holidays';
  private readonly timeoutMs = 5000; // 5 seconds
  private readonly maxRetries = 3;
  private readonly baseDelayMs = 1000; // 1 second
  private readonly maxDelayMs = 8000; // 8 seconds

  constructor() {
    // Constructor can accept config if needed in future
  }

  /**
   * Fetch holidays for a specific country, year, and month
   */
  public async fetchHolidays(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
    console.log(`[ExternalHolidayApiClient] Fetching holidays for ${country} ${year}-${month}`);

    try {
      const holidays = await this.fetchWithRetry(
        () => this.callExternalApi(country, year, month),
        0
      );

      console.log(`[ExternalHolidayApiClient] Successfully fetched ${holidays.length} holidays`);
      return holidays;
    } catch (error) {
      console.error('[ExternalHolidayApiClient] Failed to fetch holidays:', error);
      throw error;
    }
  }

  /**
   * Make HTTP request to external holiday API
   */
  private async callExternalApi(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
    const apiKey = process.env.HOLIDAY_API_KEY || 'demo';
    const url = `${this.baseUrl}?key=${apiKey}&country=${country}&year=${year}&month=${month}`;

    console.log(`[ExternalHolidayApiClient] Calling API: ${url.replace(apiKey, '***')}`);

    try {
      const response: AxiosResponse = await axios.get(url, {
        timeout: this.timeoutMs,
        headers: {
          'User-Agent': 'MyCalApp/1.0'
        }
      });

      return this.transformResponse(response.data.holidays || [], country);
    } catch (error: any) {
      console.error('[ExternalHolidayApiClient] API call failed:', error.message);

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new ApiError('Request timeout', undefined, true);
      }

      if (error.response) {
        const status = error.response.status;
        if (status === 429 || (status >= 500 && status < 600)) {
          throw new ApiError(`HTTP ${status}`, status, true);
        } else {
          throw new ApiError(`HTTP ${status}`, status, false);
        }
      }

      throw new ApiError('Network error', undefined, true);
    }
  }

  /**
   * Transform external API response to internal RegularHoliday format
   */
  private transformResponse(
    holidays: ExternalApiHoliday[],
    country: string
  ): RegularHoliday[] {
    return holidays.map((holiday) => ({
      id: this.generateId(holiday, country),
      name: this.truncateName(holiday.name || 'Unknown Holiday'),
      date: holiday.date,
      country: country.toUpperCase(),
      region: null, // External API doesn't provide regions
      category: this.determineCategory(holiday),
      description: holiday.description || holiday.name || 'Holiday',
      isPublicHoliday: holiday.type?.includes('public_holiday') || false
    }));
  }

  /**
   * Generate unique ID for holiday
   */
  private generateId(holiday: ExternalApiHoliday, country: string): string {
    const date = holiday.date;
    const name = holiday.name?.replace(/\s+/g, '_').toLowerCase() || 'unknown';
    return `ext_${country}_${date}_${name}`.substring(0, 100);
  }

  /**
   * Truncate holiday names to 200 characters
   */
  private truncateName(name: string): string {
    return name.length > 200 ? name.substring(0, 200) : name;
  }

  /**
   * Determine holiday category from external API data
   */
  private determineCategory(holiday: ExternalApiHoliday): 'national' | 'observance' {
    if (holiday.type?.includes('public_holiday') || holiday.type?.includes('national')) {
      return 'national';
    }
    return 'observance';
  }

  /**
   * Recursive retry logic with exponential backoff
   */
  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    attempt: number
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error instanceof ApiError ? error.isRetryable : false;

      if (!isRetryable || attempt >= this.maxRetries) {
        console.log(`[ExternalHolidayApiClient] Not retrying (attempt ${attempt + 1}):`, error.message);
        throw error;
      }

      const delay = Math.min(this.baseDelayMs * Math.pow(2, attempt), this.maxDelayMs);
      console.log(`[ExternalHolidayApiClient] Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries + 1})`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.fetchWithRetry(fn, attempt + 1);
    }
  }
}