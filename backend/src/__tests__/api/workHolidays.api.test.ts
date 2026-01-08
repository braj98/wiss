/**
 * Work Holidays API Integration Tests
 * 
 * Test work-holidays endpoints with Supertest
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

describe('API - /api/work-holidays', () => {
  const app = createApp();

  describe('GET /api/work-holidays', () => {
    it('should return work holidays for valid year and month', async () => {
      const res = await request(app)
        .get('/api/work-holidays')
        .query({ year: 2025, month: 3 });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.year).toBe(2025);
      expect(res.body.meta.month).toBe(3);
      expect(res.body.meta.count).toBeGreaterThanOrEqual(0);
    });

    it('should filter by department', async () => {
      const res = await request(app)
        .get('/api/work-holidays')
        .query({ year: 2025, month: 4, department: 'engineering' });

      expect(res.status).toBe(200);
      expect(res.body.meta.department).toBe('engineering');
      
      // All returned holidays should be for engineering or all
      for (const holiday of res.body.data) {
        expect(
          holiday.department === 'engineering' || holiday.department === 'all'
        ).toBe(true);
      }
    });

    it('should return 400 for missing year', async () => {
      const res = await request(app)
        .get('/api/work-holidays')
        .query({ month: 3 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_YEAR');
    });

    it('should return 400 for invalid year', async () => {
      const res = await request(app)
        .get('/api/work-holidays')
        .query({ year: 'invalid', month: 3 });

      expect(res.status).toBe(400);
      expect(['INVALID_YEAR', 'INVALID_YEAR_RANGE']).toContain(res.body.code);
    });

    it('should return 400 for year out of range', async () => {
      const res = await request(app)
        .get('/api/work-holidays')
        .query({ year: 1800, month: 3 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_YEAR_RANGE');
    });

    it('should return 400 for missing month', async () => {
      const res = await request(app)
        .get('/api/work-holidays')
        .query({ year: 2025 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_MONTH');
    });

    it('should return 400 for invalid month', async () => {
      const res = await request(app)
        .get('/api/work-holidays')
        .query({ year: 2025, month: 'invalid' });

      expect(res.status).toBe(400);
      expect(['INVALID_MONTH', 'INVALID_MONTH_RANGE']).toContain(res.body.code);
    });

    it('should return 400 for month out of range', async () => {
      const res = await request(app)
        .get('/api/work-holidays')
        .query({ year: 2025, month: 13 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_MONTH_RANGE');
    });
  });

  describe('GET /api/work-holidays/by-date', () => {
    it('should return work holidays for specific date', async () => {
      const res = await request(app)
        .get('/api/work-holidays/by-date')
        .query({ date: '2025-03-15' });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.date).toBe('2025-03-15');
    });

    it('should filter by department for specific date', async () => {
      const res = await request(app)
        .get('/api/work-holidays/by-date')
        .query({ date: '2025-04-01', department: 'engineering' });

      expect(res.status).toBe(200);
      expect(res.body.meta.department).toBe('engineering');
      
      for (const holiday of res.body.data) {
        expect(
          holiday.department === 'engineering' || holiday.department === 'all'
        ).toBe(true);
      }
    });

    it('should return 400 for missing date', async () => {
      const res = await request(app)
        .get('/api/work-holidays/by-date');

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_DATE');
    });

    it('should return 400 for invalid date format', async () => {
      const res = await request(app)
        .get('/api/work-holidays/by-date')
        .query({ date: '03/15/2025' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_DATE_FORMAT');
    });
  });

  describe('GET /api/work-holidays/by-range', () => {
    it('should return work holidays for date range', async () => {
      const res = await request(app)
        .get('/api/work-holidays/by-range')
        .query({ year: 2025, startMonth: 1, endMonth: 3 });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.startMonth).toBe(1);
      expect(res.body.meta.endMonth).toBe(3);
    });

    it('should filter by department for date range', async () => {
      const res = await request(app)
        .get('/api/work-holidays/by-range')
        .query({
          year: 2025,
          startMonth: 1,
          endMonth: 6,
          department: 'sales'
        });

      expect(res.status).toBe(200);
      expect(res.body.meta.department).toBe('sales');
    });

    it('should return 400 for invalid month range', async () => {
      const res = await request(app)
        .get('/api/work-holidays/by-range')
        .query({ year: 2025, startMonth: 6, endMonth: 3 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_RANGE');
    });
  });

  describe('GET /api/work-holidays/departments', () => {
    it('should return list of all departments', async () => {
      const res = await request(app)
        .get('/api/work-holidays/departments');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.count).toBeGreaterThan(0);
      
      // Departments should be sorted
      const departments = res.body.data;
      expect(departments).toEqual([...departments].sort());
    });
  });
});
