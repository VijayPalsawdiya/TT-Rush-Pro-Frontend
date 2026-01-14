import Colors from '@/constants/colors';
import { User } from '@/types';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ChallengeModalProps {
    visible: boolean;
    onClose: () => void;
    users: User[];
    onChallenge: (userId: string, userName: string, userPhoto?: string, message?: string) => void;
}

export default function ChallengeModal({ visible, onClose, users, onChallenge }: ChallengeModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Debug logging
    console.log('ChallengeModal - Total users:', users.length);
    console.log('ChallengeModal - Filtered users:', filteredUsers.length);

    const handleChallenge = () => {
        if (!selectedUser) return;

        onChallenge(selectedUser.id, selectedUser.name, selectedUser.photoUrl, message);

        // Reset state
        setSearchQuery('');
        setMessage('');
        setSelectedUser(null);
        onClose();
    };

    const handleClose = () => {
        setSearchQuery('');
        setMessage('');
        setSelectedUser(null);
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
                        <Text style={styles.title}>Challenge Player</Text>
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
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
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
                            style={styles.challengeButton}
                            onPress={() => {
                                onChallenge('', '', undefined, message);
                                setMessage('');
                                onClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.challengeButtonText}>Challenge</Text>
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
    listContainer: {
        marginBottom: 16,
    },
    userList: {
        maxHeight: 200,
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
