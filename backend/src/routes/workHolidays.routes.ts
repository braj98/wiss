/**
 * Work Holidays Routes
 * 
 * GET /api/work-holidays - Fetch mocked work holidays
 */

import { Router, Request, Response, NextFunction } from 'express';
import { WorkHolidayService } from '../services/WorkHolidayService';

const router = Router();
const workHolidayService = new WorkHolidayService();

/**
 * GET /api/work-holidays?year=2025&month=3[&department=Engineering]
 *
 * Fetch work holidays for a specific month
 *
 * Query Parameters:
 * - year (required): Year number
 * - month (required): Month 1-12
 * - department (optional): Filter by department (Engineering, Sales, etc.)
 *
 * Response:
 * {
 *   "data": [...WorkHoliday objects],
 *   "meta": {
 *     "year": 2025,
 *     "month": 3,
 *     "department": "Engineering",
 *     "count": 1
 *   }
 * }
 */
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { year, month, department } = req.query;

    // Validate year
    if (!year || typeof year !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'year query parameter is required and must be a number',
        code: 'INVALID_YEAR'
      });
      return;
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'year must be between 1900 and 2100',
        code: 'INVALID_YEAR_RANGE'
      });
      return;
    }

    // Validate month
    if (!month || typeof month !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'month query parameter is required and must be a number',
        code: 'INVALID_MONTH'
      });
      return;
    }

    const monthNum = parseInt(month, 10);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'month must be between 1 and 12',
        code: 'INVALID_MONTH_RANGE'
      });
      return;
    }

    const deptFilter = department ? (department as string) : undefined;

    const holidays = workHolidayService.getHolidaysForMonth(
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
 * GET /api/work-holidays/by-date?date=2025-03-15[&department=Engineering]
 *
 * Fetch work holidays for a specific date
 */
router.get('/by-date', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { date, department } = req.query;

    // Validate date
    if (!date || typeof date !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'date query parameter is required and must be a string',
        code: 'INVALID_DATE'
      });
      return;
    }

    // Basic date format validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'date must be in YYYY-MM-DD format',
        code: 'INVALID_DATE_FORMAT'
      });
      return;
    }

    const deptFilter = department ? (department as string) : undefined;

    const holidays = workHolidayService.getHolidaysInRange(
      date,
      date,
      deptFilter
    );

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
 * GET /api/work-holidays/by-range?year=2025&startMonth=1&endMonth=3[&department=Engineering]
 *
 * Fetch work holidays for multiple months
 */
router.get('/by-range', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { year, startMonth, endMonth, department } = req.query;

    // Validate year
    if (!year || typeof year !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'year query parameter is required and must be a number',
        code: 'INVALID_YEAR'
      });
      return;
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'year must be between 1900 and 2100',
        code: 'INVALID_YEAR_RANGE'
      });
      return;
    }

    // Validate startMonth
    if (!startMonth || typeof startMonth !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'startMonth query parameter is required and must be a number',
        code: 'INVALID_START_MONTH'
      });
      return;
    }

    const startMonthNum = parseInt(startMonth, 10);
    if (isNaN(startMonthNum) || startMonthNum < 1 || startMonthNum > 12) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'startMonth must be between 1 and 12',
        code: 'INVALID_START_MONTH_RANGE'
      });
      return;
    }

    // Validate endMonth
    if (!endMonth || typeof endMonth !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'endMonth query parameter is required and must be a number',
        code: 'INVALID_END_MONTH'
      });
      return;
    }

    const endMonthNum = parseInt(endMonth, 10);
    if (isNaN(endMonthNum) || endMonthNum < 1 || endMonthNum > 12) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'endMonth must be between 1 and 12',
        code: 'INVALID_END_MONTH_RANGE'
      });
      return;
    }

    // Validate range
    if (startMonthNum > endMonthNum) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'startMonth must be <= endMonth',
        code: 'INVALID_RANGE'
      });
      return;
    }

    const deptFilter = department ? (department as string) : undefined;

    const months = Array.from(
      { length: endMonthNum - startMonthNum + 1 },
      (_, i) => startMonthNum + i
    );

    const holidaysByMonth = workHolidayService.getHolidaysForMonths(
      yearNum,
      months,
      deptFilter
    );

    res.json({
      data: Object.fromEntries(holidaysByMonth),
      meta: {
        year: yearNum,
        startMonth: startMonthNum,
        endMonth: endMonthNum,
        department: deptFilter || 'all',
        monthCount: months.length,
        totalCount: Array.from(holidaysByMonth.values()).reduce((sum, h) => sum + h.length, 0)
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
router.get('/departments', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const departments = workHolidayService.getDepartments();

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

