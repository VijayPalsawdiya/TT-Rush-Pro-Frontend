import Colors from '@/constants/colors';
import { User } from '@/types';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface DoublesModalProps {
    visible: boolean;
    onClose: () => void;
    users: User[];
    onChallenge: (partnerId: string, partnerName: string, partnerPhoto: string | undefined, opponentId: string, opponentName: string, opponentPhoto: string | undefined, message?: string) => void;
}

export default function DoublesModal({ visible, onClose, users, onChallenge }: DoublesModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState('');
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
    const [selectedOpponent, setSelectedOpponent] = useState<User | null>(null);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter out already selected users
    const availableUsers = filteredUsers.filter(u => {
        if (selectedPartner && u.id === selectedPartner.id) return false;
        if (selectedOpponent && u.id === selectedOpponent.id) return false;
        return true;
    });

    const handleChallenge = () => {
        if (!selectedPartner || !selectedOpponent) return;

        onChallenge(
            selectedPartner.id,
            selectedPartner.name,
            selectedPartner.photoUrl,
            selectedOpponent.id,
            selectedOpponent.name,
            selectedOpponent.photoUrl,
            message
        );

        // Reset state
        setSearchQuery('');
        setMessage('');
        setSelectedPartner(null);
        setSelectedOpponent(null);
        onClose();
    };

    const handleClose = () => {
        setSearchQuery('');
        setMessage('');
        setSelectedPartner(null);
        setSelectedOpponent(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.backdrop} onPress={handleClose}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Doubles Challenge</Text>
                        <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                            <X size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Message Box */}
                    <View style={styles.messageContainer}>
                        <Text style={styles.label}>Message (Optional)</Text>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Add a message to your challenge..."
                            placeholderTextColor={Colors.textTertiary}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* User List - Select Partner */}
                    <View style={styles.listContainer}>
                        <Text style={styles.label}>Select Partner</Text>
                        <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
                            {users.map(user => (
                                <TouchableOpacity
                                    key={user.id}
                                    style={[
                                        styles.userCard,
                                        selectedPartner?.id === user.id && styles.userCardSelected,
                                    ]}
                                    onPress={() => setSelectedPartner(user)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.userInfo}>
                                        {user.photoUrl && (
                                            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                                        )}
                                        <View style={styles.userDetails}>
                                            <Text style={styles.userName}>{user.name}</Text>
                                            <View style={styles.userStats}>
                                                <Text style={styles.statText}>{user.points} pts</Text>
                                                <Text style={styles.dot}>•</Text>
                                                <Text style={styles.statText}>Rank #{user.rank || 'N/A'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {selectedPartner?.id === user.id && (
                                        <View style={styles.selectedIndicator} />
                                    )}
                                </TouchableOpacity>
                            ))}

                            {users.length === 0 && (
                                <Text style={styles.emptyText}>No players found</Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.challengeButton,
                                !selectedPartner && styles.challengeButtonDisabled,
                            ]}
                            onPress={() => {
                                if (!selectedPartner) return;
                                onChallenge(
                                    selectedPartner.id,
                                    selectedPartner.name,
                                    selectedPartner.photoUrl,
                                    '',
                                    '',
                                    undefined,
                                    message
                                );
                                setMessage('');
                                setSelectedPartner(null);
                                onClose();
                            }}
                            activeOpacity={0.7}
                            disabled={!selectedPartner}
                        >
                            <Text style={[
                                styles.challengeButtonText,
                                !selectedPartner && styles.challengeButtonTextDisabled,
                            ]}>
                                Challenge
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    messageContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    messageInput: {
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
        color: Colors.text,
        minHeight: 80,
    },
    selectedSection: {
        marginBottom: 12,
    },
    selectedLabel: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
        marginBottom: 6,
    },
    selectedUserCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.surfaceLight,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    selectedAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    selectedUserName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    listContainer: {
        marginBottom: 16,
    },
    userList: {
        maxHeight: 180,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.background,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 8,
    },
    userCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.surfaceLight,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    userDetails: {
        gap: 4,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    userStats: {
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
    selectedIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.primary,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
    },
    challengeButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    challengeButtonDisabled: {
        backgroundColor: Colors.border,
    },
    challengeButtonText: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.background,
    },
    challengeButtonTextDisabled: {
        color: Colors.textTertiary,
    },
});
