import ChallengeModal from '@/components/ChallengeModal';
import DoublesModal from '@/components/DoublesModal';
import ModeSelector from '@/components/ModeSelector';
import PlayerProfileModal from '@/components/PlayerProfileModal';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge } from '@/types';
import { Image } from 'expo-image';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChallengeScreen() {
    const { user } = useAuth();
    const { users, sendChallenge, matches } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMode, setSelectedMode] = useState<'singles' | 'doubles'>('singles');
    const [singlesModalVisible, setSinglesModalVisible] = useState(false);
    const [doublesModalVisible, setDoublesModalVisible] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<typeof users[0] | null>(null);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [profilePlayer, setProfilePlayer] = useState<typeof users[0] | null>(null);

    // Users available for challenges (excluding current user)
    const availableUsers = users.filter(u => u.id !== user?.id);

    // Filtered users for doubles mode search
    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSinglesChallenge = async (opponentId: string, opponentName: string, opponentPhoto?: string, message?: string) => {
        if (!user || !selectedPlayer) return;

        const challenge: Challenge = {
            id: `c${Date.now()}`,
            fromUserId: user.id,
            toUserId: selectedPlayer.id,
            fromUserName: user.name,
            toUserName: selectedPlayer.name,
            fromUserPhoto: user.photoUrl,
            toUserPhoto: selectedPlayer.photoUrl,
            message: message,
            status: 'pending',
            createdAt: new Date(),
            isSingles: true,
        };

        await sendChallenge(challenge);
        setSelectedPlayer(null);
    };

    const handleDoublesChallenge = async (
        partnerId: string,
        partnerName: string,
        partnerPhoto: string | undefined,
        opponentId: string,
        opponentName: string,
        opponentPhoto: string | undefined,
        message?: string
    ) => {
        if (!user || !selectedPlayer) return;

        const challenge: Challenge = {
            id: `c${Date.now()}`,
            fromUserId: user.id,
            toUserId: selectedPlayer.id,
            fromUserName: user.name,
            toUserName: selectedPlayer.name,
            fromUserPhoto: user.photoUrl,
            toUserPhoto: selectedPlayer.photoUrl,
            partnerId: partnerId,
            partnerName: partnerName,
            message: message,
            status: 'pending',
            createdAt: new Date(),
            isSingles: false,
        };

        await sendChallenge(challenge);
        setSelectedPlayer(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Challenge</Text>

                <ModeSelector
                    selectedMode={selectedMode}
                    onModeChange={setSelectedMode}
                />

                <View style={styles.searchContainer}>
                    <Search size={20} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search players..."
                        placeholderTextColor={Colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {filteredUsers.map(player => (
                    <View key={player.id} style={styles.playerCard}>
                        <TouchableOpacity
                            style={styles.playerInfo}
                            onPress={() => {
                                setProfilePlayer(player);
                                setProfileModalVisible(true);
                            }}
                            activeOpacity={0.7}
                        >
                            {player.photoUrl && (
                                <Image source={{ uri: player.photoUrl }} style={styles.avatar} />
                            )}
                            <View style={styles.playerDetails}>
                                <Text style={styles.playerName}>{player.name}</Text>
                                <View style={styles.playerStats}>
                                    <Text style={styles.statText}>{player.points} pts</Text>
                                    <Text style={styles.dot}>•</Text>
                                    <Text style={styles.statText}>Rank #{player.rank || 'N/A'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.challengeBtn}
                            onPress={() => {
                                setSelectedPlayer(player);
                                if (selectedMode === 'singles') {
                                    setSinglesModalVisible(true);
                                } else {
                                    setDoublesModalVisible(true);
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.challengeBtnText}>Challenge</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {availableUsers.length === 0 && (
                    <Text style={styles.emptyText}>No players found</Text>
                )}
            </ScrollView>

            <ChallengeModal
                visible={singlesModalVisible}
                onClose={() => setSinglesModalVisible(false)}
                users={availableUsers}
                onChallenge={handleSinglesChallenge}
            />

            <DoublesModal
                visible={doublesModalVisible}
                onClose={() => setDoublesModalVisible(false)}
                users={availableUsers}
                onChallenge={handleDoublesChallenge}
            />

            <PlayerProfileModal
                visible={profileModalVisible}
                onClose={() => setProfileModalVisible(false)}
                player={profilePlayer}
                matches={matches}
            />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    challengePlayerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.primary,
    },
    challengePlayerBtnText: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.background,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 12,
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    playerDetails: {
        gap: 4,
        flex: 1,
    },
    playerName: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    playerStats: {
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
    challengeBtn: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    challengeBtnText: {
        fontSize: 14,
        fontWeight: '700' as const,
        color: Colors.background,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 48,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    placeholderTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.text,
        textAlign: 'center',
    },
    placeholderText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
