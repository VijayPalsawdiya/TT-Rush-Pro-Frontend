import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { Match, Challenge, Notification, User, LeaderboardEntry } from '@/types';
import { mockUsers, mockMatches, mockChallenges, mockNotifications } from '@/mocks/data';
import { leaderboardService } from '@/services/leaderboardService';

const MATCHES_KEY = '@matches';
const CHALLENGES_KEY = '@challenges';
const NOTIFICATIONS_KEY = '@notifications';
const USERS_KEY = '@users';
const LEADERBOARD_CACHE_KEY = '@leaderboard_cache';
const LEADERBOARD_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface LeaderboardCache {
    data: LeaderboardEntry[];
    timestamp: number;
    gender?: 'male' | 'female';
}

export const [AppContext, useApp] = createContextHook(() => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [leaderboardCache, setLeaderboardCache] = useState<Map<string, LeaderboardCache>>(new Map());
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [storedMatches, storedChallenges, storedNotifications, storedUsers] = await Promise.all([
                AsyncStorage.getItem(MATCHES_KEY),
                AsyncStorage.getItem(CHALLENGES_KEY),
                AsyncStorage.getItem(NOTIFICATIONS_KEY),
                AsyncStorage.getItem(USERS_KEY),
            ]);

            setMatches(storedMatches ? JSON.parse(storedMatches) : mockMatches);
            setChallenges(storedChallenges ? JSON.parse(storedChallenges) : mockChallenges);
            setNotifications(storedNotifications ? JSON.parse(storedNotifications) : mockNotifications);
            setUsers(storedUsers ? JSON.parse(storedUsers) : mockUsers);
        } catch (error) {
            console.error('Error loading app data:', error);
            setMatches(mockMatches);
            setChallenges(mockChallenges);
            setNotifications(mockNotifications);
            setUsers(mockUsers);
        }
    };

    const sendChallenge = useCallback(async (challenge: Challenge) => {
        const updated = [...challenges, challenge];
        setChallenges(updated);
        await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(updated));

        const notification: Notification = {
            id: `n${Date.now()}`,
            userId: challenge.toUserId,
            type: 'challenge-request',
            title: 'New Challenge Request',
            message: `${challenge.fromUserName} challenged you to a match`,
            read: false,
            createdAt: new Date(),
            challengeId: challenge.id,
        };

        const updatedNotifications = [...notifications, notification];
        setNotifications(updatedNotifications);
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    }, [challenges, notifications]);

    const respondToChallenge = useCallback(async (challengeId: string, accept: boolean) => {
        const updated = challenges.map(c =>
            c.id === challengeId ? { ...c, status: accept ? 'accepted' as const : 'rejected' as const } : c
        );
        setChallenges(updated);
        await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(updated));
    }, [challenges]);

    const markNotificationRead = useCallback(async (notificationId: string) => {
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        setNotifications(updated);
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }, [notifications]);

    const getLeaderboard = useCallback(async (gender?: 'male' | 'female'): Promise<LeaderboardEntry[]> => {
        const cacheKey = gender || 'all';
        const cached = leaderboardCache.get(cacheKey);
        const now = Date.now();

        // Return cached data if it's still fresh
        if (cached && (now - cached.timestamp) < LEADERBOARD_CACHE_DURATION) {
            console.log('📊 Returning cached leaderboard data');
            return cached.data;
        }

        // Fetch fresh data from API
        setIsLoadingLeaderboard(true);
        try {
            console.log('🔄 Fetching leaderboard from API...', { gender });
            const data = await leaderboardService.getLeaderboard(gender);

            // Update cache
            const newCache = new Map(leaderboardCache);
            newCache.set(cacheKey, {
                data,
                timestamp: now,
                gender,
            });
            setLeaderboardCache(newCache);

            console.log('✅ Leaderboard fetched successfully:', data.length, 'entries');
            return data;
        } catch (error) {
            console.error('❌ Error fetching leaderboard:', error);

            // Return cached data if available, even if expired
            if (cached) {
                console.log('⚠️ Returning expired cache due to error');
                return cached.data;
            }

            // Fallback to mock data if no cache available
            console.log('⚠️ Falling back to mock data');
            const filtered = users.filter(u => u.matchesPlayedWithDifferentPlayers >= 5);
            const genderFiltered = gender ? filtered.filter(u => u.gender === gender) : filtered;

            return genderFiltered.sort((a, b) => {
                if (a.points !== b.points) return b.points - a.points;
                if (a.winPercentage !== b.winPercentage) return b.winPercentage - a.winPercentage;
                return b.totalMatches - a.totalMatches;
            }).map((user, index) => ({
                user,
                rank: index + 1,
            }));
        } finally {
            setIsLoadingLeaderboard(false);
        }
    }, [leaderboardCache, users]);

    return {
        matches,
        challenges,
        notifications,
        users,
        sendChallenge,
        respondToChallenge,
        markNotificationRead,
        getLeaderboard,
        isLoadingLeaderboard,
    };
});
