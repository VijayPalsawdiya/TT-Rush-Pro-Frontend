/**
 * Example usage of the backend API services
 * 
 * This file demonstrates how to use the integrated backend APIs
 */

import { authService } from '@/services/authService';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/config/urls';

// ============================================
// AUTHENTICATION EXAMPLES
// ============================================

/**
 * Example 1: Google Login
 * Called automatically in AuthContext when user signs in with Google
 */
export async function exampleGoogleLogin(googleIdToken: string) {
    try {
        const response = await authService.googleLogin(googleIdToken);

        console.log('User:', response.user);
        console.log('Access Token:', response.accessToken);
        console.log('Refresh Token:', response.refreshToken);

        // Tokens are automatically stored in AsyncStorage
        return response.user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

/**
 * Example 2: Logout
 * Called automatically in AuthContext when user logs out
 */
export async function exampleLogout() {
    try {
        await authService.logout();
        console.log('Logged out successfully');
        // Tokens are automatically cleared from AsyncStorage
    } catch (error) {
        console.error('Logout failed:', error);
        // Even if API call fails, local logout continues
    }
}

/**
 * Example 3: Update Profile
 * Called automatically in AuthContext when user updates profile
 */
export async function exampleUpdateProfile() {
    try {
        const updatedUser = await authService.updateProfile({
            name: 'New Name',
            profilePicture: 'https://example.com/photo.jpg',
        });

        console.log('Updated user:', updatedUser);
        return updatedUser;
    } catch (error) {
        console.error('Profile update failed:', error);
        throw error;
    }
}

/**
 * Example 4: Get User Profile
 * Fetch latest user data from backend
 */
export async function exampleGetProfile() {
    try {
        const user = await authService.getProfile();
        console.log('User profile:', user);
        return user;
    } catch (error) {
        console.error('Get profile failed:', error);
        throw error;
    }
}

/**
 * Example 5: Update FCM Token
 * Update Firebase Cloud Messaging token for push notifications
 */
export async function exampleUpdateFCMToken(fcmToken: string) {
    try {
        await authService.updateFCMToken(fcmToken);
        console.log('FCM token updated');
    } catch (error) {
        console.error('FCM token update failed:', error);
        throw error;
    }
}

// ============================================
// DIRECT API EXAMPLES
// ============================================

/**
 * Example 6: Direct GET request
 * Get user stats
 */
export async function exampleGetStats() {
    try {
        const response = await api.get<{
            totalWins: number;
            totalLosses: number;
            winPercentage: number;
            ranking: number;
        }>(API_ENDPOINTS.USER.STATS);

        console.log('User stats:', response.data);
        return response.data;
    } catch (error) {
        console.error('Get stats failed:', error);
        throw error;
    }
}

/**
 * Example 7: Direct POST request
 * Create a new match
 */
export async function exampleCreateMatch(challengeId: string, player2Id: string) {
    try {
        const response = await api.post<{
            _id: string;
            challengeId: string;
            player1: string;
            player2: string;
            status: string;
        }>(API_ENDPOINTS.MATCH.CREATE, {
            challengeId,
            player1: 'current-user-id', // Replace with actual user ID
            player2: player2Id,
        });

        console.log('Match created:', response.data);
        return response.data;
    } catch (error) {
        console.error('Create match failed:', error);
        throw error;
    }
}

/**
 * Example 8: Direct PUT request
 * Update match result
 */
export async function exampleUpdateMatchResult(matchId: string) {
    try {
        const response = await api.put(API_ENDPOINTS.MATCH.UPDATE_RESULT(matchId), {
            score: {
                player1Score: 11,
                player2Score: 7,
            },
            winner: 'current-user-id', // Replace with actual winner ID
        });

        console.log('Match updated:', response.data);
        return response.data;
    } catch (error) {
        console.error('Update match failed:', error);
        throw error;
    }
}

/**
 * Example 9: Get Leaderboard
 */
export async function exampleGetLeaderboard() {
    try {
        const response = await api.get<Array<{
            name: string;
            profilePicture?: string;
            ranking: number;
            totalWins: number;
            totalLosses: number;
            winPercentage: number;
        }>>(API_ENDPOINTS.LEADERBOARD.WITH_LIMIT(100));

        console.log('Leaderboard:', response.data);
        return response.data;
    } catch (error) {
        console.error('Get leaderboard failed:', error);
        throw error;
    }
}

/**
 * Example 10: Get Home Dashboard Data
 */
export async function exampleGetHomeData() {
    try {
        const response = await api.get<{
            user: any;
            recentMatches: any[];
            activeChallenges: any[];
            topPlayers: any[];
        }>(API_ENDPOINTS.HOME.DASHBOARD);

        console.log('Home data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Get home data failed:', error);
        throw error;
    }
}

// ============================================
// TOKEN MANAGEMENT EXAMPLES
// ============================================

/**
 * Example 11: Manual Token Refresh
 * (Usually handled automatically by the API client)
 */
export async function exampleRefreshToken(refreshToken: string) {
    try {
        const newAccessToken = await authService.refreshAccessToken(refreshToken);
        console.log('New access token:', newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
}

/**
 * Example 12: Check if user is authenticated
 */
import { getAccessToken } from '@/services/api';

export async function exampleCheckAuth() {
    const token = await getAccessToken();
    const isAuthenticated = !!token;
    console.log('Is authenticated:', isAuthenticated);
    return isAuthenticated;
}
