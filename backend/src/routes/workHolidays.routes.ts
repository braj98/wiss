/**
 * Work Holidays Routes
 * 
 * GET /api/work-holidays - Fetch mocked work holidays
 */

import { Router, Request, Response, NextFunction } from 'express';
import { WorkHolidayService } from '../services/WorkHolidayService.js';

const router = Router();
const workHolidayService = new WorkHolidayService();

/**
 * GET /api/work-holidays?year=2025&month=3[&department=engineering]
 * 
 * Fetch work holidays for a specific month
 * 
 * Query Parameters:
 * - year (required): Year number
 * - month (required): Month 1-12
 * - department (optional): Filter by department (engineering, sales, all, etc.)
 * 
 * Response:
 * {
 *   "data": [...WorkHoliday objects],
 *   "meta": {
 *     "year": 2025,
 *     "month": 3,
 *     "department": "engineering",
 *     "count": 1
 *   }
 * }
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, month, department } = req.query;

    // Validate year
    if (!year || typeof year !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'year query parameter is required and must be a number',
        code: 'INVALID_YEAR'
      });
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'year must be between 1900 and 2100',
        code: 'INVALID_YEAR_RANGE'
      });
    }

    // Validate month
    if (!month || typeof month !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'month query parameter is required and must be a number',
        code: 'INVALID_MONTH'
      });
    }

    const monthNum = parseInt(month, 10);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'month must be between 1 and 12',
        code: 'INVALID_MONTH_RANGE'
      });
    }

    const deptFilter = department ? (department as string) : undefined;

    const holidays = workHolidayService.getHolidaysByMonth(
      yearNum,
      monthNum,
      deptFilter
    );

    res.json({
      data: holidays,
      meta: {
        year: yearNum,
        month: monthNum,
        department: deptFilter || 'all',
        count: holidays.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/work-holidays/by-date?date=2025-03-15[&department=engineering]
 * 
 * Fetch work holidays for a specific date
 */
router.get('/by-date', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, department } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'date query parameter is required (YYYY-MM-DD format)',
        code: 'INVALID_DATE'
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'date must be in YYYY-MM-DD format',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    const deptFilter = department ? (department as string) : undefined;

    const holidays = workHolidayService.getHolidaysByDate(date, deptFilter);

    res.json({
      data: holidays,
      meta: {
        date,
        department: deptFilter || 'all',
        count: holidays.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/work-holidays/by-range?year=2025&startMonth=1&endMonth=3[&department=engineering]
 * 
 * Fetch work holidays for a date range
 */
router.get('/by-range', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, startMonth, endMonth, department } = req.query;

    const yearNum = parseInt(year as string, 10);
    const startMonthNum = parseInt(startMonth as string, 10);
    const endMonthNum = parseInt(endMonth as string, 10);

    if (isNaN(yearNum) || isNaN(startMonthNum) || isNaN(endMonthNum)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'year, startMonth, and endMonth must be numbers',
        code: 'INVALID_PARAMS'
      });
    }

    if (startMonthNum < 1 || startMonthNum > 12 || endMonthNum < 1 || endMonthNum > 12) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'months must be between 1 and 12',
        code: 'INVALID_MONTH_RANGE'
      });
    }

    if (startMonthNum > endMonthNum) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'startMonth must be <= endMonth',
        code: 'INVALID_RANGE'
      });
    }

    const deptFilter = department ? (department as string) : undefined;

    const holidaysByDate = workHolidayService.getHolidaysByDateRange(
      yearNum,
      startMonthNum,
      endMonthNum,
      deptFilter
    );

    res.json({
      data: Array.from(holidaysByDate.entries()).map(([date, holidays]) => ({
        date,
        holidays
      })),
      meta: {
        year: yearNum,
        startMonth: startMonthNum,
        endMonth: endMonthNum,
        department: deptFilter || 'all',
        count: Array.from(holidaysByDate.values()).reduce(
          (sum, h) => sum + h.length,
          0
        )
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/work-holidays/departments
 * 
 * Get list of all available departments
 */
router.get('/departments', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = workHolidayService.getAllDepartments();

    res.json({
      data: departments,
      meta: {
        count: departments.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
