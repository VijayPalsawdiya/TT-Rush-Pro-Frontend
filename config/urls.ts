/**
 * API URLs Configuration
 * 
 * Centralized configuration for all API endpoints and base URLs
 * This file contains all backend API endpoints used throughout the application
 */

import { Platform } from 'react-native';

// ============================================
// BASE URL CONFIGURATION
// ============================================

/**
 * API Base URL Configuration
 * Update these values based on your environment
 */
export const BASE_URLS = {
    // Development URLs
    DEVELOPMENT: {
        LOCAL: 'http://localhost:3000/api',
        ANDROID_EMULATOR: 'http://10.0.2.2:3000/api',
        // For physical devices, replace with your computer's local IP
        PHYSICAL_DEVICE: 'http://192.168.1.100:3000/api',
    },

    // Production URL
    PRODUCTION: 'https://your-production-api.com/api',

    // Staging URL (optional)
    STAGING: 'https://your-staging-api.com/api',
};

/**
 * Get the appropriate API base URL based on environment and platform
 */
export const getBaseUrl = (): string => {
    if (!__DEV__) {
        return BASE_URLS.PRODUCTION;
    }

    // In development, adjust URL based on platform
    if (Platform.OS === 'android') {
        // Android emulator uses 10.0.2.2 to access host machine's localhost
        return BASE_URLS.DEVELOPMENT.ANDROID_EMULATOR;
    }

    // iOS simulator can use localhost directly
    return BASE_URLS.DEVELOPMENT.LOCAL;
};

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
    GOOGLE_LOGIN: '/auth/google',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
} as const;

/**
 * User Endpoints
 */
export const USER_ENDPOINTS = {
    LIST: '/users',
    PROFILE: '/users/profile',
    FCM_TOKEN: '/users/fcm-token',
    STATS: '/stats',
} as const;

/**
 * Upload Endpoints
 */
export const UPLOAD_ENDPOINTS = {
    IMAGE: '/upload/image',
    IMAGE_DELETE: '/upload/image/delete',
} as const;

/**
 * Match Endpoints
 */
export const MATCH_ENDPOINTS = {
    CREATE: '/matches',
    UPDATE_RESULT: (matchId: string) => `/matches/${matchId}/result`,
    GET_BY_ID: (matchId: string) => `/matches/${matchId}`,
    LIST: '/matches',
} as const;

/**
 * Challenge Endpoints
 */
export const CHALLENGE_ENDPOINTS = {
    CREATE: '/challenges',
    LIST: '/challenges',
    GET_BY_ID: (challengeId: string) => `/challenges/${challengeId}`,
    ACCEPT: (challengeId: string) => `/challenges/${challengeId}/accept`,
    REJECT: (challengeId: string) => `/challenges/${challengeId}/reject`,
} as const;

/**
 * Leaderboard Endpoints
 */
export const LEADERBOARD_ENDPOINTS = {
    TOP_PLAYERS: '/leaderboard',
    WITH_LIMIT: (limit: number) => `/leaderboard?limit=${limit}`,
    WEEKLY: '/leaderboard/weekly',
    WITH_GENDER: (gender: 'male' | 'female', limit?: number) =>
        `/leaderboard?gender=${gender}${limit ? `&limit=${limit}` : ''}`,
} as const;

/**
 * Home/Dashboard Endpoints
 */
export const HOME_ENDPOINTS = {
    DASHBOARD: '/home',
} as const;

/**
 * Notification Endpoints
 */
export const NOTIFICATION_ENDPOINTS = {
    LIST: '/notifications',
    MARK_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/notifications/read-all',
} as const;

/**
 * Match Challenge Endpoints (Player-to-Player Challenges)
 */
export const MATCH_CHALLENGE_ENDPOINTS = {
    SEND: '/match-challenges',
    LIST: '/match-challenges',
    ACCEPT: (challengeId: string) => `/match-challenges/${challengeId}/accept`,
    REJECT: (challengeId: string) => `/match-challenges/${challengeId}/reject`,
    STATUS: (userId: string) => `/match-challenges/status/${userId}`,
} as const;

// ============================================
// COMPLETE ENDPOINTS OBJECT
// ============================================

/**
 * All API endpoints organized by category
 * Use this for easy access to all endpoints throughout the app
 */
export const API_ENDPOINTS = {
    AUTH: AUTH_ENDPOINTS,
    USER: USER_ENDPOINTS,
    UPLOAD: UPLOAD_ENDPOINTS,
    MATCH: MATCH_ENDPOINTS,
    CHALLENGE: CHALLENGE_ENDPOINTS,
    LEADERBOARD: LEADERBOARD_ENDPOINTS,
    HOME: HOME_ENDPOINTS,
    NOTIFICATION: NOTIFICATION_ENDPOINTS,
    MATCH_CHALLENGE: MATCH_CHALLENGE_ENDPOINTS,
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build complete URL with base URL and endpoint
 * @param endpoint - API endpoint
 * @returns Complete URL
 */
export const buildUrl = (endpoint: string): string => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}${endpoint}`;
};

/**
 * Build URL with query parameters
 * @param endpoint - API endpoint
 * @param params - Query parameters object
 * @returns Complete URL with query parameters
 */
export const buildUrlWithParams = (
    endpoint: string,
    params: Record<string, string | number | boolean>
): string => {
    const baseUrl = getBaseUrl();
    const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return `${baseUrl}${endpoint}?${queryString}`;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
    BASE_URLS,
    getBaseUrl,
    API_ENDPOINTS,
    buildUrl,
    buildUrlWithParams,
};
