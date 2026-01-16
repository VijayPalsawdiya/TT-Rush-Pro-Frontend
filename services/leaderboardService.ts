import { api } from './api';
import { API_ENDPOINTS } from '@/config/urls';
import { LeaderboardEntry, User } from '@/types';

// Backend leaderboard response type
interface BackendLeaderboardEntry {
    user: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
        gender?: 'male' | 'female';
        phoneNumber?: string;
        gameType?: 'right-hand' | 'left-hand';
        points: number;
        totalWins: number;
        totalLosses: number;
        totalMatches: number;
        winPercentage: number;
        rank: number;
        weeklyWins?: number;
        weeklyLosses?: number;
    };
    rank: number;
}

// Convert backend leaderboard entry to frontend format
const mapBackendEntryToFrontend = (entry: BackendLeaderboardEntry): LeaderboardEntry => {
    return {
        user: {
            id: entry.user._id,
            email: entry.user.email,
            name: entry.user.name,
            photoUrl: entry.user.profilePicture,
            gender: entry.user.gender,
            phoneNumber: entry.user.phoneNumber,
            gameType: entry.user.gameType,
            points: entry.user.points,
            totalWins: entry.user.totalWins,
            totalLosses: entry.user.totalLosses,
            totalMatches: entry.user.totalMatches,
            winPercentage: entry.user.winPercentage,
            rank: entry.user.rank,
            matchesPlayedWithDifferentPlayers: 0, // Not available from backend yet
            isProfileComplete: true,
        },
        rank: entry.rank,
    };
};

export const leaderboardService = {
    /**
     * Get overall leaderboard
     * @param gender - Optional gender filter ('male' | 'female')
     * @param limit - Optional limit for number of results (default: 100)
     */
    getLeaderboard: async (gender?: 'male' | 'female', limit: number = 100): Promise<LeaderboardEntry[]> => {
        try {
            let endpoint: string;

            if (gender) {
                endpoint = API_ENDPOINTS.LEADERBOARD.WITH_GENDER(gender, limit);
            } else {
                endpoint = API_ENDPOINTS.LEADERBOARD.WITH_LIMIT(limit);
            }

            const response = await api.get<BackendLeaderboardEntry[]>(endpoint);

            // Map backend entries to frontend format
            return response.data.map(mapBackendEntryToFrontend);
        } catch (error) {
            console.error('Get leaderboard error:', error);
            throw error;
        }
    },

    /**
     * Get weekly leaderboard
     */
    getWeeklyLeaderboard: async (): Promise<LeaderboardEntry[]> => {
        try {
            const response = await api.get<BackendLeaderboardEntry[]>(API_ENDPOINTS.LEADERBOARD.WEEKLY);

            // Map backend entries to frontend format
            return response.data.map(mapBackendEntryToFrontend);
        } catch (error) {
            console.error('Get weekly leaderboard error:', error);
            throw error;
        }
    },
};
