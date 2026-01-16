# API URLs Configuration

This document explains the centralized API URLs configuration system in the TTRushPro frontend application.

## Overview

The `config/urls.ts` file provides a centralized location for managing all API endpoints and base URLs used throughout the application. This approach offers several benefits:

- **Single Source of Truth**: All API endpoints are defined in one place
- **Easy Maintenance**: Update endpoints in one location instead of scattered across multiple files
- **Type Safety**: TypeScript constants ensure compile-time checking
- **Environment Management**: Automatic URL switching based on environment and platform

## File Structure

```
config/
├── api.ts      # Legacy config (now imports from urls.ts)
└── urls.ts     # New centralized URLs configuration
```

## Base URL Configuration

The base URL automatically adjusts based on:

1. **Environment** (`__DEV__` vs Production)
2. **Platform** (iOS vs Android)
3. **Device Type** (Emulator vs Physical Device)

### Development URLs

```typescript
DEVELOPMENT: {
    LOCAL: 'http://localhost:3000/api',
    ANDROID_EMULATOR: 'http://10.0.2.2:3000/api',
    PHYSICAL_DEVICE: 'http://192.168.1.100:3000/api',
}
```

### Production URL

```typescript
PRODUCTION: 'https://your-production-api.com/api'
```

## API Endpoints

All endpoints are organized by category:

### Authentication Endpoints

```typescript
API_ENDPOINTS.AUTH.GOOGLE_LOGIN      // '/auth/google'
API_ENDPOINTS.AUTH.REFRESH_TOKEN     // '/auth/refresh'
API_ENDPOINTS.AUTH.LOGOUT            // '/auth/logout'
```

### User Endpoints

```typescript
API_ENDPOINTS.USER.PROFILE           // '/users/profile'
API_ENDPOINTS.USER.FCM_TOKEN         // '/users/fcm-token'
API_ENDPOINTS.USER.STATS             // '/stats'
```

### Upload Endpoints

```typescript
API_ENDPOINTS.UPLOAD.IMAGE           // '/upload/image'
API_ENDPOINTS.UPLOAD.IMAGE_DELETE    // '/upload/image/delete'
```

### Match Endpoints

```typescript
API_ENDPOINTS.MATCH.CREATE                    // '/matches'
API_ENDPOINTS.MATCH.UPDATE_RESULT(matchId)    // '/matches/{matchId}/result'
API_ENDPOINTS.MATCH.GET_BY_ID(matchId)        // '/matches/{matchId}'
API_ENDPOINTS.MATCH.LIST                      // '/matches'
```

### Challenge Endpoints

```typescript
API_ENDPOINTS.CHALLENGE.CREATE                      // '/challenges'
API_ENDPOINTS.CHALLENGE.LIST                        // '/challenges'
API_ENDPOINTS.CHALLENGE.GET_BY_ID(challengeId)      // '/challenges/{challengeId}'
API_ENDPOINTS.CHALLENGE.ACCEPT(challengeId)         // '/challenges/{challengeId}/accept'
API_ENDPOINTS.CHALLENGE.REJECT(challengeId)         // '/challenges/{challengeId}/reject'
```

### Leaderboard Endpoints

```typescript
API_ENDPOINTS.LEADERBOARD.TOP_PLAYERS           // '/leaderboard'
API_ENDPOINTS.LEADERBOARD.WITH_LIMIT(limit)     // '/leaderboard?limit={limit}'
```

### Home/Dashboard Endpoints

```typescript
API_ENDPOINTS.HOME.DASHBOARD         // '/home'
```

### Notification Endpoints

```typescript
API_ENDPOINTS.NOTIFICATION.LIST                         // '/notifications'
API_ENDPOINTS.NOTIFICATION.MARK_READ(notificationId)    // '/notifications/{notificationId}/read'
API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ                // '/notifications/read-all'
```

## Usage Examples

### Basic Usage

```typescript
import { API_ENDPOINTS } from '@/config/urls';
import { api } from '@/services/api';

// Get user profile
const response = await api.get(API_ENDPOINTS.USER.PROFILE);

// Update profile
await api.put(API_ENDPOINTS.USER.PROFILE, { name: 'New Name' });

// Create a match
await api.post(API_ENDPOINTS.MATCH.CREATE, matchData);

// Update match result (dynamic endpoint)
await api.put(API_ENDPOINTS.MATCH.UPDATE_RESULT(matchId), resultData);
```

### Using Helper Functions

```typescript
import { buildUrl, buildUrlWithParams } from '@/config/urls';

// Build complete URL
const url = buildUrl('/users/profile');
// Result: 'http://10.0.2.2:3000/api/users/profile' (on Android emulator)

// Build URL with query parameters
const leaderboardUrl = buildUrlWithParams('/leaderboard', { 
    limit: 100, 
    sortBy: 'ranking' 
});
// Result: 'http://10.0.2.2:3000/api/leaderboard?limit=100&sortBy=ranking'
```

### Getting Base URL

```typescript
import { getBaseUrl } from '@/config/urls';

const baseUrl = getBaseUrl();
// Returns appropriate URL based on environment and platform
```

## Migration Guide

If you have existing code using hardcoded endpoints, update them as follows:

### Before

```typescript
await api.get('/users/profile');
await api.post('/auth/logout');
await api.put(`/matches/${matchId}/result`, data);
```

### After

```typescript
import { API_ENDPOINTS } from '@/config/urls';

await api.get(API_ENDPOINTS.USER.PROFILE);
await api.post(API_ENDPOINTS.AUTH.LOGOUT);
await api.put(API_ENDPOINTS.MATCH.UPDATE_RESULT(matchId), data);
```

## Configuration for Physical Devices

When testing on a physical device, update the `PHYSICAL_DEVICE` URL in `config/urls.ts`:

1. Find your computer's local IP address:
   - **macOS**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: `ipconfig`
   - **Linux**: `ip addr show`

2. Update the configuration:

```typescript
DEVELOPMENT: {
    // ...
    PHYSICAL_DEVICE: 'http://YOUR_LOCAL_IP:3000/api',  // e.g., 'http://192.168.1.100:3000/api'
}
```

## Production Deployment

Before deploying to production:

1. Update the production URL in `config/urls.ts`:

```typescript
PRODUCTION: 'https://your-actual-production-api.com/api'
```

2. Ensure `__DEV__` is `false` in production builds (handled automatically by React Native)

## Best Practices

1. **Always use constants**: Never hardcode endpoint strings in service files
2. **Use dynamic endpoints**: For endpoints with parameters, use functions like `UPDATE_RESULT(matchId)`
3. **Centralize changes**: Add new endpoints to `urls.ts` before using them
4. **Type safety**: Leverage TypeScript's `as const` for compile-time checking
5. **Documentation**: Update this README when adding new endpoint categories

## Troubleshooting

### API calls fail on Android emulator

- Ensure you're using `10.0.2.2` instead of `localhost`
- The `getBaseUrl()` function handles this automatically

### API calls fail on physical device

- Verify your computer's local IP address
- Ensure both devices are on the same network
- Update `PHYSICAL_DEVICE` URL in `config/urls.ts`

### Production API not working

- Check that the production URL is correct
- Verify CORS settings on the backend
- Ensure SSL certificates are valid (for HTTPS)

## Related Files

- `config/urls.ts` - Main configuration file
- `config/api.ts` - Legacy config (backward compatible)
- `services/api.ts` - API client implementation
- `services/authService.ts` - Authentication service
- `services/uploadService.ts` - Upload service
- `services/examples.ts` - Usage examples
