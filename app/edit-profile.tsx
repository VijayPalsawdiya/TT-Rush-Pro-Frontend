import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { GameType, Gender } from '@/types';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { uploadService } from '@/services';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [gender, setGender] = useState<Gender | undefined>(user?.gender);
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [gameType, setGameType] = useState<GameType | undefined>(user?.gameType);
    const [photoUrl, setPhotoUrl] = useState(user?.photoUrl);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true, // ✅ Get base64 for Cloudinary upload
            });

            if (result.canceled) return;

            const base64Image = result.assets[0].base64;
            if (!base64Image) {
                Alert.alert('Error', 'Failed to process image');
                return;
            }

            setUploading(true);

            try {
                // ✅ Upload to Cloudinary
                const cloudinaryUrl = await uploadService.uploadImage(
                    `data:image/jpeg;base64,${base64Image}`,
                    'profile-pictures'
                );

                console.log('✅ Image uploaded to Cloudinary:', cloudinaryUrl);
                setPhotoUrl(cloudinaryUrl);
                Alert.alert('Success', 'Image uploaded successfully!');
            } catch (error) {
                console.error('❌ Upload error:', error);
                Alert.alert('Error', 'Failed to upload image. Please try again.');
            } finally {
                setUploading(false);
            }
        } catch (error) {
            console.error('❌ Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSave = async () => {
        if (!name || !gender || !phoneNumber || !gameType) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSaving(true);

        try {
            await updateProfile({
                name,
                gender,
                phoneNumber,
                gameType,
                photoUrl,
            });

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('❌ Save error:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const isValid = name && gender && phoneNumber && gameType;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!isValid}
                    activeOpacity={0.7}
                >
                    <Save size={24} color={isValid ? Colors.primary : Colors.textTertiary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Photo */}
                <TouchableOpacity
                    style={styles.photoContainer}
                    onPress={pickImage}
                    activeOpacity={0.7}
                    disabled={uploading}
                >
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.photo} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Camera size={32} color={Colors.textSecondary} />
                        </View>
                    )}
                    <View style={styles.photoOverlay}>
                        {uploading ? (
                            <ActivityIndicator size="small" color={Colors.background} />
                        ) : (
                            <Camera size={16} color={Colors.background} />
                        )}
                    </View>
                </TouchableOpacity>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={Colors.textTertiary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.optionsRow}>
                            <TouchableOpacity
                                style={[styles.option, gender === 'male' && styles.optionSelected]}
                                onPress={() => setGender('male')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionText, gender === 'male' && styles.optionTextSelected]}>
                                    Male
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.option, gender === 'female' && styles.optionSelected]}
                                onPress={() => setGender('female')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionText, gender === 'female' && styles.optionTextSelected]}>
                                    Female
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="+1 234 567 8900"
                            placeholderTextColor={Colors.textTertiary}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Game Type</Text>
                        <View style={styles.optionsRow}>
                            <TouchableOpacity
                                style={[styles.option, gameType === 'right-hand' && styles.optionSelected]}
                                onPress={() => setGameType('right-hand')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionText, gameType === 'right-hand' && styles.optionTextSelected]}>
                                    Right Hand
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.option, gameType === 'left-hand' && styles.optionSelected]}
                                onPress={() => setGameType('left-hand')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionText, gameType === 'left-hand' && styles.optionTextSelected]}>
                                    Left Hand
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, (!isValid || saving) && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!isValid || saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color={Colors.background} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 32,
    },
    photoContainer: {
        alignSelf: 'center',
        position: 'relative',
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.background,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.text,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    option: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    optionSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    optionText: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
    },
    optionTextSelected: {
        color: Colors.background,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700' as const,
        color: Colors.background,
    },
});
