import { API_ENDPOINTS } from '@/config/urls';
import { api } from './api';

// Backend match challenge types
export interface MatchChallenge {
    _id: string;
    fromUser: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    toUser: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    message?: string;
    isSingles: boolean;
    partnerId?: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    createdAt: string;
    expiresAt: string;
}

export interface SendChallengeData {
    toUserId: string;
    message?: string;
    isSingles?: boolean;
    partnerId?: string;
}

export interface ChallengeStatus {
    canChallenge: boolean;
    reason?: 'pending' | 'limit_reached';
    challengeId?: string;
    isSender?: boolean;
    challengesThisWeek?: number;
}

export const matchChallengeService = {
    /**
     * Send a match challenge to another player
     */
    sendChallenge: async (data: SendChallengeData): Promise<MatchChallenge> => {
        try {
            const response = await api.post<MatchChallenge>(
                API_ENDPOINTS.MATCH_CHALLENGE.SEND,
                data
            );
            return response.data;
        } catch (error) {
            console.error('Send challenge error:', error);
            throw error;
        }
    },

    /**
     * Get all challenges (sent and received)
     */
    getChallenges: async (): Promise<MatchChallenge[]> => {
        try {
            const response = await api.get<MatchChallenge[]>(
                API_ENDPOINTS.MATCH_CHALLENGE.LIST
            );
            return response.data;
        } catch (error) {
            console.error('Get challenges error:', error);
            throw error;
        }
    },

    /**
     * Accept a challenge
     */
    acceptChallenge: async (challengeId: string, accepterPartnerId?: string): Promise<MatchChallenge> => {
        try {
            const response = await api.put<MatchChallenge>(
                API_ENDPOINTS.MATCH_CHALLENGE.ACCEPT(challengeId),
                { accepterPartnerId }
            );
            return response.data;
        } catch (error) {
            console.error('Accept challenge error:', error);
            throw error;
        }
    },

    /**
     * Reject a challenge
     */
    rejectChallenge: async (challengeId: string): Promise<MatchChallenge> => {
        try {
            const response = await api.put<MatchChallenge>(
                API_ENDPOINTS.MATCH_CHALLENGE.REJECT(challengeId)
            );
            return response.data;
        } catch (error) {
            console.error('Reject challenge error:', error);
            throw error;
        }
    },

    /**
     * Get challenge status with a specific user
     * Returns whether you can challenge them and why/why not
     */
    getChallengeStatus: async (userId: string): Promise<ChallengeStatus> => {
        try {
            const response = await api.get<ChallengeStatus>(
                API_ENDPOINTS.MATCH_CHALLENGE.STATUS(userId)
            );
            console.log('match-challenges/status')
            return response.data;
        } catch (error) {
            console.error('Get challenge status error:', error);
            throw error;
        }
    },

    getBatchChallengeStatus: async (userIds: string[]): Promise<Record<string, ChallengeStatus>> => {
        try {
            const response = await api.post<Record<string, ChallengeStatus>>(
                API_ENDPOINTS.MATCH_CHALLENGE.BATCH_STATUS,
                { userIds }
            );
            console.log('✅ Batch status fetched for', userIds.length, 'users');
            return response.data;
        } catch (error) {
            console.error('Get batch challenge status error:', error);
            throw error;
        }
    },
};
