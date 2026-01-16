import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '@/config/api';
import { API_ENDPOINTS } from '@/config/urls';

const API_BASE_URL = getApiBaseUrl();
const TOKEN_KEY = '@access_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiError {
    success: false;
    error: string;
}

// Helper function to get stored tokens
export const getAccessToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
};

// Base fetch function with error handling
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// Authenticated fetch with automatic token refresh
async function authenticatedFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        throw new Error('No access token available');
    }

    try {
        return await apiFetch<T>(endpoint, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
            },
        });
    } catch (error: any) {
        // If token expired, try to refresh
        if (error.message?.includes('Invalid token') || error.message?.includes('401')) {
            const refreshToken = await getRefreshToken();

            if (refreshToken) {
                try {
                    const refreshResponse = await apiFetch<{ accessToken: string }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
                        method: 'POST',
                        body: JSON.stringify({ refreshToken }),
                    });

                    // Save new access token
                    await AsyncStorage.setItem(TOKEN_KEY, refreshResponse.data.accessToken);

                    // Retry original request with new token
                    return await apiFetch<T>(endpoint, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${refreshResponse.data.accessToken}`,
                        },
                    });
                } catch (refreshError) {
                    // Refresh failed, clear tokens
                    await clearTokens();
                    throw new Error('Session expired. Please login again.');
                }
            }
        }

        throw error;
    }
}

export const api = {
    // Public methods
    fetch: apiFetch,

    // Authenticated methods
    get: async <T>(endpoint: string) => {
        return authenticatedFetch<T>(endpoint, { method: 'GET' });
    },

    post: async <T>(endpoint: string, body?: any) => {
        return authenticatedFetch<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put: async <T>(endpoint: string, body?: any) => {
        return authenticatedFetch<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete: async <T>(endpoint: string) => {
        return authenticatedFetch<T>(endpoint, { method: 'DELETE' });
    },
};
