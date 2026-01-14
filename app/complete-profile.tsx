import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { Gender, GameType } from '@/types';

export default function CompleteProfileScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [gender, setGender] = useState<Gender | undefined>(user?.gender);
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [gameType, setGameType] = useState<GameType | undefined>(user?.gameType);
    const [photoUrl, setPhotoUrl] = useState(user?.photoUrl);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotoUrl(result.assets[0].uri);
        }
    };

    const handleComplete = async () => {
        if (!name || !gender || !phoneNumber || !gameType) {
            return;
        }

        await updateProfile({
            name,
            gender,
            phoneNumber,
            gameType,
            photoUrl,
        });

        router.replace('/onboarding');
    };

    const isValid = name && gender && phoneNumber && gameType;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>Let&apos;s get to know you better</Text>

                <TouchableOpacity style={styles.photoContainer} onPress={pickImage} activeOpacity={0.7}>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.photo} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Camera size={32} color={Colors.textSecondary} />
                        </View>
                    )}
                    <View style={styles.photoOverlay}>
                        <Text style={styles.photoText}>Change Photo</Text>
                    </View>
                </TouchableOpacity>

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

                <TouchableOpacity
                    style={[styles.button, !isValid && styles.buttonDisabled]}
                    onPress={handleComplete}
                    disabled={!isValid}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 60,
    },
    inner: {
        gap: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800' as const,
        color: Colors.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: -24,
    },
    photoContainer: {
        alignSelf: 'center',
        position: 'relative',
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
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
        borderStyle: 'dashed',
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 217, 255, 0.9)',
        paddingVertical: 6,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        alignItems: 'center',
    },
    photoText: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: Colors.background,
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
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '700' as const,
        color: Colors.background,
    },
});
