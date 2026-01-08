/**
 * Holidays Routes
 * 
 * GET /api/holidays - Fetch regular holidays
 */

import { Router, Request, Response, NextFunction } from 'express';
import { HolidayService } from '../services/HolidayService.js';

const router = Router();
const holidayService = new HolidayService();

/**
 * Query validation middleware
 */
function validateHolidaysQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const { country, year, month } = req.query;

  // Validate country
  if (!country || typeof country !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'country query parameter is required and must be a string',
      code: 'INVALID_COUNTRY'
    });
  }

  if (country.length !== 2) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'country must be a 2-letter ISO country code',
      code: 'INVALID_COUNTRY_FORMAT'
    });
  }

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

  // Store validated values in request
  (req as any).validated = {
    country: country.toUpperCase(),
    year: yearNum,
    month: monthNum
  };

  next();
}

/**
 * GET /api/holidays?country=US&year=2025&month=1
 * 
 * Fetch regular holidays for a country, year, and month
 * 
 * Query Parameters:
 * - country (required): 2-letter ISO country code (e.g., US, GB, FR)
 * - year (required): Year 1900-2100
 * - month (required): Month 1-12
 * 
 * Response:
 * {
 *   "data": [...RegularHoliday objects],
 *   "meta": {
 *     "country": "US",
 *     "year": 2025,
 *     "month": 1,
 *     "count": 2,
 *     "cached": false
 *   }
 * }
 */
router.get('/', validateHolidaysQuery, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { country, year, month } = (req as any).validated;

    const holidays = await holidayService.fetchHolidays(country, year, month);

    res.json({
      data: holidays,
      meta: {
        country,
        year,
        month,
        count: holidays.length,
        cached: false
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/holidays/by-range?country=US&year=2025&startMonth=1&endMonth=3
 * 
 * Fetch holidays for multiple months
 */
router.get('/by-range', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { country, year, startMonth, endMonth } = req.query;

    // Validate
    if (!country || typeof country !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'country is required',
        code: 'INVALID_COUNTRY'
      });
    }

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

    const months = Array.from(
      { length: endMonthNum - startMonthNum + 1 },
      (_, i) => startMonthNum + i
    );

    const holidaysByDate = await holidayService.fetchHolidaysForMonths(
      country.toUpperCase(),
      yearNum,
      months
    );

    res.json({
      data: Object.fromEntries(holidaysByDate),
      meta: {
        country: country.toUpperCase(),
        year: yearNum,
        startMonth: startMonthNum,
        endMonth: endMonthNum,
        count: Array.from(holidaysByDate.values()).reduce((sum, h) => sum + h.length, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

