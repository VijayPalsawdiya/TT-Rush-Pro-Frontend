export type Gender = 'male' | 'female';
export type GameType = 'right-hand' | 'left-hand';
export type ChallengeStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type MatchStatus = 'upcoming' | 'completed' | 'in-progress';
export type NotificationType = 'challenge-request' | 'challenge-accepted' | 'challenge-rejected' | 'match-reminder' | 'match-result';

export interface User {
    id: string;
    email: string;
    name: string;
    photoUrl?: string;
    gender?: Gender;
    phoneNumber?: string;
    gameType?: GameType;
    points: number;
    totalWins: number;
    totalLosses: number;
    totalMatches: number;
    rank?: number;
    winPercentage: number;
    matchesPlayedWithDifferentPlayers: number;
}

export interface Match {
    id: string;
    player1Id: string;
    player2Id: string;
    player1Name: string;
    player2Name: string;
    player1Photo?: string;
    player2Photo?: string;
    winnerId?: string;
    status: MatchStatus;
    scheduledDate: Date;
    completedDate?: Date;
    player1Points?: number;
    player2Points?: number;
}

export interface Challenge {
    id: string;
    fromUserId: string;
    toUserId: string;
    fromUserName: string;
    toUserName: string;
    fromUserPhoto?: string;
    toUserPhoto?: string;
    message?: string;
    status: ChallengeStatus;
    createdAt: Date;
    isSingles: boolean;
    partnerId?: string;
    partnerName?: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    challengeId?: string;
    matchId?: string;
}

export interface LeaderboardEntry {
    user: User;
    rank: number;
}
