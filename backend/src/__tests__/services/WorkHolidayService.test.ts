/**
 * WorkHolidayService Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { WorkHolidayService } from '../../services/WorkHolidayService';

describe('WorkHolidayService', () => {
  const service = new WorkHolidayService();

  describe('getHolidaysForMonth', () => {
    it('should return holidays for specific month', () => {
      const holidays = service.getHolidaysForMonth(2025, 9);

      expect(holidays).toBeInstanceOf(Array);
      expect(holidays.length).toBeGreaterThan(0);

      // All holidays should be in September 2025
      for (const holiday of holidays) {
        expect(holiday.date.startsWith('2025-09')).toBe(true);
      }
    });

    it('should filter by department', () => {
      const holidays = service.getHolidaysForMonth(2025, 7, 'Engineering');

      // All holidays should be for engineering or available to all
      for (const holiday of holidays) {
        expect(
          holiday.department === 'Engineering' || holiday.department === undefined
        ).toBe(true);
      }
    });

    it('should return empty array for month with no holidays', () => {
      const holidays = service.getHolidaysForMonth(2025, 2);

      expect(holidays).toEqual([]);
    });

    it('should include company-wide holidays regardless of department', () => {
      const engineeringHolidays = service.getHolidaysForMonth(2025, 7, 'Engineering');
      const salesHolidays = service.getHolidaysForMonth(2025, 7, 'Sales');

      // Both should have the summer break
      const hasBreakEngineering = engineeringHolidays.some((h: any) => h.name === 'Summer Break');
      const hasBreakSales = salesHolidays.some((h: any) => h.name === 'Summer Break');

      expect(hasBreakEngineering).toBe(true);
      expect(hasBreakSales).toBe(true);
    });
  });

  describe('getHolidaysInRange', () => {
    it('should return holidays for date range', () => {
      const holidays = service.getHolidaysInRange('2025-09-01', '2025-12-31');

      expect(holidays).toBeInstanceOf(Array);
      expect(holidays.length).toBeGreaterThan(0);
    });

    it('should filter by department for range', () => {
      const holidays = service.getHolidaysInRange('2025-01-01', '2025-12-31', 'Engineering');

      for (const holiday of holidays) {
        expect(
          holiday.department === 'Engineering' || holiday.department === undefined
        ).toBe(true);
      }
    });
  });

  describe('getHolidaysByDepartment', () => {
    it('should return specific department holidays', () => {
      const holidays = service.getHolidaysByDepartment('Engineering');

      for (const holiday of holidays) {
        expect(
          holiday.department === 'Engineering' || holiday.department === undefined
        ).toBe(true);
      }
    });
  });

  describe('getHolidayById', () => {
    it('should return holiday by ID', () => {
      const holiday = service.getHolidayById('work_2025_09_001');

      expect(holiday).toBeDefined();
      expect(holiday?.id).toBe('work_2025_09_001');
      expect(holiday?.name).toBe('Q3 Review');
    });

    it('should return null for non-existent ID', () => {
      const holiday = service.getHolidayById('nonexistent');

      expect(holiday).toBeNull();
    });
  });

  describe('getDepartments', () => {
    it('should return list of all departments', () => {
      const departments = service.getDepartments();

      expect(Array.isArray(departments)).toBe(true);
      expect(departments.length).toBeGreaterThan(0);
    });

    it('should return sorted departments', () => {
      const departments = service.getDepartments();
      const sorted = [...departments].sort();

      expect(departments).toEqual(sorted);
    });

    it('should include expected departments', () => {
      const departments = service.getDepartments();

      expect(departments).toContain('Engineering');
      expect(departments).toContain('Sales');
    });
  });
});
