/**
 * Holidays Redux Slice
 *
 * Manages holiday data state with async thunks for API calls
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { holidayApiClient } from '../../services/api/HolidayApiClient.js';
import type { RegularHoliday, WorkHoliday, HolidayError } from '../../types/holiday.js';

// State interface
interface HolidaysState {
  // Selected date
  selectedDate: string;

  // Calendar view state
  currentYear: number;
  currentMonth: number;
  selectedCountry: string;

  // Data - now supports multiple months
  regularHolidays: Record<string, RegularHoliday[]>; // key: "YYYY-MM"
  workHolidays: Record<string, WorkHoliday[]>; // key: "YYYY-MM"

  // State
  loading: boolean;
  error: HolidayError | null;
  lastFetchedAt: number | null;
}

// Initial state
const initialState: HolidaysState = {
  selectedDate: new Date().toISOString().split('T')[0],
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  selectedCountry: 'DE',
  regularHolidays: {},
  workHolidays: {},
  loading: false,
  error: null,
  lastFetchedAt: null
};

// Async thunks
export const fetchRegularHolidays = createAsyncThunk(
  'holidays/fetchRegularHolidays',
  async (
    { country, year, month }: { country: string; year: number; month: number },
    { rejectWithValue }
  ) => {
    try {
      const holidays = await holidayApiClient.fetchHolidays({ country, year, month });
      return holidays;
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch regular holidays',
        retryable: error.statusCode !== 400
      });
    }
  }
);

export const fetchWorkHolidays = createAsyncThunk(
  'holidays/fetchWorkHolidays',
  async (
    { year, month, department }: { year: number; month: number; department?: string },
    { rejectWithValue }
  ) => {
    try {
      const holidays = await holidayApiClient.fetchWorkHolidays({ year, month, department });
      return holidays;
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch work holidays',
        retryable: error.statusCode !== 400
      });
    }
  }
);

export const fetchAllHolidays = createAsyncThunk(
  'holidays/fetchAllHolidays',
  async (
    { country, year, month, department }: { country: string; year: number; month: number; department?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Fetch both in parallel
      const [regularHolidays, workHolidays] = await Promise.all([
        holidayApiClient.fetchHolidays({ country, year, month }),
        holidayApiClient.fetchWorkHolidays({ year, month, department })
      ]);

      return { regularHolidays, workHolidays };
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch holidays',
        retryable: error.statusCode !== 400
      });
    }
  }
);

export const fetchHolidaysForRange = createAsyncThunk(
  'holidays/fetchHolidaysForRange',
  async (
    {
      country,
      year,
      startMonth,
      endMonth,
      department
    }: {
      country: string;
      year: number;
      startMonth: number;
      endMonth: number;
      department?: string
    },
    { rejectWithValue }
  ) => {
    try {
      // Fetch holidays for the range using the new range APIs
      const [regularHolidaysRange, workHolidaysRange] = await Promise.all([
        holidayApiClient.fetchHolidaysByRange({
          country,
          year,
          startMonth,
          endMonth
        }),
        holidayApiClient.fetchWorkHolidaysByRange({
          year,
          startMonth,
          endMonth,
          department
        })
      ]);

      return { regularHolidaysRange, workHolidaysRange };
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch holidays for range',
        retryable: error.statusCode !== 400
      });
    }
  }
);

// Slice
const holidaysSlice = createSlice({
  name: 'holidays',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setCurrentMonth: (state, action: PayloadAction<number>) => {
      state.currentMonth = action.payload;
    },
    setCurrentYear: (state, action: PayloadAction<number>) => {
      state.currentYear = action.payload;
    },
    setSelectedCountry: (state, action: PayloadAction<string>) => {
      state.selectedCountry = action.payload;
    },
    navigateMonth: (state, action: PayloadAction<number>) => {
      const newMonth = state.currentMonth + action.payload;
      if (newMonth > 12) {
        state.currentMonth = 1;
        state.currentYear++;
      } else if (newMonth < 1) {
        state.currentMonth = 12;
        state.currentYear--;
      } else {
        state.currentMonth = newMonth;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchRegularHolidays - single month
    builder
      .addCase(fetchRegularHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegularHolidays.fulfilled, (state, action) => {
        state.loading = false;
        // For backward compatibility, store in a generic key
        state.regularHolidays['current'] = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchRegularHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as HolidayError;
      });

    // fetchWorkHolidays - single month
    builder
      .addCase(fetchWorkHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkHolidays.fulfilled, (state, action) => {
        state.loading = false;
        // For backward compatibility, store in a generic key
        state.workHolidays['current'] = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchWorkHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as HolidayError;
      });

    // fetchAllHolidays - single month
    builder
      .addCase(fetchAllHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHolidays.fulfilled, (state, action) => {
        state.loading = false;
        // For backward compatibility, store in a generic key
        state.regularHolidays['current'] = action.payload.regularHolidays;
        state.workHolidays['current'] = action.payload.workHolidays;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchAllHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as HolidayError;
      });

    // fetchHolidaysForRange - multiple months
    builder
      .addCase(fetchHolidaysForRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHolidaysForRange.fulfilled, (state, action) => {
        state.loading = false;

        const { year } = action.meta.arg; // Get year from the original arguments

        console.log('Redux: Storing holidays for range', action.payload);

        // Store regular holidays by month - they are already in YYYY-MM format
        Object.assign(state.regularHolidays, action.payload.regularHolidaysRange);
        console.log('Redux: Regular holidays stored:', state.regularHolidays);

        // Store work holidays by month - convert month number to YYYY-MM format
        Object.entries(action.payload.workHolidaysRange).forEach(([monthNum, holidays]) => {
          const monthKey = `${year}-${String(monthNum).padStart(2, '0')}`;
          state.workHolidays[monthKey] = holidays;
        });
        console.log('Redux: Work holidays stored:', state.workHolidays);

        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchHolidaysForRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as HolidayError;
        console.error('Redux: fetchHolidaysForRange failed:', action.payload);
      });
  }
});

// Export actions
export const {
  setSelectedDate,
  setCurrentMonth,
  setCurrentYear,
  setSelectedCountry,
  navigateMonth,
  clearError
} = holidaysSlice.actions;

// Export reducer
export default holidaysSlice.reducer;
