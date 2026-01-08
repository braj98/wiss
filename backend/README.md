# Backend API Server

Backend for the Reactive Web Calendar Application

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Testing

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run test:services # Service tests only
```

## Building

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── services/
│   ├── ExternalHolidayApiClient.ts
│   ├── HolidayService.ts
│   ├── WorkHolidayService.ts
│   └── cache/
│       └── CacheStore.ts
├── routes/
│   └── holidays.routes.ts
├── data/
│   └── workHolidays.ts
├── utils/
│   ├── validators.ts
│   └── errorHandler.ts
├── types/
│   └── index.ts
├── __tests__/
│   ├── services/
│   │   ├── ExternalHolidayApiClient.test.ts
│   │   ├── HolidayService.test.ts
│   │   └── WorkHolidayService.test.ts
│   └── api/
│       └── holidays.routes.test.ts
├── app.ts
└── server.ts
```
