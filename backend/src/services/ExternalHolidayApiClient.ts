/**
 * ExternalHolidayApiClient
 *
 * Single Responsibility: Call openholidaysapi.org with retry logic
 * Handles all communication with external holiday data provider
 * API Docs: https://www.openholidaysapi.org/
 */

import axios, { AxiosError } from 'axios';
import type { RegularHoliday } from '../types/index.js';

/**
 * Response types from openholidaysapi.org PublicHolidays endpoint
 */
interface OpenHolidaysApiName {
  language: string;
  text: string;
}

interface OpenHolidaysApiSubdivision {
  code: string;
  shortName: string;
}

interface OpenHolidaysApiHoliday {
  id: string;
  startDate: string;
  endDate: string;
  type: string; // "Public", "Observance", etc.
  name: OpenHolidaysApiName[];
  regionalScope: string;
  temporalScope: string;
  nationwide: boolean;
  subdivisions?: OpenHolidaysApiSubdivision[];
}

export class ExternalHolidayApiClient {
  private baseUrl: string;
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    multiplier: 2,
    maxDelay: 8000 // 8 seconds
  };

  constructor(baseUrl: string = 'https://openholidaysapi.org') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch holidays from openholidaysapi.org with retry logic
   * @param country ISO 3166-1 alpha-2 country code (e.g., 'US', 'DE')
   * @param year Year (1900-2100)
   * @param month Month (1-12)
   * @returns Array of RegularHoliday objects
   * @throws Error if all retries exhausted
   */
  async fetchHolidays(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
    return this.fetchWithRetry(() =>
      this.callExternalApi(country, year, month)
    );
  }

  /**
   * Make HTTP call to openholidaysapi.org PublicHolidays endpoint
   */
  private async callExternalApi(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
    try {
      // Calculate date range for the month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

      const url = `${this.baseUrl}/PublicHolidays`;

      const response = await axios.get<OpenHolidaysApiHoliday[]>(url, {
        params: {
          countryIsoCode: country.toUpperCase(),
          validFrom: startDate,
          validTo: endDate,
          languageIsoCode: 'EN'
        },
        timeout: 10000, // 10 second timeout
        httpsAgent: new (await import('https')).Agent({
          rejectUnauthorized: false
        }),
        headers: {
          'accept': 'text/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

      // Response is an array directly, not wrapped in a 'data' object
      return this.transformResponse(response.data, country);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.code || 'NETWORK_ERROR',
          error.message,
          error.response?.status
        );
      }
      throw error;
    }
  }

  /**
   * Transform openholidaysapi.org response to internal model
   */
  private transformResponse(
    holidays: OpenHolidaysApiHoliday[],
    country: string
  ): RegularHoliday[] {
    return holidays.map((holiday) => {
      // Get English name from the name array
      const englishName = holiday.name.find(n => n.language === 'EN')?.text ||
                          holiday.name[0]?.text ||
                          'Unknown Holiday';
      const sanitizedName = englishName.substring(0, 200);

      // Determine category from type
      const isNational = holiday.type === 'Public' && holiday.nationwide;
      const category = isNational ? 'national' : 'observance';

      // Get first subdivision code if available
      const region = holiday.subdivisions?.[0]?.code || null;

      return {
        id: holiday.id,
        name: sanitizedName,
        date: holiday.startDate,
        country: country.toUpperCase(),
        region: region,
        category: category as 'national' | 'observance',
        description: `${holiday.type}${holiday.regionalScope !== 'National' ? ` (${holiday.regionalScope})` : ''}`,
        isPublicHoliday: isNational
      };
    });
  }

  /**
   * Fetch with exponential backoff retry logic
   */
  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (
        attempt < this.retryConfig.maxRetries &&
        this.isRetryable(error)
      ) {
        const delay = Math.min(
          this.retryConfig.baseDelay *
            Math.pow(this.retryConfig.multiplier, attempt),
          this.retryConfig.maxDelay
        );

        console.log(
          `Retry attempt ${attempt + 1}/${this.retryConfig.maxRetries} after ${delay}ms`
        );

        await this.sleep(delay);
        return this.fetchWithRetry(fn, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Determine if error is retryable
   */
  private isRetryable(error: any): boolean {
    // Retryable: Network errors, timeouts, 5xx errors, 429
    if (error instanceof ApiError) {
      return (
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        error.code === 'ETIMEDOUT' ||
        error.statusCode === 429 ||
        (error.statusCode ?? 0) >= 500
      );
    }

    if (error instanceof AxiosError) {
      return (
        !error.response || // Network error
        error.code === 'ECONNABORTED' ||
        error.code === 'ETIMEDOUT' ||
        error.response?.status === 429 ||
        (error.response?.status ?? 0) >= 500
      );
    }

    return false;
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
