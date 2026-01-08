/**
 * HolidayDataProvider
 * 
 * Provides holidays from 3 possible sources:
 * 1. 'file' - Read from data/holidays.json
 * 2. 'mock' - Use hardcoded mock data
 * 3. 'api' - Call external HolidayAPI (requires valid API key)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { RegularHoliday } from '../types/index.js';

type HolidaySource = 'file' | 'mock' | 'api';

// Get source from environment or default to 'file'
const getHolidaySource = (): HolidaySource => {
  const source = process.env.HOLIDAY_SOURCE?.toLowerCase();
  if (source === 'file' || source === 'mock' || source === 'api') {
    return source;
  }
  return 'file'; // Default to file for demo
};

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

// Indian holidays for demo
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
    category: 'national',
    description: 'Festival of Colors',
    isPublicHoliday: true
  },
  {
    id: 'ind_6',
    name: 'Christmas',
    date: '2025-12-25',
    country: 'IN',
    region: null,
    category: 'national',
    description: 'Christmas Celebration',
    isPublicHoliday: true
  }
];

interface HolidaysData {
  countries: {
    [countryCode: string]: RegularHoliday[];
  };
}

export class HolidayDataProvider {
  private source: HolidaySource;
  private fileCache: HolidaysData | null = null;

  constructor() {
    this.source = getHolidaySource();
    console.log(`[HolidayDataProvider] Using source: ${this.source}`);
  }

  /**
   * Get holidays for a country, year, and month
   */
  async getHolidays(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
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
  private async getHolidaysFromFile(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
    try {
      // Load file if not cached
      if (!this.fileCache) {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.resolve(__dirname, '../../data/holidays.json');
        
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          this.fileCache = JSON.parse(fileContent);
        }
      }

      const countryHolidays = this.fileCache?.countries?.[country] || [];

      // Filter by year and month
      return countryHolidays.filter((h: RegularHoliday) => {
        const [hYear, hMonth] = h.date.split('-').map(Number);
        return hYear === year && hMonth === month;
      });
    } catch (error) {
      console.warn('[HolidayDataProvider] Error reading file, falling back to mock:', error);
      return this.getHolidaysFromMock(country, year, month);
    }
  }

  /**
   * Get holidays from mock data
   */
  private getHolidaysFromMock(
    country: string,
    year: number,
    month: number
  ): RegularHoliday[] {
    let holidays: RegularHoliday[] = [];

    if (country === 'IN') {
      holidays = INDIAN_HOLIDAYS;
    } else {
      // For other countries, use generic mock holidays
      holidays = MOCK_HOLIDAYS.map(h => ({ ...h, country }));
    }

    return holidays.filter((h) => {
      const [hYear, hMonth] = h.date.split('-').map(Number);
      return hYear === year && hMonth === month;
    });
  }

  /**
   * Get holidays from external API
   */
  private async getHolidaysFromApi(
    country: string,
    year: number,
    month: number
  ): Promise<RegularHoliday[]> {
    const { ExternalHolidayApiClient } = await import('./ExternalHolidayApiClient.js');
    const client = new ExternalHolidayApiClient();
    
    try {
      return await client.fetchHolidays(country, year, month);
    } catch (error) {
      console.warn('[HolidayDataProvider] API error, falling back to mock:', error);
      return this.getHolidaysFromMock(country, year, month);
    }
  }

  /**
   * Get current source
   */
  getSource(): HolidaySource {
    return this.source;
  }

  /**
   * Check if a valid API key is configured
   */
  hasValidApiKey(): boolean {
    const apiKey = process.env.HOLIDAY_API_KEY;
    return apiKey !== undefined && apiKey !== 'demo' && apiKey !== '';
  }
}

// Export singleton instance
export const holidayDataProvider = new HolidayDataProvider();
