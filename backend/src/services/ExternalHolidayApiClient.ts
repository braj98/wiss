/**
 * ExternalHolidayApiClient
 * 
 * Single Responsibility: Call external holiday API with retry logic
 * Handles all communication with external holiday data provider
 */

import axios, { AxiosError } from 'axios';
import type { RegularHoliday } from '../types/index.js';

export interface ExternalApiHoliday {
  date: string;
  name: string;
  country?: { id: string; name: string };
  type?: string[];
  description?: string;
}

export interface ExternalApiResponse {
  status: number;
  response?: {
    holidays: ExternalApiHoliday[];
  };
}

export class ExternalHolidayApiClient {
  private baseUrl: string;
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    multiplier: 2,
    maxDelay: 8000 // 8 seconds
  };

  constructor(baseUrl: string = 'https://api.holidayapi.com/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch holidays from external API with retry logic
   * @param country ISO 3166-1 alpha-2 country code
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
   * Make HTTP call to external API
   */
  private async callExternalApi(
    country: string,
    year: number,
    month: string | number
  ): Promise<RegularHoliday[]> {
    try {
      const apiKey = process.env.HOLIDAY_API_KEY || 'demo';
      const url = `${this.baseUrl}/holidays`;
      
      const response = await axios.get<ExternalApiResponse>(url, {
        params: {
          country,
          year,
          month,
          key: apiKey
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

      if (!response.data.response?.holidays) {
        return [];
      }

      return this.transformResponse(
        response.data.response.holidays,
        country
      );
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
   * Transform external API response to internal model
   */
  private transformResponse(
    holidays: ExternalApiHoliday[],
    country: string
  ): RegularHoliday[] {
    return holidays.map((holiday) => {
      const sanitizedName = (holiday.name || '').substring(0, 200);
      const isPublic = holiday.type?.includes('National holiday') ?? false;
      const category = holiday.type?.includes('National holiday')
        ? 'national'
        : 'observance';

      return {
        id: `${country.toLowerCase()}_${sanitizedName.toLowerCase().replace(/\s+/g, '_')}_${holiday.date}`,
        name: sanitizedName,
        date: holiday.date,
        country,
        region: null,
        category: category as 'national' | 'observance',
        description: holiday.description || '',
        isPublicHoliday: isPublic
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
