import { User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const AUTH_KEY = '@auth_user';
const ONBOARDING_KEY = '@onboarding_completed';

export const [AuthContext, useAuth] = createContextHook(() => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '984760125211-4hdl8u3ijb2rf85h4cc10bclpif3eo6c.apps.googleusercontent.com', // TODO: Replace with your actual Web Client ID from Firebase Console -> Authentication -> Sign-in method -> Google -> Web SDK configuration
        });
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
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get the users ID token
            const signInResult = await GoogleSignin.signIn();
            const idToken = signInResult.data?.idToken;

            if (!idToken) {
                throw new Error('No ID token found');
            }

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            const userCredential = await auth().signInWithCredential(googleCredential);
            const firebaseUser = userCredential.user;

            const newUser: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Player',
                photoUrl: firebaseUser.photoURL || undefined,
                points: 0,
                totalWins: 0,
                totalLosses: 0,
                totalMatches: 0,
                winPercentage: 0,
                matchesPlayedWithDifferentPlayers: 0,
            };

            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
            setUser(newUser);
            return newUser;
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
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        await AsyncStorage.multiRemove([AUTH_KEY, ONBOARDING_KEY]);
        setUser(null);
        await auth().signOut();
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
