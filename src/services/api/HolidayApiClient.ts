/**
 * Holiday API Client
 * 
 * Handles all communication with the backend holiday APIs
 * Single Responsibility: HTTP requests to backend
 */

import type { RegularHoliday, WorkHoliday, HolidayError } from '../../types/holiday.js';
import type { ApiResponse } from '../../types/api.js';

interface ApiError {
  code?: string;
  message?: string;
}

export interface FetchHolidaysParams {
  country: string;
  year: number;
  month: number;
}

export interface FetchHolidaysByRangeParams {
  country: string;
  year: number;
  startMonth: number;
  endMonth: number;
}

export interface FetchWorkHolidaysParams {
  year: number;
  month: number;
  department?: string;
}

export interface FetchWorkHolidaysByDateParams {
  date: string; // YYYY-MM-DD format
  department?: string;
}

export interface FetchWorkHolidaysByRangeParams {
  year: number;
  startMonth: number;
  endMonth: number;
  department?: string;
}

export class HolidayApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(
    baseUrl: string = (import.meta as any).env?.VITE_API_BASE_URL || '',
    timeout: number = 10000
  ) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Fetch regular holidays for a specific month
   */
  async fetchHolidays(params: FetchHolidaysParams): Promise<RegularHoliday[]> {
    const queryString = new URLSearchParams({
      country: params.country,
      year: params.year.toString(),
      month: params.month.toString()
    }).toString();

    const response = await this.get<{
      data: RegularHoliday[];
      meta: Record<string, any>;
    }>(`/api/holidays?${queryString}`);

    return response.data;
  }

  /**
   * Fetch regular holidays for a date range
   */
  async fetchHolidaysByRange(
    params: FetchHolidaysByRangeParams
  ): Promise<Record<string, RegularHoliday[]>> {
    const queryString = new URLSearchParams({
      country: params.country,
      year: params.year.toString(),
      startMonth: params.startMonth.toString(),
      endMonth: params.endMonth.toString()
    }).toString();

    console.log('Fetching regular holidays for range:', `/api/holidays/by-range?${queryString}`);

    const response = await this.get<{
      data: Record<string, RegularHoliday[]>;
      meta: Record<string, any>;
    }>(`/api/holidays/by-range?${queryString}`);

    console.log('Regular holidays response:', response);

    // Transform the response from date-keyed to month-keyed
    const result: Record<string, RegularHoliday[]> = {};

    Object.entries(response.data).forEach(([dateKey, holidays]) => {
      // dateKey is like "2026-01-01", extract month as "2026-01"
      const monthKey = dateKey.substring(0, 7); // "2026-01"
      if (!result[monthKey]) {
        result[monthKey] = [];
      }
      result[monthKey].push(...holidays);
    });

    console.log('Transformed regular holidays:', result);

    return result;
  }

  /**
   * Fetch work holidays for a specific month
   */
  async fetchWorkHolidays(params: FetchWorkHolidaysParams): Promise<WorkHoliday[]> {
    const queryParams: Record<string, string> = {
      year: params.year.toString(),
      month: params.month.toString()
    };

    if (params.department) {
      queryParams.department = params.department;
    }

    const queryString = new URLSearchParams(queryParams).toString();

    const response = await this.get<{
      data: WorkHoliday[];
      meta: Record<string, any>;
    }>(`/api/work-holidays?${queryString}`);

    return response.data;
  }

  /**
   * Fetch work holidays for a specific date
   */
  async fetchWorkHolidaysByDate(
    params: FetchWorkHolidaysByDateParams
  ): Promise<WorkHoliday[]> {
    const queryParams: Record<string, string> = {
      date: params.date
    };

    if (params.department) {
      queryParams.department = params.department;
    }

    const queryString = new URLSearchParams(queryParams).toString();

    const response = await this.get<{
      data: WorkHoliday[];
      meta: Record<string, any>;
    }>(`/api/work-holidays/by-date?${queryString}`);

    return response.data;
  }

  /**
   * Fetch work holidays for a date range
   */
  async fetchWorkHolidaysByRange(
    params: FetchWorkHolidaysByRangeParams
  ): Promise<Record<string, WorkHoliday[]>> {
    const queryParams: Record<string, string> = {
      year: params.year.toString(),
      startMonth: params.startMonth.toString(),
      endMonth: params.endMonth.toString()
    };

    if (params.department) {
      queryParams.department = params.department;
    }

    const queryString = new URLSearchParams(queryParams).toString();

    const response = await this.get<{
      data: Record<string, WorkHoliday[]>;
      meta: Record<string, any>;
    }>(`/api/work-holidays/by-range?${queryString}`);

    return response.data;
  }

  /**
   * Fetch available work holiday departments
   */
  async fetchWorkHolidayDepartments(): Promise<string[]> {
    const response = await this.get<{
      data: string[];
      meta: Record<string, any>;
    }>('/api/work-holidays/departments');

    return response.data;
  }

  /**
   * Generic GET request handler
   */
  private async get<T>(
    endpoint: string
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({})) as ApiError;
        throw new ApiClientError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error.code || 'UNKNOWN_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiClientError(
          'Network error: Unable to connect to API',
          0,
          'NETWORK_ERROR'
        );
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiClientError(
          `Request timeout after ${this.timeout}ms`,
          0,
          'TIMEOUT_ERROR'
        );
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        'UNKNOWN_ERROR'
      );
    }
  }
}

/**
 * Custom error class for API client errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// Export singleton instance
export const holidayApiClient = new HolidayApiClient();
