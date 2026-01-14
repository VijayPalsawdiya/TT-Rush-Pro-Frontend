import Colors from '@/constants/colors';
import { User, Users } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ModeType = 'singles' | 'doubles';

interface ModeSelectorProps {
    selectedMode: ModeType;
    onModeChange: (mode: ModeType) => void;
}

export default function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
    return (
        <View style={styles.modeSelector}>
            <TouchableOpacity
                style={[styles.modeBtn, selectedMode === 'singles' && styles.modeBtnActive]}
                onPress={() => onModeChange('singles')}
                activeOpacity={0.7}
            >
                <User size={18} color={selectedMode === 'singles' ? Colors.background : Colors.textSecondary} />
                <Text style={[styles.modeText, selectedMode === 'singles' && styles.modeTextActive]}>
                    Singles
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.modeBtn, selectedMode === 'doubles' && styles.modeBtnActive]}
                onPress={() => onModeChange('doubles')}
                activeOpacity={0.7}
            >
                <Users size={18} color={selectedMode === 'doubles' ? Colors.background : Colors.textSecondary} />
                <Text style={[styles.modeText, selectedMode === 'doubles' && styles.modeTextActive]}>
                    Doubles
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    modeSelector: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: Colors.surface,
        padding: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    modeBtnActive: {
        backgroundColor: Colors.primary,
    },
    modeText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
    },
    modeTextActive: {
        color: Colors.background,
    },
});
