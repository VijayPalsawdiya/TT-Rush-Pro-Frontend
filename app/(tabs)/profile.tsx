import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Edit, Gamepad2, LogOut, Phone, Trash2, User } from 'lucide-react-native';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, deleteAccount } = useAuth();

    const handleEditProfile = () => {
        router.push('/edit-profile');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: deleteAccount },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                {user?.photoUrl && (
                    <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                )}
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.points || 0}</Text>
                    <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.totalWins || 0}</Text>
                    <Text style={styles.statLabel}>Wins</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.totalMatches || 0}</Text>
                    <Text style={styles.statLabel}>Matches</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Details</Text>

                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <User size={20} color={Colors.textSecondary} />
                        <Text style={styles.detailLabel}>Gender</Text>
                        <Text style={styles.detailValue}>{user?.gender || 'Not set'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Phone size={20} color={Colors.textSecondary} />
                        <Text style={styles.detailLabel}>Phone</Text>
                        <Text style={styles.detailValue}>{user?.phoneNumber || 'Not set'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Gamepad2 size={20} color={Colors.textSecondary} />
                        <Text style={styles.detailLabel}>Game Type</Text>
                        <Text style={styles.detailValue}>
                            {user?.gameType === 'right-hand' ? 'Right Hand' : user?.gameType === 'left-hand' ? 'Left Hand' : 'Not set'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleEditProfile}
                    activeOpacity={0.7}
                >
                    <Edit size={20} color={Colors.primary} />
                    <Text style={styles.actionBtnText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <LogOut size={20} color={Colors.textSecondary} />
                    <Text style={styles.actionBtnText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.dangerBtn]}
                    onPress={handleDeleteAccount}
                    activeOpacity={0.7}
                >
                    <Trash2 size={20} color={Colors.accent} />
                    <Text style={[styles.actionBtnText, styles.dangerText]}>Delete Account</Text>
                </TouchableOpacity>
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
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    name: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    email: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    stats: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800' as const,
        color: Colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
    },
    divider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 32,
        gap: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.text,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        gap: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailLabel: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    dangerBtn: {
        borderColor: Colors.accent,
    },
    dangerText: {
        color: Colors.accent,
    },
});
