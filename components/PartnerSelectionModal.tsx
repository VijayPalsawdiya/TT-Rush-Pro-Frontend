import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import { User } from '@/types';
import { userService } from '@/services/userService';

interface PartnerSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectPartner: (partnerId: string, partnerName: string) => void;
    excludeUserIds?: string[]; // Users to exclude from selection
}

export default function PartnerSelectionModal({
    visible,
    onClose,
    onSelectPartner,
    excludeUserIds = [],
}: PartnerSelectionModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);

    useEffect(() => {
        if (visible) {
            fetchUsers();
        }
    }, [visible]);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await userService.getAllUsers();
            // Filter out excluded users
            const availableUsers = fetchedUsers.filter(
                (user) => !excludeUserIds.includes(user.id)
            );
            setUsers(availableUsers);
            setFilteredUsers(availableUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterUsers = () => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
            return;
        }

        const filtered = users.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const handleSelectPartner = (user: User) => {
        setSelectedPartner(user);
    };

    const handleConfirm = () => {
        if (selectedPartner) {
            onSelectPartner(selectedPartner.id, selectedPartner.name);
            handleClose();
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSelectedPartner(null);
        onClose();
    };

    const renderUser = ({ item }: { item: User }) => {
        const isSelected = selectedPartner?.id === item.id;

        return (
            <TouchableOpacity
                style={[styles.userCard, isSelected && styles.selectedUserCard]}
                onPress={() => handleSelectPartner(item)}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: item.photoUrl || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userRanking}>Ranking: {item.ranking || 0}</Text>
                </View>
                {isSelected && (
                    <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Your Partner</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <Search size={20} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search players..."
                            placeholderTextColor={Colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* User List */}
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredUsers}
                            renderItem={renderUser}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No players found</Text>
                            }
                        />
                    )}

                    {/* Confirm Button */}
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            !selectedPartner && styles.confirmButtonDisabled,
                        ]}
                        onPress={handleConfirm}
                        disabled={!selectedPartner}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.confirmButtonText}>
                            {selectedPartner
                                ? `Confirm Partner: ${selectedPartner.name}`
                                : 'Select a Partner'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    list: {
        padding: 16,
        paddingTop: 0,
        gap: 12,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedUserCard: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '10',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    userRanking: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    checkmark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: Colors.background,
        fontSize: 18,
        fontWeight: '700',
    },
    confirmButton: {
        backgroundColor: Colors.primary,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: Colors.textSecondary,
        opacity: 0.5,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.background,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        fontSize: 14,
        paddingVertical: 40,
    },
});
