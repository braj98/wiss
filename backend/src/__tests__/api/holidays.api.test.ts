/**
 * API Integration Tests
 * 
 * Test Express routes with Supertest
 * Covers holidays and work-holidays endpoints
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

describe('API - /api/holidays', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
  });

  describe('GET /api/holidays', () => {
    it('should return 400 for invalid country format', async () => {
      const res = await request(app)
        .get('/api/holidays')
        .query({ country: 'INVALID', year: 2025, month: 1 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_COUNTRY_FORMAT');
    });

    it('should return 400 for invalid year', async () => {
      const res = await request(app)
        .get('/api/holidays')
        .query({ country: 'US', year: 1800, month: 1 });

      expect(res.status).toBe(400);
      expect(['INVALID_YEAR', 'INVALID_YEAR_RANGE']).toContain(res.body.code);
    });

    it('should return 400 for missing country', async () => {
      const res = await request(app)
        .get('/api/holidays')
        .query({ year: 2025, month: 1 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_COUNTRY');
      expect(res.body.message).toContain('country');
    });

    it('should return 400 for invalid country code length', async () => {
      const res = await request(app)
        .get('/api/holidays')
        .query({ country: 'USA', year: 2025, month: 1 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_COUNTRY_FORMAT');
    });

    it('should return 400 for missing year', async () => {
      const res = await request(app)
        .get('/api/holidays')
        .query({ country: 'US', month: 1 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_YEAR');
    });

    it('should return 400 for invalid year range', async () => {
      const res = await request(app)
        .get('/api/holidays')
        .query({ country: 'US', year: 2200, month: 1 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_YEAR_RANGE');
    });

    it('should return 400 for missing month', async () => {
      const res = await request(app)
        .get('/api/holidays')
        .query({ country: 'US', year: 2025 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_MONTH');
    });

    it('should return 400 for invalid month range', async () => {
      const res = await request(app)
        .get('/api/holidays')
        .query({ country: 'US', year: 2025, month: 13 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_MONTH_RANGE');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeTruthy();
    });
  });

  describe('GET /unknown-route', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route');

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });
  });
});
