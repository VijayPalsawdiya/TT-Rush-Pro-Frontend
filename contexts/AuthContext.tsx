import { User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { clearTokens } from '@/services/api';

const AUTH_KEY = '@auth_user';
const ONBOARDING_KEY = '@onboarding_completed';

export const [AuthContext, useAuth] = createContextHook(() => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '984760125211-4hdl8u3ijb2rf85h4cc10bclpif3eo6c.apps.googleusercontent.com',
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
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            const userCredential = await signInWithCredential(getAuth(), googleCredential);

            // ✅ Call backend API with Google ID token
            console.log('📡 Calling backend /auth/google API...');
            const backendResponse = await authService.googleLogin(idToken);

            console.log('✅ Backend login successful:', {
                userId: backendResponse.user.id,
                email: backendResponse.user.email,
                hasTokens: !!backendResponse.accessToken,
            });

            // Use user data from backend
            const newUser = backendResponse.user;

            // Save user to AsyncStorage
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
            setUser(newUser);

            return newUser;
        } catch (error) {
            console.error('❌ Error signing in:', error);
            throw error;
        }
    }, []);

    const updateProfile = useCallback(async (updates: Partial<User>) => {
        if (!user) return;

        try {
            // ✅ Call backend API to update profile
            console.log('📡 Calling backend /users/profile API...');
            const updatedUser = await authService.updateProfile({
                name: updates.name,
                profilePicture: updates.photoUrl,
            });

            console.log('✅ Profile updated successfully');

            // Update local storage
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('❌ Error updating profile:', error);

            // Fallback to local update if API fails
            const updatedUser = { ...user, ...updates };
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
    }, [user]);

    const completeOnboarding = useCallback(async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        setHasCompletedOnboarding(true);
    }, []);

    const logout = useCallback(async () => {
        try {
            // ✅ Call backend API to logout
            console.log('📡 Calling backend /auth/logout API...');
            await authService.logout();
            console.log('✅ Backend logout successful');
        } catch (error) {
            console.error('⚠️ Backend logout error (continuing with local logout):', error);
        }

        try {
            // Google Sign-In cleanup
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
        } catch (error) {
            console.error('⚠️ Google sign-out error:', error);
        }

        try {
            // Firebase auth cleanup
            const auth = getAuth();
            await auth.signOut();
        } catch (error) {
            console.error('⚠️ Firebase sign-out error:', error);
        }

        // Clear local storage
        await AsyncStorage.multiRemove([AUTH_KEY, ONBOARDING_KEY]);
        await clearTokens();

        setUser(null);
        setHasCompletedOnboarding(false);
        router.replace('/login');
    }, [router]);

    const deleteAccount = useCallback(async () => {
        // Clear local storage
        await AsyncStorage.multiRemove([AUTH_KEY, ONBOARDING_KEY]);
        await clearTokens();

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
