import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Bell, Check, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { notificationService, Notification } from '@/services/notificationService';
import { matchChallengeService, MatchChallenge } from '@/services/matchChallengeService';
import PartnerSelectionModal from '@/components/PartnerSelectionModal';
import { useState, useEffect } from 'react';

export default function NotificationsScreen() {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [partnerModalVisible, setPartnerModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [selectedChallenge, setSelectedChallenge] = useState<MatchChallenge | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Listen for socket events
    useEffect(() => {
        if (!socket) return;

        console.log('🎧 Setting up socket listeners for notifications screen');

        // Listen for new notifications
        socket.on('notification:new', (notification) => {
            console.log('📥 Received notification:new event', notification);
            fetchNotifications(); // Refresh notifications
        });

        // Cleanup listener
        return () => {
            socket.off('notification:new');
        };
    }, [socket]);

    const fetchNotifications = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const fetchedNotifications = await notificationService.getNotifications();
            setNotifications(fetchedNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const onRefresh = () => {
        fetchNotifications(true);
    };

    const handleAccept = async (notification: Notification) => {
        const challengeId = notification.relatedId;
        if (!challengeId) return;

        try {
            // Fetch challenge details to check if it's doubles
            const challenges = await matchChallengeService.getChallenges();
            const challenge = challenges.find((c: MatchChallenge) => c._id === challengeId);

            if (!challenge) {
                Alert.alert('Error', 'Challenge not found');
                return;
            }

            // If doubles, show partner selection modal
            if (!challenge.isSingles) {
                setSelectedNotification(notification);
                setSelectedChallenge(challenge);
                setPartnerModalVisible(true);
            } else {
                // Singles - accept immediately
                await matchChallengeService.acceptChallenge(challengeId);
                await notificationService.markAsRead(notification._id);

                Alert.alert(
                    'Challenge Accepted!',
                    'A match has been created and will appear in your Upcoming Matches on the Home screen.',
                    [{ text: 'OK' }]
                );
                fetchNotifications();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to accept challenge');
        }
    };

    const handlePartnerSelected = async (partnerId: string, partnerName: string) => {
        if (!selectedNotification || !selectedChallenge) return;

        try {
            await matchChallengeService.acceptChallenge(selectedChallenge._id, partnerId);
            await notificationService.markAsRead(selectedNotification._id);

            Alert.alert(
                'Challenge Accepted!',
                `You and ${partnerName} will face ${selectedChallenge.fromUser?.name || 'the challenger'}. Match will appear in Upcoming Matches.`,
                [{ text: 'OK' }]
            );

            setPartnerModalVisible(false);
            setSelectedNotification(null);
            setSelectedChallenge(null);
            fetchNotifications();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to accept challenge');
        }
    };

    const handleReject = async (notificationId: string, challengeId?: string) => {
        if (!challengeId) return;

        try {
            await matchChallengeService.rejectChallenge(challengeId);
            await notificationService.markAsRead(notificationId);

            Alert.alert('Success', 'Challenge rejected');
            fetchNotifications();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to reject challenge');
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    if (isLoading && notifications.length === 0) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
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
                {notifications.map(notification => (
                    <TouchableOpacity
                        key={notification._id}
                        style={[styles.notificationCard, !notification.read && styles.unread]}
                        onPress={() => {
                            if (!notification.read) {
                                handleMarkAsRead(notification._id);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Bell size={20} color={Colors.primary} />
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.notificationTitle}>{notification.title}</Text>
                            <Text style={styles.notificationMessage}>{notification.message}</Text>
                            <Text style={styles.notificationTime}>
                                {new Date(notification.createdAt).toLocaleDateString()}
                            </Text>

                            {notification.type === 'challenge-received' && !notification.read && (
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.acceptBtn]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleAccept(notification);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Check size={16} color={Colors.background} />
                                        <Text style={styles.actionBtnText}>Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.rejectBtn]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleReject(notification._id, notification.relatedId);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <X size={16} color={Colors.background} />
                                        <Text style={styles.actionBtnText}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {notifications.length === 0 && (
                    <Text style={styles.emptyText}>No notifications yet</Text>
                )}
            </ScrollView>

            {/* Partner Selection Modal for Doubles */}
            <PartnerSelectionModal
                visible={partnerModalVisible}
                onClose={() => {
                    setPartnerModalVisible(false);
                    setSelectedNotification(null);
                    setSelectedChallenge(null);
                }}
                onSelectPartner={handlePartnerSelected}
                excludeUserIds={[
                    user?.id || '',
                    selectedChallenge?.fromUser?._id || '',
                    selectedChallenge?.partnerId?._id || ''
                ].filter(Boolean)}
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
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    unread: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        gap: 6,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    notificationMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: Colors.textTertiary,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    acceptBtn: {
        backgroundColor: Colors.success,
    },
    rejectBtn: {
        backgroundColor: Colors.accent,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.background,
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
