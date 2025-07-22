# API Documentation

This document outlines the API endpoints and data structures used by Track N'
Stick.

## Base Configuration

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Authentication**: Uses Clerk authentication with JWT tokens
- **HTTP Client**: Axios with interceptors for authentication
- **Content Type**: `application/json`

## Authentication

All API requests require authentication via Clerk JWT tokens. The axios instance
automatically includes the authorization header for authenticated requests.

## Endpoints

### Habits

#### Get Habits

```http
GET /api/v1/habits
```

**Query Parameters:**

- `date` (string, required): ISO date string for the specific date
- `timeZone` (string, required): User's timezone

**Response:**

```typescript
Habit[]
```

#### Add Habit

```http
POST /api/v1/habits
```

**Request Body:**

```typescript
{
  name: string;
  icon: keyof typeof HabitsIcons;
  frequency: Frequency[];
  startDate: Date;
  endDate?: Date;
}
```

**Response:**

```typescript
{
  message: string;
  habitId: string;
}
```

#### Update Habit

```http
PUT /api/v1/habits/{habitId}
```

**Path Parameters:**

- `habitId` (string, required): The habit ID

**Request Body:**

```typescript
Partial<{
  name: string;
  icon: keyof typeof HabitsIcons;
  frequency: Frequency[];
  startDate: Date;
  endDate?: Date;
}>;
```

**Response:**

```typescript
{
  message: string;
  habitId: string;
}
```

#### Delete Habit

```http
DELETE /api/v1/habits/{habitId}
```

**Path Parameters:**

- `habitId` (string, required): The habit ID

**Response:**

```typescript
{
  message: string;
  habitId: string;
}
```

#### Toggle Habit Completion

```http
POST /api/v1/habits/{habitId}/trackers
```

**Path Parameters:**

- `habitId` (string, required): The habit ID

**Request Body:**

```typescript
{
  timestamp: string; // ISO date string
  timeZone: string;
}
```

**Response:**

```typescript
{
  message: string;
  trackerId?: string;
}
```

#### Get Habit Statistics

```http
GET /api/v1/habits/{habitId}/stats
```

**Path Parameters:**

- `habitId` (string, required): The habit ID

**Query Parameters:**

- `timeZone` (string, required): User's timezone

**Response:**

```typescript
HabitStats;
```

### Progress

#### Get Progress Overview

```http
GET /api/v1/progress/overview
```

**Query Parameters:**

- `timeZone` (string, required): User's timezone
- `startDate` (string, optional): ISO date string for range start
- `endDate` (string, optional): ISO date string for range end

**Response:**

```typescript
ProgressOverviewResponse;
```

#### Get Progress History

```http
GET /api/v1/progress/history
```

**Query Parameters:**

- `timeZone` (string, required): User's timezone
- `startDate` (string, optional): ISO date string for range start
- `endDate` (string, optional): ISO date string for range end

**Response:**

```typescript
ProgressHistoryResponse;
```

#### Get Progress Streaks

```http
GET /api/v1/progress/streaks
```

**Query Parameters:**

- `timeZone` (string, required): User's timezone

**Response:**

```typescript
ProgressStreaksResponse;
```

## Data Types

### Habit

```typescript
interface Habit {
  id?: string;
  name: string;
  icon: keyof typeof HabitsIcons;
  frequency: Frequency[];
  completed: boolean;
  startDate: Date;
  endDate?: Date;
}
```

### Frequency

```typescript
type Frequency =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
  | 'daily'
  | 'weekdays'
  | 'weekends';
```

### HabitStats

```typescript
interface HabitStats {
  streak: number;
  longestStreak: number;
  totalCompletions: number;
  lastCompleted: string;
}
```

### ProgressOverview

```typescript
interface ProgressOverview {
  currentStreak: number;
  longestStreak: number;
  days: HistoryDates[]; // Note: In API responses, this is named "history"
}
```

> **Implementation Note**: There is a discrepancy between the frontend type
> definition and the API response. The API returns `history: HistoryDates[]`
> while the frontend type expects `days: HistoryDates[]`. This should be
> reconciled in future updates.

### HistoryDates

```typescript
interface HistoryDates {
  date: string;
  completionRate: number;
}
```

> **Note**: In the frontend codebase, this same data structure is also used as
> `InsightData` in some UI components. Both interfaces are identical and
> represent the same data from the API.

### ProgressHistoryResponse

```typescript
interface ProgressHistoryResponse {
  history: HistoryDates[];
}
```

### ProgressStreaksResponse

```typescript
interface ProgressStreaksResponse {
  currentStreak: number;
  longestStreak: number;
}
```

### ProgressOverviewResponse

```typescript
interface ProgressOverviewResponse {
  history: HistoryDates[];
  currentStreak: number;
  longestStreak: number;
}
```

## Error Handling

### Error Response Format

```typescript
{
  error: string;
  message: string;
  statusCode: number;
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Client-Side Error Handling

The application implements comprehensive error handling:

1. **Network Errors**: Handled by axios interceptors
2. **Authentication Errors**: Automatic token refresh via Clerk
3. **Validation Errors**: Form validation with user feedback
4. **Optimistic Updates**: Automatic rollback on API failures
5. **User Feedback**: Toast notifications for all error states

## Rate Limiting

API endpoints may be rate-limited. The client should handle:

- `429 Too Many Requests` responses
- Exponential backoff for retries
- Graceful degradation of functionality

## Caching Strategy

The application uses SWR for intelligent caching:

- **Cache Keys**: Based on endpoint + parameters
- **Revalidation**: On focus, reconnect, and interval
- **Mutations**: Optimistic updates with rollback
- **Background Updates**: Automatic data freshening

## Development

### API Client Configuration

```typescript
// src/services/api/axiosInstance.ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Adding New Endpoints

1. Define the API function in the appropriate feature's `api/index.ts`
2. Add TypeScript interfaces for request/response
3. Create or update the corresponding hook in `hooks/`
4. Update this documentation

### Testing API Endpoints

Use tools like:

- **Postman**: For manual API testing
- **curl**: For command-line testing
- **Browser DevTools**: For debugging network requests

## Security Considerations

- All endpoints require authentication
- JWT tokens are automatically included in requests
- Sensitive data is never logged or exposed
- CORS is properly configured for the frontend domain
- Input validation is performed on both client and server
