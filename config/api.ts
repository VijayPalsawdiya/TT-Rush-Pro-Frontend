/**
 * API Configuration
 * 
 * Update these values based on your environment
 */

// Development - use your local machine's IP address for testing on physical devices
// For iOS Simulator: use 'localhost'
// For Android Emulator: use '10.0.2.2'
// For Physical Device: use your computer's local IP (e.g., '192.168.1.100')
export const API_CONFIG = {
    // Base URL for the backend API
    BASE_URL: __DEV__
        ? 'http://localhost:3000/api'  // Development
        : 'https://your-production-api.com/api',  // Production

    // Timeout for API requests (in milliseconds)
    TIMEOUT: 30000,

    // Enable/disable API logging
    ENABLE_LOGGING: __DEV__,
};

/**
 * Get the appropriate API base URL based on platform
 * 
 * For Android emulator, localhost needs to be replaced with 10.0.2.2
 * For physical devices, you need to use your computer's local IP address
 */
import { Platform } from 'react-native';

export const getApiBaseUrl = (): string => {
    if (!__DEV__) {
        return API_CONFIG.BASE_URL;
    }

    // In development, adjust URL based on platform
    if (Platform.OS === 'android') {
        // Android emulator uses 10.0.2.2 to access host machine's localhost
        return API_CONFIG.BASE_URL.replace('localhost', '10.0.2.2');
    }

    // iOS simulator can use localhost directly
    return API_CONFIG.BASE_URL;
};
