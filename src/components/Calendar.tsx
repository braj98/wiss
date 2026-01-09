/**
 * Calendar Component
 * Displays a 3-month rolling calendar (previous, current, next) with holiday markers
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/index.js';
import { fetchHolidaysForRange } from '../store/slices/holidaysSlice.js';
import type { RegularHoliday, WorkHoliday } from '../types/holiday.js';
import './Calendar.css';

interface CalendarProps {
  year: number;
  month: number;
  country: string;
  size?: 'small' | 'medium' | 'large';
}

type CalendarSize = 'small' | 'medium' | 'large';

function Calendar({ year, month, country, size = 'medium' }: CalendarProps): React.ReactElement {
  const { regularHolidays, workHolidays } = useAppSelector((state) => state.holidays);

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
    const monthKey = `${y}-${String(m).padStart(2, '0')}`;

    // Get holidays for this specific month
    const monthRegularHolidays = regularHolidays[monthKey] || [];
    const monthWorkHolidays = workHolidays[monthKey] || [];

    // Filter by date
    const regular = monthRegularHolidays.filter((h: RegularHoliday) => h.date === dateStr);
    const work = monthWorkHolidays.filter((h: WorkHoliday) => h.date === dateStr);

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

  // Utility: Truncate text with ellipsis
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  // Utility: Check if text contains special characters
  const hasSpecialChars = (text: string): boolean => {
    return /[^\x00-\x7F]/.test(text) || /[©®™]/.test(text);
  };

  // Utility: Safe holiday name display
  const getSafeHolidayName = (name: string): string => {
    // Handle UTF-8 and special characters
    const cleanName = name.trim();
    const truncated = truncateText(cleanName, 200);
    
    // Add indicator for special characters if present
    return hasSpecialChars(cleanName) ? truncated : truncated;
  };

  // Accessibility: Get ARIA label for calendar day
  const getDayAriaLabel = (date: number, year: number, month: number): string => {
    const { regular, work } = getHolidaysForDate(date, year, month);
    const dateObj = new Date(year, month - 1, date);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = monthNames[month - 1];
    
    let ariaLabel = `${weekday}, ${monthName} ${date}, ${year}`;

    if (work.length > 0) {
      ariaLabel += `. Has ${work.length} work holiday${work.length > 1 ? 's' : ''}: ${work.map(h => h.name).join(', ')}`;
    }

    if (isToday(date, year, month)) {
      ariaLabel += ', Today';
    }

    return ariaLabel;
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

  // Calculate weeks with work holiday counts
  const calculateWeeks = (y: number, m: number) => {
    const firstDay = getFirstDayOfMonth(y, m);
    const daysInMonth = getMonthDays(y, m);
    const weeks: Array<{
      startDate: Date;
      endDate: Date;
      workHolidayCount: number;
      days: (number | null)[];
    }> = [];

    let currentDate = 1;
    
    // Handle partial first week
    let weekStart = new Date(y, m - 1, 1 - firstDay);
    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    while (currentDate <= daysInMonth) {
      const weekDays: (number | null)[] = [];
      let workHolidayCount = 0;

      // Build week days (Sunday-Saturday)
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(weekStart.getDate() + dayOffset);
        
        if (checkDate.getMonth() === m - 1 && checkDate.getFullYear() === y) {
          const dayNum = checkDate.getDate();
          weekDays.push(dayNum);
          
          // Count work holidays for this day
          const { work } = getHolidaysForDate(dayNum, y, m);
          workHolidayCount += work.length;
          currentDate++;
        } else {
          weekDays.push(null);
        }
      }

      weeks.push({
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
        workHolidayCount,
        days: weekDays
      });

      // Move to next week
      weekStart.setDate(weekStart.getDate() + 7);
      weekEnd.setDate(weekEnd.getDate() + 7);
    }

    return weeks;
  };

  return (
    <div className={`calendar calendar-${size}`}>
      <div className="calendar-3month">
        {months.map((monthInfo) => (
          <div
            key={`${monthInfo.year}-${monthInfo.month}`}
            className={`calendar-month ${monthInfo.isCurrent ? 'current-month' : ''}`}
          >
            <div className="calendar-header">
              <h2>{monthNames[monthInfo.month - 1]} {monthInfo.year}</h2>
              {monthInfo.isCurrent && <span className="current-badge">Current</span>}
            </div>

            <div className="calendar-grid" role="grid" aria-label={`${monthNames[monthInfo.month - 1]} ${monthInfo.year} calendar`}>
              {dayNames.map((day, index) => (
                <div 
                  key={day} 
                  className="calendar-day-header"
                  role="columnheader"
                  aria-label={day}
                >
                  {day}
                </div>
              ))}

              {calculateWeeks(monthInfo.year, monthInfo.month).map((week, weekIndex) => (
                <React.Fragment key={`week-${weekIndex}`}>
                  {week.days.map((date, idx) => {
                    if (date === null) {
                      return <div
                        key={`empty-${weekIndex}-${idx}`}
                        className={`calendar-day empty ${week.workHolidayCount > 0 ? `week-with-work-holidays week-${week.workHolidayCount === 1 ? 'single' : 'multiple'}` : ''}`}
                        role="gridcell"
                        aria-hidden="true"
                      />;
                    }

                    const { regular, work } = getHolidaysForDate(date, monthInfo.year, monthInfo.month);
                    const hasHolidays = regular.length > 0 || work.length > 0;

                    return (
                      <div
                        key={date}
                        className={`calendar-day ${isToday(date, monthInfo.year, monthInfo.month) ? 'today' : ''} ${
                          hasHolidays ? 'has-holiday' : ''
                        } ${
                          week.workHolidayCount > 0 ? `week-with-work-holidays week-${week.workHolidayCount === 1 ? 'single' : 'multiple'}` : ''
                        }`}
                        role="gridcell"
                        aria-label={getDayAriaLabel(date, monthInfo.year, monthInfo.month)}
                        aria-selected={isToday(date, monthInfo.year, monthInfo.month)}
                        tabIndex={isToday(date, monthInfo.year, monthInfo.month) ? 0 : -1}
                      >
                        <span className="day-number" aria-hidden="true">{date}</span>
                        {hasHolidays && (
                          <div className="holiday-markers" aria-hidden="true">
                            {regular.slice(0, 1).map((holiday) => (
                              <span
                                key={holiday.id}
                                className="holiday-marker regular"
                                title={getSafeHolidayName(holiday.name)}
                                aria-label={`Public Holiday: ${getSafeHolidayName(holiday.name)}`}
                              >
                                🎉
                              </span>
                            ))}
                            {work.slice(0, 1).map((holiday) => {
                              const isPublicHoliday = (holiday as any).isPublicHoliday === true;
                              return (
                                <span
                                  key={holiday.id}
                                  className={`holiday-marker work ${isPublicHoliday ? 'public' : ''}`}
                                  title={getSafeHolidayName(holiday.name)}
                                  aria-label={`Work Holiday: ${getSafeHolidayName(holiday.name)}`}
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
                </React.Fragment>
              ))}
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
          <div className="legend-color week-single"></div>
          <span>Week with 1 Work Holiday</span>
        </div>
        <div className="legend-item">
          <div className="legend-color week-multiple"></div>
          <span>Week with 2+ Work Holidays</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
