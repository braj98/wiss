import axios from 'axios';

export class ApiError extends Error {
  constructor(message, statusCode, isRetryable = false) {
    super(message);
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    this.name = 'ApiError';
  }
}

export class ExternalHolidayApiClient {
  constructor() {
    this.baseUrl = 'https://api.holidayapi.com/v1/holidays';
    this.timeoutMs = 5000;
    this.maxRetries = 3;
    this.baseDelayMs = 1000;
    this.maxDelayMs = 8000;
  }

  async fetchHolidays(country, year, month) {
    console.log(`[ExternalHolidayApiClient] Fetching holidays for ${country} ${year}-${month}`);
    try {
      const holidays = await this.fetchWithRetry(() => this.callExternalApi(country, year, month), 0);
      console.log(`[ExternalHolidayApiClient] Successfully fetched ${holidays.length} holidays`);
      return holidays;
    } catch (error) {
      console.error('[ExternalHolidayApiClient] Failed to fetch holidays:', error);
      throw error;
    }
  }

  async callExternalApi(country, year, month) {
    const apiKey = process.env.HOLIDAY_API_KEY || 'demo';
    const url = `${this.baseUrl}?key=${apiKey}&country=${country}&year=${year}&month=${month}`;
    console.log(`[ExternalHolidayApiClient] Calling API: ${url.replace(apiKey, '***')}`);
    try {
      const response = await axios.get(url, {
        timeout: this.timeoutMs,
        headers: {
          'User-Agent': 'MyCalApp/1.0'
        }
      });
      return this.transformResponse(response.data.holidays || [], country);
    } catch (error) {
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

  transformResponse(holidays, country) {
    return holidays.map((holiday) => ({
      id: this.generateId(holiday, country),
      name: this.truncateName(holiday.name || 'Unknown Holiday'),
      date: holiday.date,
      country: country.toUpperCase(),
      region: null,
      category: this.determineCategory(holiday),
      description: holiday.description || holiday.name || 'Holiday',
      isPublicHoliday: holiday.type?.includes('public_holiday') || false
    }));
  }

  generateId(holiday, country) {
    const date = holiday.date;
    const name = holiday.name?.replace(/\s+/g, '_').toLowerCase() || 'unknown';
    return `ext_${country}_${date}_${name}`.substring(0, 100);
  }

  truncateName(name) {
    return name.length > 200 ? name.substring(0, 200) : name;
  }

  determineCategory(holiday) {
    if (holiday.type?.includes('public_holiday') || holiday.type?.includes('national')) {
      return 'national';
    }
    return 'observance';
  }

  async fetchWithRetry(fn, attempt) {
    try {
      return await fn();
    } catch (error) {
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