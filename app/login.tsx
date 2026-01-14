import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { signInWithGoogle } = useAuth();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            router.replace('/complete-profile');
        } catch (error) {
            console.error('Sign in failed:', error);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.background, Colors.surface]}
                style={styles.gradient}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>⚡</Text>
                        </View>
                        <Text style={styles.title}>Challenge Arena</Text>
                        <Text style={styles.subtitle}>Compete. Dominate. Rise.</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleSignIn}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.googleIcon}>G</Text>
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <Text style={styles.terms}>
                            By continuing, you agree to our Terms & Privacy Policy
                        </Text>
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 100,
        paddingBottom: 60,
    },
    logoContainer: {
        alignItems: 'center',
        gap: 16,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    logoText: {
        fontSize: 48,
    },
    title: {
        fontSize: 36,
        fontWeight: '800' as const,
        color: Colors.text,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.textSecondary,
        fontWeight: '500' as const,
    },
    buttonContainer: {
        gap: 16,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    googleIcon: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.primary,
    },
    googleButtonText: {
        fontSize: 17,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    terms: {
        fontSize: 13,
        color: Colors.textTertiary,
        textAlign: 'center',
        lineHeight: 18,
    },
});
