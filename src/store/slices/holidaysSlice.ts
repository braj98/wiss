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
  
  // Data
  regularHolidays: RegularHoliday[];
  workHolidays: WorkHoliday[];
  
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
  regularHolidays: [],
  workHolidays: [],
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
    // fetchRegularHolidays
    builder
      .addCase(fetchRegularHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegularHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.regularHolidays = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchRegularHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as HolidayError;
      });

    // fetchWorkHolidays
    builder
      .addCase(fetchWorkHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.workHolidays = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchWorkHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as HolidayError;
      });

    // fetchAllHolidays
    builder
      .addCase(fetchAllHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.regularHolidays = action.payload.regularHolidays;
        state.workHolidays = action.payload.workHolidays;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchAllHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as HolidayError;
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
