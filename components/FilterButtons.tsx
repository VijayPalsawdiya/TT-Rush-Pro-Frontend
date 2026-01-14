import Colors from '@/constants/colors';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterButtonsProps {
    filters: string[];
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
}

export default function FilterButtons({ filters, selectedFilter, onFilterChange }: FilterButtonsProps) {
    return (
        <View style={styles.filters}>
            {filters.map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[styles.filterBtn, selectedFilter === filter && styles.filterBtnActive]}
                    onPress={() => onFilterChange(filter)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    filters: {
        flexDirection: 'row',
        gap: 8,
    },
    filterBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
    },
    filterTextActive: {
        color: Colors.background,
    },
});
