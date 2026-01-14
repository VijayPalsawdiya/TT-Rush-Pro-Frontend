import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { Trophy, Users, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const slides = [
    {
        icon: Zap,
        title: 'Welcome to Challenge Arena',
        description: 'The ultimate platform for competitive sports challenges. Track your progress and climb the ranks.',
    },
    {
        icon: Users,
        title: 'Challenge with Friends',
        description: 'Challenge players within your skill range. Singles or doubles - the choice is yours.',
    },
    {
        icon: Trophy,
        title: 'Join Existing Challenge',
        description: 'Accept challenges, compete in matches, and prove you\'re the best. Are you ready?',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { completeOnboarding } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
            setCurrentIndex(currentIndex + 1);
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        await completeOnboarding();
        router.replace('/(tabs)/home');
    };

    const currentSlide = slides[currentIndex];
    const Icon = currentSlide.icon;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Icon size={64} color={Colors.primary} strokeWidth={2} />
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{currentSlide.title}</Text>
                    <Text style={styles.description}>{currentSlide.description}</Text>
                </View>

                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>
            </Animated.View>

            <View style={styles.footer}>
                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 60,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 48,
    },
    iconContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    textContainer: {
        gap: 16,
        paddingHorizontal: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800' as const,
        color: Colors.text,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.border,
    },
    dotActive: {
        backgroundColor: Colors.primary,
        width: 24,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
    },
    button: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '700' as const,
        color: Colors.background,
    },
});
