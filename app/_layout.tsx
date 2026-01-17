import { AppContext } from "@/contexts/AppContext";
import { AuthContext, useAuth } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
    const { user, isLoading, hasCompletedOnboarding } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(tabs)';
        const inEditProfile = segments[0] === 'edit-profile';
        const inUpcomingMatches = segments[0] === 'upcoming-matches';
        const inRecentMatches = segments[0] === 'recent-matches';
        const inCompleteProfile = segments[0] === 'complete-profile';

        // Not logged in - go to login
        if (!user && inAuthGroup) {
            router.replace('/login');
        }
        // Logged in but profile incomplete - go to complete profile
        else if (user && !user.isProfileComplete && !inCompleteProfile) {
            console.log('📝 Profile incomplete, redirecting to complete-profile');
            router.replace('/complete-profile');
        }
        // Profile complete but onboarding not done - go to onboarding
        else if (user && user.isProfileComplete && !hasCompletedOnboarding) {
            router.replace('/onboarding');
        }
        // Everything complete - go to home
        else if (user && user.isProfileComplete && hasCompletedOnboarding && !inAuthGroup && !inEditProfile && !inUpcomingMatches && !inRecentMatches && !inCompleteProfile) {
            router.replace('/(tabs)/home');
        }

        SplashScreen.hideAsync();
    }, [user, isLoading, hasCompletedOnboarding, segments, router]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="complete-profile" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="upcoming-matches" />
            <Stack.Screen name="recent-matches" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}

export default function RootLayout() {
    const insets = useSafeAreaInsets();
    return (
        <SafeAreaProvider style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <AuthContext>
                        <SocketProvider>
                            <AppContext>
                                <RootLayoutNav />
                            </AppContext>
                        </SocketProvider>
                    </AuthContext>
                </GestureHandlerRootView>
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
