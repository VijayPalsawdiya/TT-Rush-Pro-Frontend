import ChallengeModal from '@/components/ChallengeModal';
import DoublesModal from '@/components/DoublesModal';
import ModeSelector from '@/components/ModeSelector';
import PlayerProfileModal from '@/components/PlayerProfileModal';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { userService } from '@/services/userService';
import { matchChallengeService, ChallengeStatus } from '@/services/matchChallengeService';
import { Image } from 'expo-image';
import { Search } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, RefreshControl, Alert } from 'react-native';

export default function ChallengeScreen() {
    const { user } = useAuth();
    const { matches } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMode, setSelectedMode] = useState<'singles' | 'doubles'>('singles');
    const [singlesModalVisible, setSinglesModalVisible] = useState(false);
    const [doublesModalVisible, setDoublesModalVisible] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [profilePlayer, setProfilePlayer] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [challengeStatuses, setChallengeStatuses] = useState<Record<string, ChallengeStatus>>({});
    const hasFetchedStatuses = useRef(false);
    const isFetchingStatuses = useRef(false);

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch challenge statuses only once when users are loaded
    useEffect(() => {
        if (users.length > 0 && user && !hasFetchedStatuses.current && !isFetchingStatuses.current) {
            hasFetchedStatuses.current = true;
            fetchChallengeStatuses();
        }
    }, [users.length, user]);

    const fetchUsers = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const fetchedUsers = await userService.getAllUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchChallengeStatuses = async () => {
        if (!user || isFetchingStatuses.current) return;

        isFetchingStatuses.current = true;
        console.log('🔄 Fetching challenge statuses (BATCH)...');

        try {
            const availableUsers = users.filter(u => u.id !== user.id);
            const userIds = availableUsers.map(u => u.id);

            if (userIds.length === 0) {
                setChallengeStatuses({});
                return;
            }

            // Use batch endpoint - ONE API call instead of N calls
            const statuses = await matchChallengeService.getBatchChallengeStatus(userIds);

            setChallengeStatuses(statuses);
            console.log('✅ Batch challenge statuses fetched:', Object.keys(statuses).length, 'users');
        } catch (error) {
            console.error('Error fetching challenge statuses:', error);
        } finally {
            isFetchingStatuses.current = false;
        }
    };

    const onRefresh = () => {
        hasFetchedStatuses.current = false; // Reset to allow refetch
        fetchUsers(true);
    };

    // Users available for challenges (excluding current user)
    const availableUsers = users.filter(u => u.id !== user?.id);

    // Filtered users for doubles mode search
    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSinglesChallenge = async (opponentId: string, opponentName: string, opponentPhoto?: string, message?: string) => {
        if (!user || !selectedPlayer) return;

        try {
            await matchChallengeService.sendChallenge({
                toUserId: selectedPlayer.id,
                message: message,
                isSingles: true,
            });

            Alert.alert('Success', `Challenge sent to ${selectedPlayer.name}!`);
            setSinglesModalVisible(false);
            setSelectedPlayer(null);

            // Refresh challenge statuses
            hasFetchedStatuses.current = false;
            fetchChallengeStatuses();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send challenge');
        }
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

        try {
            await matchChallengeService.sendChallenge({
                toUserId: selectedPlayer.id,
                message: message,
                isSingles: false,
                partnerId: partnerId,
            });

            Alert.alert('Success', `Doubles challenge sent to ${selectedPlayer.name}!`);
            setDoublesModalVisible(false);
            setSelectedPlayer(null);

            // Refresh challenge statuses
            hasFetchedStatuses.current = false;
            fetchChallengeStatuses();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send challenge');
        }
    };

    const getChallengeButtonText = (userId: string): string => {
        const status = challengeStatuses[userId];
        if (!status) return 'Challenge';

        if (!status.canChallenge) {
            if (status.reason === 'pending') {
                return status.isSender ? 'Challenge Sent' : 'Pending';
            }
            if (status.reason === 'limit_reached') {
                return 'Limit Reached';
            }
        }

        return 'Challenge';
    };

    const isChallengeDisabled = (userId: string): boolean => {
        const status = challengeStatuses[userId];
        return status ? !status.canChallenge : false;
    };

    if (isLoading && users.length === 0) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading players...</Text>
            </View>
        );
    }

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

            <ScrollView
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
                {filteredUsers.map(player => {
                    const buttonText = getChallengeButtonText(player.id);
                    const isDisabled = isChallengeDisabled(player.id);

                    return (
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
                                style={[
                                    styles.challengeBtn,
                                    isDisabled && styles.challengeBtnDisabled
                                ]}
                                onPress={() => {
                                    if (!isDisabled) {
                                        setSelectedPlayer(player);
                                        if (selectedMode === 'singles') {
                                            setSinglesModalVisible(true);
                                        } else {
                                            setDoublesModalVisible(true);
                                        }
                                    }
                                }}
                                activeOpacity={isDisabled ? 1 : 0.7}
                                disabled={isDisabled}
                            >
                                <Text style={[
                                    styles.challengeBtnText,
                                    isDisabled && styles.challengeBtnTextDisabled
                                ]}>
                                    {buttonText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

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
    challengeBtnDisabled: {
        backgroundColor: Colors.textTertiary,
        opacity: 0.5,
    },
    challengeBtnText: {
        fontSize: 14,
        fontWeight: '700' as const,
        color: Colors.background,
    },
    challengeBtnTextDisabled: {
        color: Colors.textSecondary,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 48,
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
