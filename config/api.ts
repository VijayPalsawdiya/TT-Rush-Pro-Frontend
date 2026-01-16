/**
 * API Configuration
 * 
 * This file now imports from the centralized URLs configuration
 * @deprecated - Use config/urls.ts for URL management
 */

import { getBaseUrl } from './urls';

// Re-export for backward compatibility
export const API_CONFIG = {
    // Base URL for the backend API (now uses centralized config)
    BASE_URL: getBaseUrl(),

    // Timeout for API requests (in milliseconds)
    TIMEOUT: 30000,

    // Enable/disable API logging
    ENABLE_LOGGING: __DEV__,
};

/**
 * Get the appropriate API base URL based on platform
 * 
 * @deprecated - Use getBaseUrl from config/urls.ts instead
 * This function is kept for backward compatibility
 */
export const getApiBaseUrl = (): string => {
    return getBaseUrl();
};
