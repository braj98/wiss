import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RegularHoliday } from '../types/index.js';
import { ExternalHolidayApiClient } from './ExternalHolidayApiClient.js';

// Mock holidays data (fallback when API fails and file doesn't have country)
const MOCK_HOLIDAYS: RegularHoliday[] = [
  {
    id: 'mock_1',
    name: "New Year's Day",
    date: '2025-01-01',
    country: 'GLOBAL',
    region: null,
    category: 'national',
    description: 'First day of the year',
    isPublicHoliday: true
  },
  {
    id: 'mock_2',
    name: 'Christmas Day',
    date: '2025-12-25',
    country: 'GLOBAL',
    region: null,
    category: 'national',
    description: 'Christmas Celebration',
    isPublicHoliday: true
  }
];

// Indian holidays for demo (additional to file data)
const INDIAN_HOLIDAYS: RegularHoliday[] = [
  {
    id: 'ind_1',
    name: 'Republic Day',
    date: '2025-01-26',
    country: 'IN',
    region: null,
    category: 'national',
    description: 'National Holiday - Celebrating Indian Constitution',
    isPublicHoliday: true
  },
  {
    id: 'ind_2',
    name: 'Independence Day',
    date: '2025-08-15',
    country: 'IN',
    region: null,
    category: 'national',
    description: 'National Holiday - Celebrating Independence',
    isPublicHoliday: true
  },
  {
    id: 'ind_3',
    name: 'Gandhi Jayanti',
    date: '2025-10-02',
    country: 'IN',
    region: null,
    category: 'national',
    description: 'National Holiday - Birth Anniversary of Mahatma Gandhi',
    isPublicHoliday: true
  },
  {
    id: 'ind_4',
    name: 'Diwali',
    date: '2025-10-21',
    country: 'IN',
    region: null,
    category: 'national',
    description: 'Festival of Lights',
    isPublicHoliday: true
  },
  {
    id: 'ind_5',
    name: 'Holi',
    date: '2025-03-14',
    country: 'IN',
    region: null,
    category: 'religious',
    description: 'Festival of Colors',
    isPublicHoliday: false
  },
  {
    id: 'ind_6',
    name: 'Christmas',
    date: '2025-12-25',
    country: 'IN',
    region: null,
    category: 'religious',
    description: 'Christmas Celebration',
    isPublicHoliday: false
  }
];

/**
 * HolidayDataProvider
 *
 * Provides holiday data from multiple sources based on HOLIDAY_SOURCE environment variable.
 * Supports 3 modes: 'file', 'mock', 'api'
 */
export class HolidayDataProvider {
  private source: string;
  private fileCache: any = null;
  private apiClient: ExternalHolidayApiClient;

  constructor() {
    this.source = this.getHolidaySource();
    this.apiClient = new ExternalHolidayApiClient();
    console.log(`[HolidayDataProvider] Using source: ${this.source}`);
  }

  /**
   * Get holidays for a country, year, and month
   */
  async getHolidays(country: string, year: number, month: number): Promise<RegularHoliday[]> {
    switch (this.source) {
      case 'file':
        return this.getHolidaysFromFile(country, year, month);
      case 'mock':
        return this.getHolidaysFromMock(country, year, month);
      case 'api':
        return this.getHolidaysFromApi(country, year, month);
      default:
        return this.getHolidaysFromFile(country, year, month);
    }
  }

  /**
   * Get holidays from JSON file
   */
  private async getHolidaysFromFile(country: string, year: number, month: number): Promise<RegularHoliday[]> {
    try {
      // Load file if not cached
      if (!this.fileCache) {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.resolve(__dirname, '../../data/holidays.json');

        console.log(`[HolidayDataProvider] Loading holidays from file: ${filePath}`);
        console.log(`[HolidayDataProvider] __dirname: ${__dirname}`);
        console.log(`[HolidayDataProvider] File exists: ${fs.existsSync(filePath)}`);

        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          this.fileCache = JSON.parse(fileContent);
          console.log(`[HolidayDataProvider] File loaded successfully.`);
        } else {
          console.warn(`[HolidayDataProvider] File not found: ${filePath}`);
          throw new Error(`Holiday data file not found: ${filePath}`);
        }
      }

      // Find the correct year key (e.g., "IN_2025" for country IN and year 2025)
      const yearKey = `${country}_${year}`;
      const countryHolidays = this.fileCache?.countries?.[yearKey] || [];

      console.log(`[HolidayDataProvider] Found ${countryHolidays.length} holidays for ${yearKey} in ${year}-${month}`);

      // Filter by month
      const filteredHolidays = countryHolidays.filter((holiday: RegularHoliday) => {
        const holidayMonth = parseInt(holiday.date.split('-')[1]);
        const matches = holidayMonth === month;
        return matches;
      });

      console.log(`[HolidayDataProvider] Returning ${filteredHolidays.length} filtered holidays for ${country} ${year}-${month}`);
      return filteredHolidays;
    } catch (error) {
      console.error('[HolidayDataProvider] Error reading file:', error);
      console.warn('[HolidayDataProvider] Falling back to mock data due to file error');
      return this.getHolidaysFromMock(country, year, month);
    }
  }

  /**
   * Get holidays from mock data
   */
  private getHolidaysFromMock(country: string, _year: number, month: number): RegularHoliday[] {
    let holidays: RegularHoliday[] = [];

    if (country === 'IN') {
      holidays = INDIAN_HOLIDAYS;
    } else {
      // For other countries, use generic mock holidays
      holidays = MOCK_HOLIDAYS.map(h => ({ ...h, country }));
    }

    return holidays.filter((holiday) => {
      const holidayMonth = parseInt(holiday.date.split('-')[1]);
      return holidayMonth === month;
    });
  }

  /**
   * Get holidays from external API
   */
  private async getHolidaysFromApi(country: string, year: number, month: number): Promise<RegularHoliday[]> {
    try {
      return await this.apiClient.fetchHolidays(country, year, month);
    } catch (error) {
      console.warn('[HolidayDataProvider] API error, falling back to mock:', error);
      return this.getHolidaysFromMock(country, year, month);
    }
  }

  /**
   * Get current source
   */
  getSource(): string {
    return this.source;
  }

  /**
   * Check if a valid API key is configured
   */
  hasValidApiKey(): boolean {
    const apiKey = process.env.HOLIDAY_API_KEY;
    return apiKey !== undefined && apiKey !== 'demo' && apiKey !== '';
  }

  /**
   * Get holiday source from environment
   */
  private getHolidaySource(): string {
    const source = process.env.HOLIDAY_SOURCE?.toLowerCase();
    if (source === 'file' || source === 'mock' || source === 'api') {
      return source;
    }
    return 'file'; // Default to file for demo
  }
}