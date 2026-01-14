import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function Index() {
    const router = useRouter();
    const { user, isLoading, hasCompletedOnboarding } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace('/login');
        } else if (!user.name) {
            router.replace('/complete-profile');
        } else if (!hasCompletedOnboarding) {
            router.replace('/onboarding');
        } else {
            router.replace('/(tabs)/home');
        }
    }, [user, isLoading, hasCompletedOnboarding, router]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
