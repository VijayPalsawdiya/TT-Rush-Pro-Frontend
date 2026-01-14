import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecentMatchesScreen() {
    const router = useRouter();
    const { matches } = useApp();

    const recentMatches = matches.filter(m => m.status === 'completed');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recent Matches</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {recentMatches.length > 0 ? (
                    recentMatches.map(match => (
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 12,
    },
    matchCard: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
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
        paddingVertical: 48,
    },
});
