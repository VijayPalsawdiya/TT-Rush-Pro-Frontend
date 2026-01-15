# Backend API Integration

This directory contains service files for communicating with the TT Rush Pro backend API.

## Files

### `api.ts`
Base API client with:
- HTTP methods (GET, POST, PUT, DELETE)
- Authentication token management
- Automatic token refresh
- Error handling

### `authService.ts`
Authentication-related API calls:
- `googleLogin(idToken)` - Login with Google ID token → `/auth/google`
- `refreshAccessToken(refreshToken)` - Refresh access token → `/auth/refresh`
- `logout()` - Logout user → `/auth/logout`
- `updateFCMToken(fcmToken)` - Update FCM token for push notifications
- `getProfile()` - Get user profile
- `updateProfile(updates)` - Update user profile

## Usage

```typescript
import { authService } from '@/services/authService';

// Login with Google
const { user, accessToken, refreshToken } = await authService.googleLogin(idToken);

// Logout
await authService.logout();

// Update profile
const updatedUser = await authService.updateProfile({ name: 'New Name' });
```

## Configuration

The API base URL is configured in `api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

For production, update this to your deployed backend URL.

## Token Management

Tokens are automatically managed:
- Access tokens are stored in AsyncStorage (`@access_token`)
- Refresh tokens are stored in AsyncStorage (`@refresh_token`)
- Expired access tokens are automatically refreshed
- All authenticated requests include the Bearer token
