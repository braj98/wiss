/**
 * WorkHolidayService
 * 
 * Manages mocked work holidays with filtering
 * Single Responsibility: Work holiday data management
 */

import type { WorkHoliday } from '../types/index.js';

/**
 * Mocked work holidays data
 * In production, would load from database
 */
const WORK_HOLIDAYS: WorkHoliday[] = [
  {
    id: 'work_1',
    name: 'Company Foundation Day',
    date: '2025-03-15',
    department: 'all',
    description: 'Celebrating company anniversary',
    category: 'company-event'
  },
  {
    id: 'work_2',
    name: 'Product Launch Event',
    date: '2025-04-01',
    department: 'engineering',
    description: 'New product release celebration',
    category: 'event'
  },
  {
    id: 'work_3',
    name: 'Sales Conference',
    date: '2025-05-10',
    department: 'sales',
    description: 'Annual sales team gathering',
    category: 'event'
  },
  {
    id: 'work_4',
    name: 'Summer Break',
    date: '2025-08-01',
    department: 'all',
    description: 'Company-wide summer vacation',
    category: 'break'
  },
  {
    id: 'work_5',
    name: 'Engineering Hackathon',
    date: '2025-09-15',
    department: 'engineering',
    description: 'Internal innovation competition',
    category: 'event'
  },
  {
    id: 'work_6',
    name: 'Year-End Party',
    date: '2025-12-20',
    department: 'all',
    description: 'Company celebration and team bonding',
    category: 'event'
  },
  // Sample Indian Public Holidays for Demo (when API demo key limit reached)
  {
    id: 'ind_1',
    name: 'Republic Day',
    date: '2026-01-26',
    department: 'all',
    description: 'National Holiday - Celebrating Indian Constitution',
    category: 'public-holiday'
  },
  {
    id: 'ind_2',
    name: 'Republic Day',
    date: '2025-01-26',
    department: 'all',
    description: 'National Holiday - Celebrating Indian Constitution',
    category: 'public-holiday'
  },
  {
    id: 'ind_3',
    name: 'Independence Day',
    date: '2025-08-15',
    department: 'all',
    description: 'National Holiday - Celebrating Independence',
    category: 'public-holiday'
  },
  {
    id: 'ind_4',
    name: 'Gandhi Jayanti',
    date: '2025-10-02',
    department: 'all',
    description: 'National Holiday - Birth Anniversary of Mahatma Gandhi',
    category: 'public-holiday'
  },
  {
    id: 'ind_5',
    name: 'Diwali',
    date: '2025-10-21',
    department: 'all',
    description: 'Festival of Lights',
    category: 'public-holiday'
  },
  {
    id: 'ind_6',
    name: 'Holi',
    date: '2025-03-14',
    department: 'all',
    description: 'Festival of Colors',
    category: 'public-holiday'
  },
  {
    id: 'ind_7',
    name: 'Christmas',
    date: '2025-12-25',
    department: 'all',
    description: 'Christmas Celebration',
    category: 'public-holiday'
  }
];

export class WorkHolidayService {
  /**
   * Get work holidays for a specific month
   * @param year Year
   * @param month Month (1-12)
   * @param department Optional: filter by department ('all' returns all departments)
   * @returns Array of WorkHoliday objects
   */
  getHolidaysByMonth(
    year: number,
    month: number,
    department?: string
  ): WorkHoliday[] {
    return WORK_HOLIDAYS.filter((holiday) => {
      // Parse date
      const [holYear, holMonth] = holiday.date.split('-').map(Number);

      // Check year and month
      if (holYear !== year || holMonth !== month) {
        return false;
      }

      // Check department
      if (department && department !== 'all') {
        if (holiday.department !== 'all' && holiday.department !== department) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get work holidays for a date range
   * @param year Year
   * @param startMonth Start month (1-12)
   * @param endMonth End month (1-12)
   * @param department Optional: filter by department
   * @returns Map of holidays keyed by date
   */
  getHolidaysByDateRange(
    year: number,
    startMonth: number,
    endMonth: number,
    department?: string
  ): Map<string, WorkHoliday[]> {
    const result = new Map<string, WorkHoliday[]>();

    for (let month = startMonth; month <= endMonth; month++) {
      const holidays = this.getHolidaysByMonth(year, month, department);

      for (const holiday of holidays) {
        if (!result.has(holiday.date)) {
          result.set(holiday.date, []);
        }
        result.get(holiday.date)!.push(holiday);
      }
    }

    return result;
  }

  /**
   * Get all work holidays for a specific department
   * @param department Department name or 'all'
   * @returns Array of WorkHoliday objects
   */
  getHolidaysByDepartment(department: string): WorkHoliday[] {
    if (department === 'all') {
      return WORK_HOLIDAYS;
    }

    return WORK_HOLIDAYS.filter(
      (h) => h.department === 'all' || h.department === department
    );
  }

  /**
   * Get a specific work holiday by ID
   * @param id Holiday ID
   * @returns WorkHoliday or undefined
   */
  getHolidayById(id: string): WorkHoliday | undefined {
    return WORK_HOLIDAYS.find((h) => h.id === id);
  }

  /**
   * Get work holidays for a specific date
   * @param date Date in YYYY-MM-DD format
   * @param department Optional: filter by department
   * @returns Array of WorkHoliday objects
   */
  getHolidaysByDate(date: string, department?: string): WorkHoliday[] {
    return WORK_HOLIDAYS.filter((holiday) => {
      if (holiday.date !== date) {
        return false;
      }

      if (department && department !== 'all') {
        if (holiday.department !== 'all' && holiday.department !== department) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get all available departments
   */
  getAllDepartments(): string[] {
    const departments = new Set<string>();

    for (const holiday of WORK_HOLIDAYS) {
      if (holiday.department !== 'all' && holiday.department) {
        departments.add(holiday.department);
      }
    }

    return Array.from(departments).sort();
  }
}
