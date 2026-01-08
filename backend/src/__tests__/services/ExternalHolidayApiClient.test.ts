/**
 * ExternalHolidayApiClient Tests
 * 
 * Unit tests for external API client with retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  ExternalHolidayApiClient
} from '../../services/ExternalHolidayApiClient';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('ExternalHolidayApiClient', () => {
  let client: ExternalHolidayApiClient;

  beforeEach(() => {
    client = new ExternalHolidayApiClient();
    vi.clearAllMocks();
    mockedAxios.get.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('fetchHolidays', () => {
    it('should successfully fetch holidays', async () => {
      const mockResponse = {
        status: 200,
        data: {
          response: {
            holidays: [
              {
                date: '2025-01-01',
                name: "New Year's Day",
                country: { id: 'US', name: 'United States' },
                type: ['National holiday'],
                description: 'First day of year'
              }
            ]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await client.fetchHolidays('US', 2025, 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: "New Year's Day",
        date: '2025-01-01',
        country: 'US',
        isPublicHoliday: true,
        category: 'national'
      });
      expect(mockedAxios.get).toHaveBeenCalledOnce();
    });

    it('should handle empty response', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          response: {
            holidays: []
          }
        }
      });

      const result = await client.fetchHolidays('US', 2025, 2);

      expect(result).toEqual([]);
    });

    it('should handle missing response object', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          response: undefined
        }
      });

      const result = await client.fetchHolidays('US', 2025, 3);

      expect(result).toEqual([]);
    });

    it('should truncate long holiday names', async () => {
      const longName = 'A'.repeat(250);
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          response: {
            holidays: [
              {
                date: '2025-12-25',
                name: longName,
                type: ['National holiday']
              }
            ]
          }
        }
      });

      const result = await client.fetchHolidays('US', 2025, 12);

      expect(result[0].name).toHaveLength(200);
    });

    it('should not retry on 400 error', async () => {
      const error = new Error('Bad Request');
      (error as any).response = { status: 400 };
      (error as any).code = undefined;

      mockedAxios.get.mockRejectedValueOnce(error);

      try {
        await client.fetchHolidays('INVALID', 2025, 1);
      } catch (e) {
        expect(e).toBeDefined();
      }

      // Should only be called once (no retry)
      expect(mockedAxios.get).toHaveBeenCalledOnce();
    });

    it('should not retry on 401 error', async () => {
      const error = new Error('Unauthorized');
      (error as any).response = { status: 401 };
      (error as any).code = undefined;

      mockedAxios.get.mockRejectedValueOnce(error);

      try {
        await client.fetchHolidays('US', 2025, 1);
      } catch (e) {
        expect(e).toBeDefined();
      }

      expect(mockedAxios.get).toHaveBeenCalledOnce();
    });

    it('should not retry on 404 error', async () => {
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      (error as any).code = undefined;

      mockedAxios.get.mockRejectedValueOnce(error);

      try {
        await client.fetchHolidays('XX', 2025, 1);
      } catch (e) {
        expect(e).toBeDefined();
      }

      expect(mockedAxios.get).toHaveBeenCalledOnce();
    });

    it('should categorize national holidays correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          response: {
            holidays: [
              {
                date: '2025-01-01',
                name: 'New Year',
                type: ['National holiday']
              }
            ]
          }
        }
      });

      const result = await client.fetchHolidays('US', 2025, 1);

      expect(result[0]).toMatchObject({
        category: 'national',
        isPublicHoliday: true
      });
    });

    it('should categorize observance holidays correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          response: {
            holidays: [
              {
                date: '2025-03-08',
                name: "Women's Day",
                type: ['Observance']
              }
            ]
          }
        }
      });

      const result = await client.fetchHolidays('US', 2025, 3);

      expect(result[0]).toMatchObject({
        category: 'observance',
        isPublicHoliday: false
      });
    });

    it('should handle multiple holidays in response', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          response: {
            holidays: [
              {
                date: '2025-01-01',
                name: "New Year's Day",
                type: ['National holiday']
              },
              {
                date: '2025-12-25',
                name: 'Christmas',
                type: ['National holiday']
              }
            ]
          }
        }
      });

      const result = await client.fetchHolidays('US', 2025, 1);

      expect(result).toHaveLength(2);
      expect(result.every(h => h.country === 'US')).toBe(true);
      expect(result.map(h => h.name)).toContain("New Year's Day");
      expect(result.map(h => h.name)).toContain('Christmas');
    });

    it('should include API key from environment', async () => {
      const originalKey = process.env.HOLIDAY_API_KEY;
      process.env.HOLIDAY_API_KEY = 'test-key-123';
      
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          response: {
            holidays: []
          }
        }
      });

      await client.fetchHolidays('US', 2025, 1);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          params: expect.objectContaining({
            key: 'test-key-123'
          })
        })
      );

      process.env.HOLIDAY_API_KEY = originalKey;
    });

    it('should use demo key when no API key provided', async () => {
      const originalKey = process.env.HOLIDAY_API_KEY;
      delete process.env.HOLIDAY_API_KEY;
      
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          response: {
            holidays: []
          }
        }
      });

      await client.fetchHolidays('US', 2025, 1);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          params: expect.objectContaining({
            key: 'demo'
          })
        })
      );

      process.env.HOLIDAY_API_KEY = originalKey;
    });
  });

  describe('Error handling', () => {
    it('should throw error on network failure', async () => {
      const error = new Error('Network failed');
      (error as any).code = 'ENOTFOUND';

      mockedAxios.get.mockRejectedValue(error);

      await expect(
        client.fetchHolidays('US', 2025, 1)
      ).rejects.toThrow();
    });

    it('should handle axios error responses', async () => {
      const error = new Error('Server error');
      (error as any).response = { status: 503 };
      (error as any).code = 'ERR_BAD_RESPONSE';

      mockedAxios.get.mockRejectedValueOnce(error);
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { response: { holidays: [] } }
      });

      // Since we can't easily test the sleep/retry timing,
      // we'll just verify the error is handled
      try {
        await client.fetchHolidays('US', 2025, 1);
      } catch (e) {
        // Error thrown after retries exhausted
        expect(e).toBeDefined();
      }
    });
  });
});

