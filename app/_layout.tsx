import { AppContext } from "@/contexts/AppContext";
import { AuthContext, useAuth } from "@/contexts/AuthContext";
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

        if (!user && inAuthGroup) {
            router.replace('/login');
        } else if (user && !user.name) {
            router.replace('/complete-profile');
        } else if (user && !hasCompletedOnboarding) {
            router.replace('/onboarding');
        } else if (user && user.name && hasCompletedOnboarding && !inAuthGroup && !inEditProfile && !inUpcomingMatches && !inRecentMatches) {
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
                        <AppContext>
                            <RootLayoutNav />
                        </AppContext>
                    </AuthContext>
                </GestureHandlerRootView>
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
