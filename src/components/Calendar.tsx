/**
 * Calendar Component
 * Displays a 3-month rolling calendar (previous, current, next) with holiday markers
 */

import React, { useState } from 'react';
import { useAppSelector } from '../store/index.js';
import type { RegularHoliday, WorkHoliday } from '../types/holiday.js';
import './Calendar.css';

interface CalendarProps {
  year: number;
  month: number;
  country: string;
}

type CalendarSize = 'small' | 'medium' | 'large';

function Calendar({ year, month, country }: CalendarProps): React.ReactElement {
  const { regularHolidays, workHolidays } = useAppSelector((state) => state.holidays);
  const [calendarSize, setCalendarSize] = useState<CalendarSize>('medium');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate previous, current, and next months
  const getMonthInfo = (y: number, m: number) => {
    let prevMonth = m - 1;
    let prevYear = y;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = y - 1;
    }

    let nextMonth = m + 1;
    let nextYear = y;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = y + 1;
    }

    return [
      { year: prevYear, month: prevMonth, isCurrent: false },
      { year: y, month: m, isCurrent: true },
      { year: nextYear, month: nextMonth, isCurrent: false }
    ];
  };

  const months = getMonthInfo(year, month);

  // Get first day of month and number of days
  const getMonthDays = (y: number, m: number) => {
    return new Date(y, m, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m - 1, 1).getDay();
  };

  // Get holidays for a specific date
  const getHolidaysForDate = (
    date: number,
    y: number,
    m: number
  ): { regular: RegularHoliday[]; work: WorkHoliday[] } => {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const regular = regularHolidays.filter((h) => h.date === dateStr);
    const work = workHolidays.filter((h) => h.date === dateStr);
    return { regular, work };
  };

  // Check if a date is today
  const isToday = (date: number, y: number, m: number): boolean => {
    const today = new Date();
    return (
      date === today.getDate() &&
      m === today.getMonth() + 1 &&
      y === today.getFullYear()
    );
  };

  // Create calendar days array for a month
  const createCalendarDays = (y: number, m: number) => {
    const firstDay = getFirstDayOfMonth(y, m);
    const daysInMonth = getMonthDays(y, m);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let date = 1; date <= daysInMonth; date++) {
      days.push(date);
    }
    return days;
  };

  return (
    <div className={`calendar calendar-${calendarSize}`}>
      <div className="calendar-controls">
        <div className="calendar-size-control">
          <label>Size:</label>
          <select
            value={calendarSize}
            onChange={(e) => setCalendarSize(e.target.value as CalendarSize)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      <div className="calendar-3month">
        {months.map((monthInfo, index) => (
          <div
            key={`${monthInfo.year}-${monthInfo.month}`}
            className={`calendar-month ${monthInfo.isCurrent ? 'current-month' : ''}`}
          >
            <div className="calendar-header">
              <h2>{monthNames[monthInfo.month - 1]} {monthInfo.year}</h2>
              {monthInfo.isCurrent && <span className="current-badge">Current</span>}
            </div>

            <div className="calendar-grid">
              {dayNames.map((day) => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}

              {createCalendarDays(monthInfo.year, monthInfo.month).map((date, idx) => {
                if (date === null) {
                  return <div key={`empty-${idx}`} className="calendar-day empty" />;
                }

                const { regular, work } = getHolidaysForDate(date, monthInfo.year, monthInfo.month);
                const hasHolidays = regular.length > 0 || work.length > 0;

                return (
                  <div
                    key={date}
                    className={`calendar-day ${isToday(date, monthInfo.year, monthInfo.month) ? 'today' : ''} ${
                      hasHolidays ? 'has-holiday' : ''
                    }`}
                  >
                    <span className="day-number">{date}</span>
                    {hasHolidays && (
                      <div className="holiday-markers">
                        {regular.slice(0, 1).map((holiday) => (
                          <span
                            key={holiday.id}
                            className="holiday-marker regular"
                            title={holiday.name}
                          >
                            🎉
                          </span>
                        ))}
                        {work.slice(0, 1).map((holiday) => {
                          const isPublicHoliday = (holiday as any).category === 'public-holiday';
                          return (
                            <span
                              key={holiday.id}
                              className={`holiday-marker work ${isPublicHoliday ? 'public' : ''}`}
                              title={holiday.name}
                            >
                              {isPublicHoliday ? '🏛️' : '💼'}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-marker">🎉</span>
          <span>Public Holiday</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker">💼</span>
          <span>Work Holiday</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker">🏛️</span>
          <span>Company Holiday</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
