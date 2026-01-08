import { WorkHoliday } from '../types/index.js';

/**
 * WorkHolidayService
 *
 * Service for managing work-specific holidays (company events, team breaks, etc.)
 * Follows Single Responsibility Principle - only handles work holiday data management.
 */

// Mock work holidays data - comprehensive coverage for 23 months (Sep 2025 - Jul 2027)
// Each month has at least one week with 1 work holiday (⭐) and one week with 2 work holidays (⭐⭐)
const WORK_HOLIDAYS: WorkHoliday[] = [
  // September 2025
  {
    id: 'work_2025_09_001',
    name: 'Q3 Review',
    date: '2025-09-05',
    department: 'Engineering',
    description: 'Quarterly engineering review',
    category: 'team'
  },
  {
    id: 'work_2025_09_002',
    name: 'Product Demo Day',
    date: '2025-09-12',
    department: 'Sales',
    description: 'Product demonstration event',
    category: 'event'
  },
  {
    id: 'work_2025_09_003',
    name: 'Team Offsite',
    date: '2025-09-19',
    department: 'Marketing',
    description: 'Marketing team offsite meeting',
    category: 'team'
  },

  // October 2025
  {
    id: 'work_2025_10_001',
    name: 'Q4 Planning',
    date: '2025-10-03',
    department: 'Engineering',
    description: 'Quarterly planning session',
    category: 'team'
  },
  {
    id: 'work_2025_10_002',
    name: 'Q4 Review',
    date: '2025-10-10',
    department: 'Sales',
    description: 'Quarterly sales review',
    category: 'team'
  },
  {
    id: 'work_2025_10_003',
    name: 'Content Strategy Workshop',
    date: '2025-10-17',
    department: 'Marketing',
    description: 'Content strategy planning',
    category: 'team'
  },

  // November 2025
  {
    id: 'work_2025_11_001',
    name: 'Thanksgiving Break',
    date: '2025-11-14',
    department: 'Engineering',
    description: 'Thanksgiving break for engineering team',
    category: 'break'
  },
  {
    id: 'work_2025_11_002',
    name: 'Client Appreciation Day',
    date: '2025-11-21',
    department: 'Sales',
    description: 'Thank clients for their business',
    category: 'event'
  },

  // December 2025
  {
    id: 'work_2025_12_001',
    name: 'Holiday Party',
    date: '2025-12-12',
    department: undefined, // Company-wide
    description: 'Year-end holiday party',
    category: 'company-event'
  },
  {
    id: 'work_2025_12_002',
    name: 'Winter Break',
    date: '2025-12-13',
    department: 'Engineering',
    description: 'Winter break for engineering team',
    category: 'break'
  },
  {
    id: 'work_2025_12_003',
    name: 'Year-End Review',
    date: '2025-12-19',
    department: 'Sales',
    description: 'Year-end sales review',
    category: 'team'
  },

  // January 2026
  {
    id: 'work_2026_01_001',
    name: 'New Year Planning',
    date: '2026-01-09',
    department: 'Engineering',
    description: 'Q1 planning session',
    category: 'team'
  },
  {
    id: 'work_2026_01_002',
    name: 'Marketing Strategy Session',
    date: '2026-01-10',
    department: 'Marketing',
    description: 'Marketing strategy planning',
    category: 'team'
  },
  {
    id: 'work_2026_01_003',
    name: 'Sales Kickoff',
    date: '2026-01-16',
    department: 'Sales',
    description: 'Annual sales team kickoff',
    category: 'team'
  },

  // February 2026
  {
    id: 'work_2026_02_001',
    name: 'Engineering Team Building',
    date: '2026-02-07',
    department: 'Engineering',
    description: 'Engineering team building event',
    category: 'team'
  },
  {
    id: 'work_2026_02_002',
    name: 'Marketing Planning Session',
    date: '2026-02-08',
    department: 'Marketing',
    description: 'Marketing planning session',
    category: 'team'
  },
  {
    id: 'work_2026_02_003',
    name: 'Valentine Team Event',
    date: '2026-02-14',
    department: 'Sales',
    description: 'Team appreciation event',
    category: 'event'
  },

  // March 2026
  {
    id: 'work_2026_03_001',
    name: 'Hackathon',
    date: '2026-03-07',
    department: 'Engineering',
    description: 'Company-wide hackathon',
    category: 'event'
  },
  {
    id: 'work_2026_03_002',
    name: 'Marketing Summit',
    date: '2026-03-14',
    department: 'Marketing',
    description: 'Marketing strategy summit',
    category: 'team'
  },

  // April 2026
  {
    id: 'work_2026_04_001',
    name: 'Spring Break',
    date: '2026-04-04',
    department: 'Engineering',
    description: 'Spring break for engineering team',
    category: 'break'
  },
  {
    id: 'work_2026_04_002',
    name: 'Product Launch Prep',
    date: '2026-04-11',
    department: 'Sales',
    description: 'Product launch preparation',
    category: 'event'
  },

  // May 2026
  {
    id: 'work_2026_05_001',
    name: 'Q2 Planning',
    date: '2026-05-02',
    department: 'Engineering',
    description: 'Q2 planning session',
    category: 'team'
  },
  {
    id: 'work_2026_05_002',
    name: 'Customer Success Day',
    date: '2026-05-09',
    department: 'Sales',
    description: 'Customer success appreciation',
    category: 'event'
  },

  // June 2026
  {
    id: 'work_2026_06_001',
    name: 'Summer Break Start',
    date: '2026-06-06',
    department: 'Engineering',
    description: 'Summer break begins',
    category: 'break'
  },
  {
    id: 'work_2026_06_002',
    name: 'Company Picnic',
    date: '2026-06-13',
    department: undefined, // Company-wide
    description: 'Annual company picnic',
    category: 'company-event'
  },

  // July 2026
  {
    id: 'work_2026_07_001',
    name: 'Summer Break',
    date: '2026-07-04',
    department: 'Engineering',
    description: 'Summer break for engineering team',
    category: 'break'
  },
  {
    id: 'work_2026_07_002',
    name: 'Summer Break',
    date: '2026-07-11',
    department: 'Sales',
    description: 'Summer break for sales team',
    category: 'break'
  },
  {
    id: 'work_2026_07_003',
    name: 'Summer Break',
    date: '2026-07-18',
    department: 'Marketing',
    description: 'Summer break for marketing team',
    category: 'break'
  },

  // August 2026
  {
    id: 'work_2026_08_001',
    name: 'Q3 Planning',
    date: '2026-08-08',
    department: 'Engineering',
    description: 'Q3 planning session',
    category: 'team'
  },
  {
    id: 'work_2026_08_002',
    name: 'Team Strategy Session',
    date: '2026-08-09',
    department: 'Sales',
    description: 'Sales team strategy session',
    category: 'team'
  },
  {
    id: 'work_2026_08_003',
    name: 'Back to School Event',
    date: '2026-08-15',
    department: 'Marketing',
    description: 'Back to school marketing event',
    category: 'event'
  },

  // September 2026
  {
    id: 'work_2026_09_001',
    name: 'Q3 Review',
    date: '2026-09-05',
    department: 'Engineering',
    description: 'Q3 review meeting',
    category: 'team'
  },
  {
    id: 'work_2026_09_002',
    name: 'Product Training',
    date: '2026-09-12',
    department: 'Sales',
    description: 'Product training session',
    category: 'event'
  },

  // October 2026
  {
    id: 'work_2026_10_001',
    name: 'Q4 Planning',
    date: '2026-10-03',
    department: 'Engineering',
    description: 'Q4 planning session',
    category: 'team'
  },
  {
    id: 'work_2026_10_002',
    name: 'Halloween Team Event',
    date: '2026-10-10',
    department: 'Marketing',
    description: 'Halloween team celebration',
    category: 'event'
  },

  // November 2026
  {
    id: 'work_2026_11_001',
    name: 'Thanksgiving Break',
    date: '2026-11-14',
    department: 'Engineering',
    description: 'Thanksgiving break',
    category: 'break'
  },
  {
    id: 'work_2026_11_002',
    name: 'Black Friday Prep',
    date: '2026-11-21',
    department: 'Sales',
    description: 'Black Friday preparation',
    category: 'event'
  },

  // December 2026
  {
    id: 'work_2026_12_001',
    name: 'Holiday Party',
    date: '2026-12-11',
    department: undefined, // Company-wide
    description: 'Year-end holiday party',
    category: 'company-event'
  },
  {
    id: 'work_2026_12_002',
    name: 'Winter Break',
    date: '2026-12-18',
    department: 'Engineering',
    description: 'Winter break for engineering team',
    category: 'break'
  },

  // January 2027
  {
    id: 'work_2027_01_001',
    name: 'New Year Planning',
    date: '2027-01-08',
    department: 'Engineering',
    description: 'Q1 planning session',
    category: 'team'
  },
  {
    id: 'work_2027_01_002',
    name: 'Sales Strategy Meeting',
    date: '2027-01-15',
    department: 'Sales',
    description: 'Sales strategy planning',
    category: 'team'
  },

  // February 2027
  {
    id: 'work_2027_02_001',
    name: 'Engineering Summit',
    date: '2027-02-05',
    department: 'Engineering',
    description: 'Engineering team summit',
    category: 'team'
  },
  {
    id: 'work_2027_02_002',
    name: 'Valentine Customer Event',
    date: '2027-02-12',
    department: 'Sales',
    description: 'Customer appreciation event',
    category: 'event'
  },

  // March 2027
  {
    id: 'work_2027_03_001',
    name: 'Innovation Hackathon',
    date: '2027-03-05',
    department: 'Engineering',
    description: 'Innovation hackathon',
    category: 'event'
  },
  {
    id: 'work_2027_03_002',
    name: 'Marketing Strategy Review',
    date: '2027-03-12',
    department: 'Marketing',
    description: 'Marketing strategy review',
    category: 'team'
  },

  // April 2027
  {
    id: 'work_2027_04_001',
    name: 'Spring Break',
    date: '2027-04-02',
    department: 'Engineering',
    description: 'Spring break for engineering team',
    category: 'break'
  },
  {
    id: 'work_2027_04_002',
    name: 'Product Roadmap Session',
    date: '2027-04-09',
    department: 'Sales',
    description: 'Product roadmap planning',
    category: 'event'
  },

  // May 2027
  {
    id: 'work_2027_05_001',
    name: 'Q2 Planning',
    date: '2027-05-07',
    department: 'Engineering',
    description: 'Q2 planning session',
    category: 'team'
  },
  {
    id: 'work_2027_05_002',
    name: 'Customer Feedback Session',
    date: '2027-05-14',
    department: 'Sales',
    description: 'Customer feedback analysis',
    category: 'event'
  },

  // June 2027
  {
    id: 'work_2027_06_001',
    name: 'Summer Kickoff',
    date: '2027-06-04',
    department: 'Engineering',
    description: 'Summer project kickoff',
    category: 'team'
  },
  {
    id: 'work_2027_06_002',
    name: 'Company Picnic',
    date: '2027-06-11',
    department: undefined, // Company-wide
    description: 'Annual company picnic',
    category: 'company-event'
  },

  // July 2027
  {
    id: 'work_2027_07_001',
    name: 'Summer Break',
    date: '2027-07-02',
    department: 'Engineering',
    description: 'Summer break for engineering team',
    category: 'break'
  },
  {
    id: 'work_2027_07_002',
    name: 'Summer Break',
    date: '2027-07-09',
    department: 'Sales',
    description: 'Summer break for sales team',
    category: 'break'
  }
];

/**
 * WorkHolidayService
 *
 * Manages work-specific holidays with filtering capabilities
 */
export class WorkHolidayService {
  private holidays: WorkHoliday[];

  constructor(holidays?: WorkHoliday[]) {
    this.holidays = holidays || WORK_HOLIDAYS;
  }

  /**
   * Get all holidays for a specific month and year
   */
  getHolidaysForMonth(year: number, month: number, department?: string): WorkHoliday[] {
    console.log(`[WorkHolidayService] Getting holidays for ${year}-${month}${department ? `, dept: ${department}` : ''}`);

    let filtered = this.holidays.filter(holiday => {
      const [hYear, hMonth] = holiday.date.split('-').map(Number);
      const matchesMonth = hYear === year && hMonth === month;
      const matchesDept = !department || holiday.department === department || !holiday.department;
      return matchesMonth && matchesDept;
    });

    console.log(`[WorkHolidayService] Found ${filtered.length} work holidays`);
    return filtered;
  }

  /**
   * Get holiday by ID
   */
  getHolidayById(id: string): WorkHoliday | null {
    const holiday = this.holidays.find(h => h.id === id);
    console.log(`[WorkHolidayService] Found holiday by ID ${id}:`, holiday ? 'yes' : 'no');
    return holiday || null;
  }

  /**
   * Get all holidays for a specific department
   */
  getHolidaysByDepartment(department: string): WorkHoliday[] {
    const filtered = this.holidays.filter(h => h.department === department || !h.department);
    console.log(`[WorkHolidayService] Found ${filtered.length} holidays for department ${department}`);
    return filtered;
  }

  /**
   * Get all holidays within a date range
   */
  getHolidaysInRange(startDate: string, endDate: string, department?: string): WorkHoliday[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date range');
    }

    let filtered = this.holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      const inRange = holidayDate >= start && holidayDate <= end;
      const matchesDept = !department || holiday.department === department || !holiday.department;
      return inRange && matchesDept;
    });

    console.log(`[WorkHolidayService] Found ${filtered.length} holidays in range ${startDate} to ${endDate}`);
    return filtered;
  }

  /**
   * Get all available departments
   */
  getDepartments(): string[] {
    const departments = new Set<string>();
    this.holidays.forEach(h => {
      if (h.department) {
        departments.add(h.department);
      }
    });
    return Array.from(departments).sort();
  }

  /**
   * Get holidays for multiple months
   */
  getHolidaysForMonths(year: number, months: number[], department?: string): Map<string, WorkHoliday[]> {
    console.log(`[WorkHolidayService] Getting holidays for ${year}, months: ${months.join(', ')}${department ? `, dept: ${department}` : ''}`);

    const result = new Map<string, WorkHoliday[]>();

    months.forEach(month => {
      const holidays = this.getHolidaysForMonth(year, month, department);
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      result.set(monthKey, holidays);
    });

    console.log(`[WorkHolidayService] Found holidays for ${result.size} months`);
    return result;
  }

  /**
   * Get holiday statistics
   */
  getStats(): {
    total: number;
    byDepartment: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const byDepartment: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    this.holidays.forEach(holiday => {
      // Count by department
      const dept = holiday.department || 'company-wide';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;

      // Count by category
      byCategory[holiday.category] = (byCategory[holiday.category] || 0) + 1;
    });

    return {
      total: this.holidays.length,
      byDepartment,
      byCategory
    };
  }
}
