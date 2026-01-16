import { api } from './api';
import { API_ENDPOINTS } from '@/config/urls';

// Backend tournament challenge types
export interface TournamentChallenge {
    _id: string;
    name: string;
    type: 'rank' | 'weekly';
    minRank?: number;
    maxRank?: number;
    weekNumber?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTournamentChallengeData {
    name: string;
    type: 'rank' | 'weekly';
    minRank?: number;
    maxRank?: number;
    weekNumber?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
}

export const challengeService = {
    /**
     * Get all tournament challenges
     * @param type - Optional filter by type ('rank' | 'weekly')
     */
    getChallenges: async (type?: 'rank' | 'weekly'): Promise<TournamentChallenge[]> => {
        try {
            const endpoint = type
                ? `${API_ENDPOINTS.CHALLENGE.LIST}?type=${type}`
                : API_ENDPOINTS.CHALLENGE.LIST;

            const response = await api.get<TournamentChallenge[]>(endpoint);
            return response.data;
        } catch (error) {
            console.error('Get challenges error:', error);
            throw error;
        }
    },

    /**
     * Get a specific tournament challenge by ID
     * @param challengeId - Challenge ID
     */
    getChallengeById: async (challengeId: string): Promise<TournamentChallenge> => {
        try {
            const response = await api.get<TournamentChallenge>(
                API_ENDPOINTS.CHALLENGE.GET_BY_ID(challengeId)
            );
            return response.data;
        } catch (error) {
            console.error('Get challenge by ID error:', error);
            throw error;
        }
    },

    /**
     * Create a new tournament challenge
     * @param challengeData - Challenge data
     */
    createChallenge: async (challengeData: CreateTournamentChallengeData): Promise<TournamentChallenge> => {
        try {
            const response = await api.post<TournamentChallenge>(
                API_ENDPOINTS.CHALLENGE.CREATE,
                challengeData
            );
            return response.data;
        } catch (error) {
            console.error('Create challenge error:', error);
            throw error;
        }
    },

    /**
     * Get active tournament challenges
     * Convenience method to get only active challenges
     */
    getActiveChallenges: async (): Promise<TournamentChallenge[]> => {
        try {
            const challenges = await challengeService.getChallenges();
            return challenges.filter(c => c.isActive);
        } catch (error) {
            console.error('Get active challenges error:', error);
            throw error;
        }
    },

    /**
     * Get rank-based challenges
     */
    getRankChallenges: async (): Promise<TournamentChallenge[]> => {
        try {
            return await challengeService.getChallenges('rank');
        } catch (error) {
            console.error('Get rank challenges error:', error);
            throw error;
        }
    },

    /**
     * Get weekly challenges
     */
    getWeeklyChallenges: async (): Promise<TournamentChallenge[]> => {
        try {
            return await challengeService.getChallenges('weekly');
        } catch (error) {
            console.error('Get weekly challenges error:', error);
            throw error;
        }
    },
};
