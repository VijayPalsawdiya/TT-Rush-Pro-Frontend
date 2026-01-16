import { api } from './api';
import { API_ENDPOINTS } from '@/config/urls';
import { User } from '@/types';

// Backend user response type
interface BackendUser {
    _id: string;
    name: string;
    email?: string;
    profilePicture?: string;
    gender?: 'male' | 'female';
    phoneNumber?: string;
    gameType?: 'right-hand' | 'left-hand';
    ranking: number;
    totalWins: number;
    totalLosses: number;
    winPercentage: number;
    isProfileComplete?: boolean;
}

// Convert backend user to frontend format
const mapBackendUserToFrontend = (backendUser: BackendUser): User => {
    return {
        id: backendUser._id,
        email: backendUser.email || '',
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
        rank: backendUser.ranking,
        matchesPlayedWithDifferentPlayers: 0, // Not available from backend yet
        isProfileComplete: backendUser.isProfileComplete || false,
    };
};

export const userService = {
    /**
     * Get all users
     * Returns list of all users sorted by ranking
     */
    getAllUsers: async (): Promise<User[]> => {
        try {
            const response = await api.get<BackendUser[]>(API_ENDPOINTS.USER.LIST);
            return response.data.map(mapBackendUserToFrontend);
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
        try {
            const response = await api.get<BackendUser>(API_ENDPOINTS.USER.PROFILE);
            return mapBackendUserToFrontend(response.data);
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },
};
