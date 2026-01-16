import { User } from '@/types';
import { api, setTokens, clearTokens } from './api';
import { API_ENDPOINTS } from '@/config/urls';

// Backend auth response types
export interface BackendUser {
    _id: string;
    name: string;
    email: string;
    googleId: string;
    profilePicture?: string;
    gender?: 'male' | 'female';
    phoneNumber?: string;
    gameType?: 'right-hand' | 'left-hand';
    isProfileComplete: boolean;
    fcmToken?: string;
    ranking: number;
    weeklyWins: number;
    weeklyLosses: number;
    totalWins: number;
    totalLosses: number;
    winPercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface GoogleLoginResponse {
    user: BackendUser;
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
}

// Convert backend user to frontend user type
const mapBackendUserToUser = (backendUser: BackendUser): User => {
    return {
        id: backendUser._id,
        email: backendUser.email,
        name: backendUser.name,
        photoUrl: backendUser.profilePicture,
        gender: backendUser.gender,
        phoneNumber: backendUser.phoneNumber,
        gameType: backendUser.gameType,
        points: backendUser.ranking,
        totalWins: backendUser.totalWins,
        totalLosses: backendUser.totalLosses,
        totalMatches: backendUser.totalWins + backendUser.totalLosses,
        winPercentage: backendUser.winPercentage,
        matchesPlayedWithDifferentPlayers: 0, // Not available from backend yet
        rank: backendUser.ranking,
        isProfileComplete: backendUser.isProfileComplete,
    };
};

export const authService = {
    /**
     * Login with Google ID token
     * @param idToken - Google ID token from Firebase
     */
    googleLogin: async (idToken: string): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
        try {
            const response = await api.fetch<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
                method: 'POST',
                body: JSON.stringify({ token: idToken }),
            });

            // Store tokens
            await setTokens(response.data.accessToken, response.data.refreshToken);

            // Convert backend user to frontend user
            const user = mapBackendUserToUser(response.data.user);

            return {
                user,
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
            };
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    },

    /**
     * Refresh access token
     * @param refreshToken - Refresh token
     */
    refreshAccessToken: async (refreshToken: string): Promise<string> => {
        try {
            const response = await api.fetch<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });

            return response.data.accessToken;
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        try {
            await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with local logout even if API call fails
        } finally {
            // Clear local tokens
            await clearTokens();
        }
    },

    /**
     * Update FCM token for push notifications
     * @param fcmToken - Firebase Cloud Messaging token
     */
    updateFCMToken: async (fcmToken: string): Promise<void> => {
        try {
            await api.post(API_ENDPOINTS.USER.FCM_TOKEN, { fcmToken });
        } catch (error) {
            console.error('FCM token update error:', error);
            throw error;
        }
    },

    /**
     * Get user profile
     */
    getProfile: async (): Promise<User> => {
        try {
            const response = await api.get<BackendUser>(API_ENDPOINTS.USER.PROFILE);
            return mapBackendUserToUser(response.data);
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    /**
     * Update user profile
     * @param updates - Partial user updates
     */
    updateProfile: async (updates: {
        name?: string;
        profilePicture?: string;
        gender?: 'male' | 'female';
        phoneNumber?: string;
        gameType?: 'right-hand' | 'left-hand';
    }): Promise<User> => {
        try {
            const response = await api.put<BackendUser>(API_ENDPOINTS.USER.PROFILE, updates);
            return mapBackendUserToUser(response.data);
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },
};
