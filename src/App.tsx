/**
 * Main App Component
 * Reactive Holiday Calendar Application
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/index.js';
import { fetchRegularHolidays, fetchWorkHolidays } from './store/slices/holidaysSlice.js';
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

  // Fetch holidays when year/month/country changes
  useEffect(() => {
    dispatch(fetchRegularHolidays({ country: selectedCountry, year: selectedYear, month: selectedMonth }));
    dispatch(fetchWorkHolidays({ year: selectedYear, month: selectedMonth }));
  }, [dispatch, selectedYear, selectedMonth, selectedCountry]);

  const handlePreviousMonth = (): void => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (): void => {
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
      </header>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="country-select">Country:</label>
          <select
            id="country-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group navigation">
          <button onClick={handlePreviousMonth} className="nav-btn">◀</button>
          <span className="current-date">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </span>
          <button onClick={handleNextMonth} className="nav-btn">▶</button>
          <button onClick={handleGoToToday} className="today-btn">Today</button>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar View
        </button>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          List View
        </button>
      </div>

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
          <Calendar
            year={selectedYear}
            month={selectedMonth}
            country={selectedCountry}
          />
        ) : (
          <HolidayList
            year={selectedYear}
            month={selectedMonth}
            country={selectedCountry}
          />
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
