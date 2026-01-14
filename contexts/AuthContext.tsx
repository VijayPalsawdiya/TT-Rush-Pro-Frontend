import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { User } from '@/types';

const AUTH_KEY = '@auth_user';
const ONBOARDING_KEY = '@onboarding_completed';

export const [AuthContext, useAuth] = createContextHook(() => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const [storedUser, onboardingStatus] = await Promise.all([
                AsyncStorage.getItem(AUTH_KEY),
                AsyncStorage.getItem(ONBOARDING_KEY),
            ]);

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            if (onboardingStatus) {
                setHasCompletedOnboarding(true);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = useCallback(async () => {
        try {
            const mockUser: User = {
                id: '1',
                email: 'user@example.com',
                name: '',
                points: 0,
                totalWins: 0,
                totalLosses: 0,
                totalMatches: 0,
                winPercentage: 0,
                matchesPlayedWithDifferentPlayers: 0,
            };

            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
            setUser(mockUser);
            return mockUser;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }, []);

    const updateProfile = useCallback(async (updates: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
    }, [user]);

    const completeOnboarding = useCallback(async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        setHasCompletedOnboarding(true);
    }, []);

    const logout = useCallback(async () => {
        await AsyncStorage.multiRemove([AUTH_KEY, ONBOARDING_KEY]);
        setUser(null);
        setHasCompletedOnboarding(false);
        router.replace('/login');
    }, [router]);

    const deleteAccount = useCallback(async () => {
        await AsyncStorage.multiRemove([AUTH_KEY, ONBOARDING_KEY]);
        setUser(null);
        setHasCompletedOnboarding(false);
        router.replace('/login');
    }, [router]);

    return {
        user,
        isLoading,
        hasCompletedOnboarding,
        signInWithGoogle,
        updateProfile,
        completeOnboarding,
        logout,
        deleteAccount,
    };
});
