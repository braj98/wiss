/**
 * WorkHolidayService
 * 
 * Service for managing work-specific holidays
 * Provides mock data for work holidays
 */

// Mock work holidays data
const WORK_HOLIDAYS = [
  {
    id: 'work_1',
    name: 'Company Foundation Day',
    date: '2025-03-15',
    department: undefined,
    description: 'Celebrating company anniversary',
    category: 'company-event'
  },
  {
    id: 'work_2',
    name: 'Product Launch Event',
    date: '2025-04-01',
    department: 'Engineering',
    description: 'New product release celebration',
    category: 'event'
  },
  {
    id: 'work_3',
    name: 'Sales Conference',
    date: '2025-05-10',
    department: 'Sales',
    description: 'Annual sales team gathering',
    category: 'event'
  },
  {
    id: 'work_4',
    name: 'Summer Break',
    date: '2025-07-01',
    department: undefined,
    description: 'Company summer holiday',
    category: 'company-event'
  },
  {
    id: 'work_2025_09_001',
    name: 'Q3 Review',
    date: '2025-09-15',
    department: undefined,
    description: 'Quarterly business review',
    category: 'company-event'
  },
  {
    id: 'work_5',
    name: 'Team Building Event',
    date: '2025-09-20',
    department: undefined,
    description: 'Annual team building activity',
    category: 'event'
  },
  {
    id: 'work_6',
    name: 'Year End Party',
    date: '2025-12-20',
    department: undefined,
    description: 'Company year-end celebration',
    category: 'event'
  }
];

export class WorkHolidayService {
  constructor() {
    this.holidays = WORK_HOLIDAYS;
  }

  /**
   * Get work holidays for a specific month
   */
  getHolidaysForMonth(year, month, department) {
    return this.holidays.filter(holiday => {
      const [hYear, hMonth] = holiday.date.split('-').map(Number);
      const matchesYearMonth = hYear === year && hMonth === month;
      const matchesDepartment = !department || !holiday.department || holiday.department === department;

      return matchesYearMonth && matchesDepartment;
    });
  }

  /**
   * Get work holidays for a specific date
   */
  getHolidaysForDate(date, department) {
    return this.holidays.filter(holiday => {
      const matchesDate = holiday.date === date;
      const matchesDepartment = !department || !holiday.department || holiday.department === department;

      return matchesDate && matchesDepartment;
    });
  }

  /**
   * Get work holidays for a date range
   */
  getHolidaysInRange(startDate, endDate, department) {
    return this.holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      const matchesDateRange = holidayDate >= start && holidayDate <= end;
      const matchesDepartment = !department || !holiday.department || holiday.department === department;

      return matchesDateRange && matchesDepartment;
    });
  }

  /**
   * Get work holidays for multiple months
   * Returns a Map with month numbers as keys and holiday arrays as values
   */
  getHolidaysForMonths(year, months, department) {
    const result = new Map();

    for (const month of months) {
      const holidays = this.getHolidaysForMonth(year, month, department);
      result.set(month, holidays);
    }

    return result;
  }

  /**
   * Get work holidays by department
   */
  getHolidaysByDepartment(department) {
    return this.holidays.filter(holiday => {
      return holiday.department === department || !holiday.department;
    });
  }

  /**
   * Get a single work holiday by ID
   */
  getHolidayById(id) {
    return this.holidays.find(holiday => holiday.id === id) || null;
  }

  /**
   * Get all available departments
   */
  getDepartments() {
    const departments = new Set();
    this.holidays.forEach(holiday => {
      if (holiday.department) {
        departments.add(holiday.department);
      }
    });
    return Array.from(departments);
  }

  /**
   * Get all work holidays
   */
  getAllHolidays() {
    return this.holidays;
  }
}
