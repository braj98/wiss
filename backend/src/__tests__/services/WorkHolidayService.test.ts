/**
 * WorkHolidayService Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { WorkHolidayService } from '../../services/WorkHolidayService.js';

describe('WorkHolidayService', () => {
  const service = new WorkHolidayService();

  describe('getHolidaysByMonth', () => {
    it('should return holidays for specific month', () => {
      const holidays = service.getHolidaysByMonth(2025, 3);
      
      expect(holidays).toBeInstanceOf(Array);
      expect(holidays.length).toBeGreaterThan(0);
      
      // All holidays should be in March 2025
      for (const holiday of holidays) {
        expect(holiday.date.startsWith('2025-03')).toBe(true);
      }
    });

    it('should filter by department', () => {
      const holidays = service.getHolidaysByMonth(2025, 4, 'engineering');
      
      // All holidays should be for engineering or available to all
      for (const holiday of holidays) {
        expect(
          holiday.department === 'engineering' || holiday.department === 'all'
        ).toBe(true);
      }
    });

    it('should return empty array for month with no holidays', () => {
      const holidays = service.getHolidaysByMonth(2025, 2);
      
      expect(holidays).toEqual([]);
    });

    it('should include company-wide holidays regardless of department', () => {
      const engineeringHolidays = service.getHolidaysByMonth(2025, 8, 'engineering');
      const salesHolidays = service.getHolidaysByMonth(2025, 8, 'sales');
      
      // Both should have the summer break
      const hasBreakEngineering = engineeringHolidays.some(h => h.name === 'Summer Break');
      const hasBreakSales = salesHolidays.some(h => h.name === 'Summer Break');
      
      expect(hasBreakEngineering).toBe(true);
      expect(hasBreakSales).toBe(true);
    });
  });

  describe('getHolidaysByDateRange', () => {
    it('should return holidays for date range', () => {
      const holidays = service.getHolidaysByDateRange(2025, 1, 3);
      
      expect(holidays).toBeInstanceOf(Map);
      expect(holidays.size).toBeGreaterThan(0);
    });

    it('should return holidays keyed by date', () => {
      const holidays = service.getHolidaysByDateRange(2025, 3, 3);
      
      for (const [date, holidayList] of holidays.entries()) {
        expect(typeof date).toBe('string');
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Array.isArray(holidayList)).toBe(true);
      }
    });

    it('should filter by department for range', () => {
      const holidays = service.getHolidaysByDateRange(2025, 1, 12, 'engineering');
      
      for (const holidayList of holidays.values()) {
        for (const holiday of holidayList) {
          expect(
            holiday.department === 'engineering' || holiday.department === 'all'
          ).toBe(true);
        }
      }
    });
  });

  describe('getHolidaysByDepartment', () => {
    it('should return all holidays when department is "all"', () => {
      const holidays = service.getHolidaysByDepartment('all');
      
      expect(holidays.length).toBeGreaterThan(0);
    });

    it('should return specific department holidays', () => {
      const holidays = service.getHolidaysByDepartment('engineering');
      
      for (const holiday of holidays) {
        expect(
          holiday.department === 'engineering' || holiday.department === 'all'
        ).toBe(true);
      }
    });

    it('should return company-wide holidays for non-existent department', () => {
      const holidays = service.getHolidaysByDepartment('nonexistent');
      
      // Non-existent departments return all company-wide holidays (department === 'all')
      expect(holidays.length).toBeGreaterThan(0);
      
      for (const holiday of holidays) {
        expect(holiday.department).toBe('all');
      }
    });
  });

  describe('getHolidayById', () => {
    it('should return holiday by ID', () => {
      const holiday = service.getHolidayById('work_1');
      
      expect(holiday).toBeDefined();
      expect(holiday?.id).toBe('work_1');
      expect(holiday?.name).toBe('Company Foundation Day');
    });

    it('should return undefined for non-existent ID', () => {
      const holiday = service.getHolidayById('nonexistent');
      
      expect(holiday).toBeUndefined();
    });
  });

  describe('getHolidaysByDate', () => {
    it('should return holidays for specific date', () => {
      const holidays = service.getHolidaysByDate('2025-03-15');
      
      expect(holidays).toBeInstanceOf(Array);
      
      for (const holiday of holidays) {
        expect(holiday.date).toBe('2025-03-15');
      }
    });

    it('should filter by department for specific date', () => {
      const holidays = service.getHolidaysByDate('2025-04-01', 'engineering');
      
      for (const holiday of holidays) {
        expect(holiday.date).toBe('2025-04-01');
        expect(
          holiday.department === 'engineering' || holiday.department === 'all'
        ).toBe(true);
      }
    });

    it('should return empty array for date with no holidays', () => {
      const holidays = service.getHolidaysByDate('2025-01-15');
      
      expect(holidays).toEqual([]);
    });
  });

  describe('getAllDepartments', () => {
    it('should return list of all departments', () => {
      const departments = service.getAllDepartments();
      
      expect(Array.isArray(departments)).toBe(true);
      expect(departments.length).toBeGreaterThan(0);
      expect(departments).not.toContain('all'); // 'all' is not a specific department
    });

    it('should return sorted departments', () => {
      const departments = service.getAllDepartments();
      const sorted = [...departments].sort();
      
      expect(departments).toEqual(sorted);
    });

    it('should include expected departments', () => {
      const departments = service.getAllDepartments();
      
      expect(departments).toContain('engineering');
      expect(departments).toContain('sales');
    });
  });
});
