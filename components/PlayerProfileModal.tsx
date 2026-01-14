import Colors from '@/constants/colors';
import { Match, User } from '@/types';
import { Image } from 'expo-image';
import { Trophy, X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlayerProfileModalProps {
    visible: boolean;
    onClose: () => void;
    player: User | null;
    matches: Match[];
}

export default function PlayerProfileModal({ visible, onClose, player, matches }: PlayerProfileModalProps) {
    console.log('PlayerProfileModal rendered:', { visible, hasPlayer: !!player, playerName: player?.name });

    const getGameTypeLabel = (gameType?: string) => {
        if (gameType === 'right-hand') return 'Right Hand';
        if (gameType === 'left-hand') return 'Left Hand';
        return 'Not specified';
    };

    const getGenderLabel = (gender?: string) => {
        if (gender === 'male') return 'Male';
        if (gender === 'female') return 'Female';
        return 'Not specified';
    };

    // Get last 3 matches for this player
    const playerMatches = player ? matches
        .filter(m =>
            m.status === 'completed' &&
            (m.player1Id === player.id || m.player2Id === player.id)
        )
        .slice(0, 3) : [];

    console.log('Player matches:', playerMatches.length);

    if (!visible) return null;

    console.log('Player matches:', player);
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Player Profile</Text>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                            <X size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {player ? (
                            <>
                                {/* Profile Section */}
                                <View style={styles.profileSection}>
                                    {player?.photoUrl ? (
                                        <Image source={{ uri: player?.photoUrl }} style={styles.avatar} />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarPlaceholderText}>
                                                {player?.name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    <Text style={styles.playerName}>{player?.name}</Text>

                                    {/* Stats */}
                                    <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{player?.points}</Text>
                                            <Text style={styles.statLabel}>Points</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{player?.totalWins}</Text>
                                            <Text style={styles.statLabel}>Wins</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{player?.totalMatches}</Text>
                                            <Text style={styles.statLabel}>Matches</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Details Section */}
                                <View style={styles.detailsSection}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Game Type</Text>
                                        <Text style={styles.detailValue}>{getGameTypeLabel(player?.gameType)}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Gender</Text>
                                        <Text style={styles.detailValue}>{getGenderLabel(player?.gender)}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Win Rate</Text>
                                        <Text style={styles.detailValue}>{player.winPercentage.toFixed(1)}%</Text>
                                    </View>
                                </View>

                                {/* Match History */}
                                <View style={styles.historySection}>
                                    <Text style={styles.sectionTitle}>Recent Matches</Text>
                                    {playerMatches.length > 0 ? (
                                        playerMatches.map(match => {
                                            const isPlayer1 = match.player1Id === player.id;
                                            const isWinner = match.winnerId === player.id;
                                            const opponentName = isPlayer1 ? match.player2Name : match.player1Name;
                                            const playerScore = isPlayer1 ? match.player1Points : match.player2Points;
                                            const opponentScore = isPlayer1 ? match.player2Points : match.player1Points;

                                            return (
                                                <View key={match.id} style={styles.matchCard}>
                                                    <View style={styles.matchInfo}>
                                                        <Text style={styles.opponentName}>vs {opponentName}</Text>
                                                        <View style={styles.scoreRow}>
                                                            <Text style={styles.score}>{playerScore} - {opponentScore}</Text>
                                                            {isWinner && (
                                                                <View style={styles.winBadge}>
                                                                    <Trophy size={14} color={Colors.success} />
                                                                    <Text style={styles.winText}>Win</Text>
                                                                </View>
                                                            )}
                                                            {!isWinner && (
                                                                <View style={styles.lossBadge}>
                                                                    <Text style={styles.lossText}>Loss</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })
                                    ) : (
                                        <Text style={styles.emptyText}>No match history</Text>
                                    )}
                                </View>
                            </>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No player selected</Text>
                            </View>
                        )}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: Colors.background,
        borderRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    content: {
        flexGrow: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.primary,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.primary,
        marginBottom: 16,
    },
    avatarPlaceholderText: {
        fontSize: 40,
        fontWeight: '700' as const,
        color: Colors.primary,
    },
    playerName: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.text,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 32,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    detailsSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '600' as const,
    },
    detailValue: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600' as const,
    },
    historySection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.text,
        marginBottom: 16,
    },
    matchCard: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    matchInfo: {
        gap: 8,
    },
    opponentName: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    score: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    winBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    winText: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: Colors.success,
    },
    lossBadge: {
        backgroundColor: Colors.error + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    lossText: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: Colors.error,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 24,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
    },
});
