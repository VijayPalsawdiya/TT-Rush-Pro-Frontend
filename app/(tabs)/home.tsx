import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { homeService, HomeData } from '@/services/homeService';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight, TrendingUp, Trophy } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';

export default function HomeScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch home data on mount
    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const data = await homeService.getHomeData();
            setHomeData(data);
        } catch (error) {
            console.error('Error fetching home data:', error);
            // Keep existing data on error
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const onRefresh = () => {
        fetchHomeData(true);
    };

    const upcomingMatches = homeData?.upcomingMatches || [];
    const recentMatches = homeData?.recentMatches || [];

    if (isLoading && !homeData) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading home data...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors.primary}
                />
            }
        >
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {user?.photoUrl && (
                        <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                    )}
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>{user?.name || 'Player'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
                        <Trophy size={24} color={Colors.primary} />
                    </View>
                    <Text style={styles.statValue}>{user?.points || 0}</Text>
                    <Text style={styles.statLabel}>Points</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
                        <TrendingUp size={24} color={Colors.success} />
                    </View>
                    <Text style={styles.statValue}>{user?.totalWins || 0}</Text>
                    <Text style={styles.statLabel}>Total Wins</Text>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming Matches</Text>
                    {upcomingMatches.length > 3 && (
                        <TouchableOpacity
                            style={styles.viewAllBtn}
                            onPress={() => router.push('/upcoming-matches')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                            <ChevronRight size={16} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
                {upcomingMatches.length > 0 ? (
                    upcomingMatches.slice(0, 3).map(match => (
                        <View key={match.id} style={styles.matchCard}>
                            <View style={styles.matchHeader}>
                                <Text style={styles.matchDate}>
                                    {new Date(match.scheduledDate).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.matchPlayers}>
                                <View style={styles.player}>
                                    {match.player1Photo && (
                                        <Image source={{ uri: match.player1Photo }} style={styles.playerAvatar} />
                                    )}
                                    <Text style={styles.playerName}>{match.player1Name}</Text>
                                </View>
                                <Text style={styles.vs}>VS</Text>
                                <View style={styles.player}>
                                    {match.player2Photo && (
                                        <Image source={{ uri: match.player2Photo }} style={styles.playerAvatar} />
                                    )}
                                    <Text style={styles.playerName}>{match.player2Name}</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No upcoming matches</Text>
                )}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Recent Matches</Text>
                    {recentMatches.length > 3 && (
                        <TouchableOpacity
                            style={styles.viewAllBtn}
                            onPress={() => router.push('/recent-matches')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                            <ChevronRight size={16} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
                {recentMatches.length > 0 ? (
                    recentMatches.slice(0, 3).map(match => (
                        <View key={match.id} style={styles.matchCard}>
                            <View style={styles.matchPlayers}>
                                <View style={styles.player}>
                                    {match.player1Photo && (
                                        <Image source={{ uri: match.player1Photo }} style={styles.playerAvatar} />
                                    )}
                                    <Text style={styles.playerName}>{match.player1Name}</Text>
                                    <Text style={styles.score}>{match.player1Points}</Text>
                                </View>
                                <View style={[styles.winIndicator, match.winnerId === match.player1Id && styles.winner]}>
                                    {match.winnerId === match.player1Id && (
                                        <Trophy size={16} color={Colors.success} />
                                    )}
                                </View>
                                <Text style={styles.vs}>-</Text>
                                <View style={[styles.winIndicator, match.winnerId === match.player2Id && styles.winner]}>
                                    {match.winnerId === match.player2Id && (
                                        <Trophy size={16} color={Colors.success} />
                                    )}
                                </View>
                                <View style={styles.player}>
                                    <Text style={styles.score}>{match.player2Points}</Text>
                                    {match.player2Photo && (
                                        <Image source={{ uri: match.player2Photo }} style={styles.playerAvatar} />
                                    )}
                                    <Text style={styles.playerName}>{match.player2Name}</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No matches yet</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    greeting: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800' as const,
        color: Colors.text,
    },
    statLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.primary,
    },
    matchCard: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    matchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    matchDate: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '600' as const,
    },
    matchPlayers: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    player: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    playerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    playerName: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.text,
        flex: 1,
    },
    vs: {
        fontSize: 12,
        fontWeight: '700' as const,
        color: Colors.textTertiary,
        marginHorizontal: 8,
    },
    score: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    winIndicator: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    winner: {
        backgroundColor: Colors.success + '20',
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 24,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
    },
});
