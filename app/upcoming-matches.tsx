import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UpcomingMatchesScreen() {
    const router = useRouter();
    const { matches } = useApp();

    const upcomingMatches = matches.filter(m => m.status === 'upcoming');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upcoming Matches</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {upcomingMatches.length > 0 ? (
                    upcomingMatches.map(match => (
                        <View key={match.id} style={styles.matchCard}>
                            <View style={styles.matchHeader}>
                                <Calendar size={16} color={Colors.primary} />
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
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 48,
    },
});
