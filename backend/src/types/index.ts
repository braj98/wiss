export interface RegularHoliday {
  id: string;
  name: string;
  date: string; // ISO 8601: YYYY-MM-DD
  country: string; // ISO 3166-1 alpha-2
  region?: string | null;
  category: 'national' | 'state' | 'religious' | 'cultural' | 'observance';
  description?: string;
  isPublicHoliday: boolean;
}

export interface WorkHoliday {
  id: string;
  name: string;
  date: string; // ISO 8601: YYYY-MM-DD
  department?: string;
  description?: string;
  category: 'company' | 'team' | 'department' | 'event' | 'break' | 'company-event' | 'public-holiday';
}

export interface AggregatedHoliday {
  date: string;
  regularHolidays: RegularHoliday[];
  workHolidays: WorkHoliday[];
  primaryType: 'regular' | 'work' | null;
  hasBoth: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  supportedCountries?: string[];
}

export interface ExternalApiHoliday {
  date: string;
  name?: string;
  country?: { id: string; name: string };
  type?: string[];
  description?: string;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
