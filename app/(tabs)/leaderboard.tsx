import FilterButtons from '@/components/FilterButtons';
import ModeSelector from '@/components/ModeSelector';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Image } from 'expo-image';
import { Trophy } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type FilterType = 'all' | 'male' | 'female';
type ModeType = 'singles' | 'doubles';

export default function LeaderboardScreen() {
    const { getLeaderboard } = useApp();
    const [mode, setMode] = useState<ModeType>('singles');
    const [filter, setFilter] = useState<FilterType>('all');

    // For doubles, always show all users regardless of gender filter
    const leaderboard = mode === 'doubles'
        ? getLeaderboard(undefined)
        : getLeaderboard(filter === 'all' ? undefined : filter);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Leaderboard</Text>

                {/* Mode Selector */}
                <ModeSelector
                    selectedMode={mode}
                    onModeChange={setMode}
                />

                {/* Gender Filters - Only for Singles */}
                {mode === 'singles' && (
                    <FilterButtons
                        filters={['all', 'male', 'female']}
                        selectedFilter={filter}
                        onFilterChange={(f) => setFilter(f as FilterType)}
                    />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {mode === 'singles' ? (
                    // Singles Leaderboard
                    <>
                        {leaderboard.map((entry, index) => {
                            const isTop3 = index < 3;
                            const topColors = [Colors.warning, '#C0C0C0', '#CD7F32'];

                            return (
                                <View key={entry.user.id} style={styles.rankCard}>
                                    <View
                                        style={[
                                            styles.rankBadge,
                                            isTop3 && { backgroundColor: topColors[index] + '30' },
                                        ]}
                                    >
                                        {isTop3 ? (
                                            <Trophy size={20} color={topColors[index]} />
                                        ) : (
                                            <Text style={styles.rankNumber}>{entry.rank}</Text>
                                        )}
                                    </View>

                                    {entry.user.photoUrl && (
                                        <Image source={{ uri: entry.user.photoUrl }} style={styles.avatar} />
                                    )}

                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{entry.user.name}</Text>
                                        <View style={styles.stats}>
                                            <Text style={styles.statText}>
                                                {entry.user.points} pts
                                            </Text>
                                            <Text style={styles.dot}>•</Text>
                                            <Text style={styles.statText}>
                                                {entry.user.winPercentage.toFixed(1)}% win
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.matchesInfo}>
                                        <Text style={styles.matchesText}>{entry.user.totalMatches}</Text>
                                        <Text style={styles.matchesLabel}>matches</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {leaderboard.length === 0 && (
                            <Text style={styles.emptyText}>
                                No players available. Players need 5 matches to appear on leaderboard.
                            </Text>
                        )}
                    </>
                ) : (
                    // Doubles Leaderboard
                    <>
                        {leaderboard.slice(0, 10).map((entry, index) => {
                            const isTop3 = index < 3;
                            const topColors = [Colors.warning, '#C0C0C0', '#CD7F32'];
                            // For demo, pair consecutive users as teams
                            const partner = leaderboard[index + 1]?.user;

                            return (
                                <View key={`team - ${entry.user.id} `} style={styles.rankCard}>
                                    <View
                                        style={[
                                            styles.rankBadge,
                                            isTop3 && { backgroundColor: topColors[index] + '30' },
                                        ]}
                                    >
                                        {isTop3 ? (
                                            <Trophy size={20} color={topColors[index]} />
                                        ) : (
                                            <Text style={styles.rankNumber}>{index + 1}</Text>
                                        )}
                                    </View>

                                    {/* Overlapping Avatars */}
                                    <View style={styles.teamAvatars}>
                                        {entry.user.photoUrl && (
                                            <Image
                                                source={{ uri: entry.user.photoUrl }}
                                                style={[styles.avatar, styles.avatarLeft]}
                                            />
                                        )}
                                        {partner?.photoUrl && (
                                            <Image
                                                source={{ uri: partner.photoUrl }}
                                                style={[styles.avatar, styles.avatarRight]}
                                            />
                                        )}
                                    </View>

                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>
                                            {entry.user.name} & {partner?.name || 'Partner'}
                                        </Text>
                                        <View style={styles.stats}>
                                            <Text style={styles.statText}>
                                                {entry.user.points + (partner?.points || 0)} pts
                                            </Text>
                                            <Text style={styles.dot}>•</Text>
                                            <Text style={styles.statText}>
                                                {((entry.user.winPercentage + (partner?.winPercentage || 0)) / 2).toFixed(1)}% win
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.matchesInfo}>
                                        <Text style={styles.matchesText}>
                                            {entry.user.totalMatches + (partner?.totalMatches || 0)}
                                        </Text>
                                        <Text style={styles.matchesLabel}>matches</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {leaderboard.length === 0 && (
                            <Text style={styles.emptyText}>
                                No teams available.
                            </Text>
                        )}
                    </>
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        gap: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '800' as const,
        color: Colors.text,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 12,
    },
    rankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surfaceLight,
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    teamAvatars: {
        flexDirection: 'row',
        width: 64,
        height: 48,
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarLeft: {
        position: 'absolute',
        left: 0,
        zIndex: 2,
        borderWidth: 2,
        borderColor: Colors.surface,
    },
    avatarRight: {
        position: 'absolute',
        right: 0,
        zIndex: 1,
        borderWidth: 2,
        borderColor: Colors.surface,
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    dot: {
        fontSize: 13,
        color: Colors.textTertiary,
    },
    matchesInfo: {
        alignItems: 'flex-end',
    },
    matchesText: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    matchesLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 48,
        lineHeight: 20,
    },
});
