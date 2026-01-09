/**
 * HolidayList Component
 * Displays a list view of holidays for the selected month
 */

import React from 'react';
import { useAppSelector } from '../store/index.js';
import type { RegularHoliday, WorkHoliday } from '../types/holiday.js';
import './HolidayList.css';

interface HolidayListProps {
  year: number;
  month: number;
  country: string;
}

function HolidayList({ year, month, country }: HolidayListProps): React.ReactElement {
  const { regularHolidays, workHolidays, loading } = useAppSelector((state) => state.holidays);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get holidays for the specific month
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const monthRegularHolidays = regularHolidays[monthKey] || [];
  const monthWorkHolidays = workHolidays[monthKey] || [];

  // Combine and sort holidays by date
  const allHolidays = [
    ...monthRegularHolidays.map((h) => ({ ...h, type: 'regular' as const })),
    ...monthWorkHolidays.map((h) => ({ ...h, type: 'work' as const }))
  ].sort((a, b) => a.date.localeCompare(b.date));

  // Group holidays by date
  const holidaysByDate = allHolidays.reduce((acc, holiday) => {
    if (!acc[holiday.date]) {
      acc[holiday.date] = [];
    }
    acc[holiday.date].push(holiday);
    return acc;
  }, {} as Record<string, typeof allHolidays>);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayOfWeek = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="holiday-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading holidays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="holiday-list">
      <div className="holiday-list-header">
        <h2>Holidays for {monthNames[month - 1]} {year}</h2>
        <div className="holiday-counts">
          <span className="count-badge regular">
            🎉 {monthRegularHolidays.length} Public Holidays
          </span>
          <span className="count-badge work">
            💼 {monthWorkHolidays.length} Work Holidays
          </span>
        </div>
      </div>

      {allHolidays.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <h3>No holidays this month</h3>
          <p>There are no public or work holidays scheduled for {monthNames[month - 1]} {year}.</p>
        </div>
      ) : (
        <div className="holiday-items">
          {Object.entries(holidaysByDate).map(([date, holidays]) => (
            <div key={date} className="holiday-group">
              <div className="holiday-date-header">
                <span className="day-abbr">{getDayOfWeek(date)}</span>
                <span className="full-date">{formatDate(date)}</span>
              </div>
              <div className="holiday-group-items">
                {holidays.map((holiday) => (
                  <div
                    key={`${holiday.type}-${holiday.id}`}
                    className={`holiday-item ${holiday.type}`}
                  >
                    <div className="holiday-icon">
                      {holiday.type === 'regular' ? '🎉' : '💼'}
                    </div>
                    <div className="holiday-details">
                      <h4 className="holiday-name">{holiday.name}</h4>
                      <p className="holiday-description">
                        {holiday.description || 'No description available'}
                      </p>
                      {holiday.type === 'work' && 'department' in holiday && (
                        <span className="department-tag">
                          {(holiday as any).department}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HolidayList;
