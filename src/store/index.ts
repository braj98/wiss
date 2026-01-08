/**
 * Redux Store Configuration
 *
 * Central store configuration with all reducers
 */

import { configureStore } from '@reduxjs/toolkit';
import holidaysReducer from './slices/holidaysSlice.js';

// Configure store with reducers
export const store = configureStore({
  reducer: {
    holidays: holidaysReducer
  },
  // Enable Redux DevTools in development
  devTools: import.meta.env.DEV
});

// TypeScript type inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for useSelector and useDispatch
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;
