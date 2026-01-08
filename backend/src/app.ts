/**
 * Express Application Setup
 * 
 * Configure Express middleware, routes, and error handling
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import holidaysRouter from './routes/holidays.routes.js';
import workHolidaysRouter from './routes/workHolidays.routes.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Request logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Routes
  app.use('/api/holidays', holidaysRouter);
  app.use('/api/work-holidays', workHolidaysRouter);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `${req.method} ${req.path} not found`,
      code: 'NOT_FOUND'
    });
  });

  // Error handling middleware
  app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
      error: error.name || 'Error',
      message,
      code: error.code || 'INTERNAL_ERROR'
    });
  });

  return app;
}
