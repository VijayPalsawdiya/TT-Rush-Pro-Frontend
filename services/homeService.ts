import { api } from './api';
import { API_ENDPOINTS } from '@/config/urls';
import { User, Match } from '@/types';

// Backend home response types
interface BackendUser {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    gender?: 'male' | 'female';
    phoneNumber?: string;
    gameType?: 'right-hand' | 'left-hand';
    ranking: number;
    totalWins: number;
    totalLosses: number;
    winPercentage: number;
    isProfileComplete: boolean;
}

interface BackendMatch {
    _id: string;
    isSingles: boolean;
    // Singles fields
    player1?: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    player2?: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    // Doubles fields
    team1Player1?: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    team1Player2?: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    team2Player1?: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    team2Player2?: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    winner?: {
        _id: string;
        name: string;
    };
    status: 'pending' | 'completed' | 'cancelled';
    score: {
        player1Score: number;
        player2Score: number;
    };
    matchDate: string;
    createdAt: string;
}

interface BackendChallenge {
    _id: string;
    name: string;
    type: 'rank' | 'weekly';
    minRank?: number;
    maxRank?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}

interface BackendTopPlayer {
    _id: string;
    name: string;
    profilePicture?: string;
    ranking: number;
    totalWins: number;
    totalLosses: number;
    winPercentage: number;
}

export interface HomeData {
    user: User;
    upcomingMatches: Match[];
    recentMatches: Match[];
    activeChallenges: BackendChallenge[];
    topPlayers: BackendTopPlayer[];
}

interface BackendHomeResponse {
    user: BackendUser;
    upcomingMatches: BackendMatch[];
    recentMatches: BackendMatch[];
    activeChallenges: BackendChallenge[];
    topPlayers: BackendTopPlayer[];
}

// Convert backend user to frontend format
const mapBackendUserToFrontend = (backendUser: BackendUser): User => {
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
        rank: backendUser.ranking,
        matchesPlayedWithDifferentPlayers: 0, // Not available from backend yet
        isProfileComplete: backendUser.isProfileComplete,
    };
};

// Convert backend match to frontend format
const mapBackendMatchToFrontend = (backendMatch: BackendMatch): Match => {
    if (backendMatch.isSingles) {
        // Singles match
        return {
            id: backendMatch._id,
            player1Id: backendMatch.player1?._id || '',
            player2Id: backendMatch.player2?._id || '',
            player1Name: backendMatch.player1?.name || 'Unknown',
            player2Name: backendMatch.player2?.name || 'Unknown',
            player1Photo: backendMatch.player1?.profilePicture,
            player2Photo: backendMatch.player2?.profilePicture,
            winnerId: backendMatch.winner?._id,
            status: backendMatch.status === 'pending' ? 'upcoming' :
                backendMatch.status === 'completed' ? 'completed' : 'upcoming',
            scheduledDate: new Date(backendMatch.matchDate),
            completedDate: backendMatch.status === 'completed' ? new Date(backendMatch.createdAt) : undefined,
            player1Points: backendMatch.score.player1Score,
            player2Points: backendMatch.score.player2Score,
        };
    } else {
        // Doubles match - combine team names
        const team1Name = `${backendMatch.team1Player1?.name || 'Unknown'} & ${backendMatch.team1Player2?.name || 'Unknown'}`;
        const team2Name = `${backendMatch.team2Player1?.name || 'Unknown'} & ${backendMatch.team2Player2?.name || 'Unknown'}`;

        return {
            id: backendMatch._id,
            player1Id: backendMatch.team1Player1?._id || '',
            player2Id: backendMatch.team2Player1?._id || '',
            player1Name: team1Name,
            player2Name: team2Name,
            player1Photo: backendMatch.team1Player1?.profilePicture,
            player2Photo: backendMatch.team2Player1?.profilePicture,
            winnerId: backendMatch.winner?._id,
            status: backendMatch.status === 'pending' ? 'upcoming' :
                backendMatch.status === 'completed' ? 'completed' : 'upcoming',
            scheduledDate: new Date(backendMatch.matchDate),
            completedDate: backendMatch.status === 'completed' ? new Date(backendMatch.createdAt) : undefined,
            player1Points: backendMatch.score.player1Score,
            player2Points: backendMatch.score.player2Score,
        };
    }
};

export const homeService = {
    /**
     * Get home screen data
     * Returns user info, upcoming matches, recent matches, challenges, and top players
     */
    getHomeData: async (): Promise<HomeData> => {
        try {
            const response = await api.get<BackendHomeResponse>(API_ENDPOINTS.HOME.DASHBOARD);

            return {
                user: mapBackendUserToFrontend(response.data.user),
                upcomingMatches: response.data.upcomingMatches.map(mapBackendMatchToFrontend),
                recentMatches: response.data.recentMatches.map(mapBackendMatchToFrontend),
                activeChallenges: response.data.activeChallenges,
                topPlayers: response.data.topPlayers,
            };
        } catch (error) {
            console.error('Get home data error:', error);
            throw error;
        }
    },
};
