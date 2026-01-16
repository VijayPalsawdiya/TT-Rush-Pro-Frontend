import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Bell, Check, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification } from '@/services/notificationService';
import { matchChallengeService } from '@/services/matchChallengeService';
import { useState, useEffect } from 'react';

export default function NotificationsScreen() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

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

    const handleAccept = async (notificationId: string, challengeId?: string) => {
        if (!challengeId) return;

        try {
            await matchChallengeService.acceptChallenge(challengeId);
            await notificationService.markAsRead(notificationId);

            Alert.alert('Success', 'Challenge accepted!');
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
                                            handleAccept(notification._id, notification.relatedId);
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
