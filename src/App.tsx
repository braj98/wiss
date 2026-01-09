/**
 * Main App Component
 * Reactive Holiday Calendar Application
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/index.js';
import { fetchHolidaysForRange } from './store/slices/holidaysSlice.js';
import Calendar from './components/Calendar.js';
import HolidayList from './components/HolidayList.js';
import './App.css';

function App(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.holidays);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [calendarSize, setCalendarSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if data is stale (>30 days)
  const isDataStale = lastFetched ? Date.now() - lastFetched > 30 * 24 * 60 * 60 * 1000 : false;

  // Fetch holidays when year/month/country changes
  useEffect(() => {
    // Calculate the 3-month range for the calendar view
    // Handle cross-year boundaries by fetching appropriate ranges
    const months = [];

    // Previous month
    if (selectedMonth === 1) {
      months.push({ year: selectedYear - 1, month: 12 });
    } else {
      months.push({ year: selectedYear, month: selectedMonth - 1 });
    }

    // Current month
    months.push({ year: selectedYear, month: selectedMonth });

    // Next month
    if (selectedMonth === 12) {
      months.push({ year: selectedYear + 1, month: 1 });
    } else {
      months.push({ year: selectedYear, month: selectedMonth + 1 });
    }

    // Group by year to handle cross-year ranges
    const byYear = months.reduce((acc, item) => {
      if (!acc[item.year]) acc[item.year] = [];
      acc[item.year].push(item.month);
      return acc;
    }, {} as Record<number, number[]>);

    // Fetch for each year
    Object.entries(byYear).forEach(([yearStr, yearMonths]) => {
      const year = parseInt(yearStr);
      const sortedMonths = yearMonths.sort((a, b) => a - b);

      // For each contiguous range within the year
      let start = sortedMonths[0];
      for (let i = 1; i <= sortedMonths.length; i++) {
        if (i === sortedMonths.length || sortedMonths[i] !== sortedMonths[i-1] + 1) {
          // End of range
          const end = sortedMonths[i-1];
          dispatch(fetchHolidaysForRange({
            country: selectedCountry,
            year,
            startMonth: start,
            endMonth: end
          }));
          start = sortedMonths[i];
        }
      }
    });
  }, [dispatch, selectedYear, selectedMonth, selectedCountry]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Calculate navigation boundaries (±11 months from current)
  const minDate = new Date(currentYear, currentMonth - 12, 1); // 11 months before
  const maxDate = new Date(currentYear, currentMonth + 11, 1);  // 11 months after
  
  const isAtMinBoundary = selectedYear < minDate.getFullYear() || 
    (selectedYear === minDate.getFullYear() && selectedMonth <= minDate.getMonth() + 1);
  const isAtMaxBoundary = selectedYear > maxDate.getFullYear() || 
    (selectedYear === maxDate.getFullYear() && selectedMonth >= maxDate.getMonth() + 1);

  const handlePreviousMonth = (): void => {
    if (isAtMinBoundary) return; // Prevent navigation beyond boundary
    
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (): void => {
    if (isAtMaxBoundary) return; // Prevent navigation beyond boundary
    
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleGoToToday = (): void => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const countryCodes = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>📅 MyCalApp</h1>
        <p className="subtitle">Holiday Calendar & Work Schedule</p>

        <div className="app-controls">
          <div className="control-group">
            <label htmlFor="country-select">Country:</label>
            <select
              id="country-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              aria-label="Select country for holidays"
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group size-control">
            <label htmlFor="size-select">Size:</label>
            <select
              id="size-select"
              value={calendarSize}
              onChange={(e) => setCalendarSize(e.target.value as 'small' | 'medium' | 'large')}
              aria-label="Select calendar size"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </header>

      <div className="controls">
        <div className="control-group tabs" role="tablist">
          <button
            className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
            role="tab"
            aria-selected={activeTab === 'calendar'}
            aria-controls="calendar-panel"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('calendar');
              }
            }}
          >
            Calendar View
          </button>
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
            role="tab"
            aria-selected={activeTab === 'list'}
            aria-controls="list-panel"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('list');
              }
            }}
          >
            List View
          </button>
        </div>

        <div className="control-group navigation" role="group" aria-label="Calendar navigation">
          <button
            onClick={handlePreviousMonth}
            className="nav-btn"
            disabled={isAtMinBoundary}
            title={isAtMinBoundary ? "Cannot navigate further back (11-month limit)" : "Previous month"}
            aria-label="Previous month"
            aria-disabled={isAtMinBoundary}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePreviousMonth();
              }
            }}
          >
            ◀
          </button>
          <span className="current-date" aria-live="polite" aria-atomic="true">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="nav-btn"
            disabled={isAtMaxBoundary}
            title={isAtMaxBoundary ? "Cannot navigate further ahead (11-month limit)" : "Next month"}
            aria-label="Next month"
            aria-disabled={isAtMaxBoundary}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNextMonth();
              }
            }}
          >
            ▶
          </button>
          <button
            onClick={handleGoToToday}
            className="today-btn"
            aria-label="Go to today"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGoToToday();
              }
            }}
          >
            Today
          </button>
          {(isAtMinBoundary || isAtMaxBoundary) && (
            <span className="boundary-indicator" role="alert" aria-live="polite">
              ⚠️ 11-month limit
            </span>
          )}
        </div>
      </div>

      {!isOnline && (
        <div className="offline-indicator" role="alert" aria-live="polite">
          <span className="offline-icon">📴</span>
          <span>You're offline. Showing cached data.</span>
        </div>
      )}

      {isOnline && isDataStale && (
        <div className="stale-data-indicator" role="alert" aria-live="polite">
          <span className="stale-icon">⚠️</span>
          <span>Data may be stale. Refresh recommended.</span>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading holidays...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error.message}</span>
        </div>
      )}

      <main className="app-content">
        {activeTab === 'calendar' ? (
          <div 
            id="calendar-panel" 
            role="tabpanel"
            aria-labelledby="calendar-tab"
          >
            <Calendar
              year={selectedYear}
              month={selectedMonth}
              country={selectedCountry}
              size={calendarSize}
            />
          </div>
        ) : (
          <div 
            id="list-panel" 
            role="tabpanel"
            aria-labelledby="list-tab"
          >
            <HolidayList
              year={selectedYear}
              month={selectedMonth}
              country={selectedCountry}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Holidays provided by{' '}
          <a href="https://holidayapi.com" target="_blank" rel="noopener noreferrer">
            HolidayAPI
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
