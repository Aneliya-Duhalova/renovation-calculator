import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ceilingArea } from '../rooms';
import type { CeilingDimensions } from '../types';
import { formatArea } from '../calculations';
import { colors, radius, spacing } from '../theme';

interface Props {
  ceiling: CeilingDimensions;
  onChangeWidth: (value: string) => void;
  onChangeLength: (value: string) => void;
}

export function CeilingInput({ ceiling, onChangeWidth, onChangeLength }: Props) {
  const area = ceilingArea(ceiling);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Таван</Text>
      <Text style={styles.hint}>Площ на тавана = ширина × дължина на помещението</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Ширина (м)</Text>
          <TextInput
            style={styles.input}
            value={ceiling.width}
            onChangeText={onChangeWidth}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Ширина на таван в метри"
          />
        </View>
        <Text style={styles.times}>×</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Дължина (м)</Text>
          <TextInput
            style={styles.input}
            value={ceiling.length}
            onChangeText={onChangeLength}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Дължина на таван в метри"
          />
        </View>
      </View>
      <Text style={styles.area}>
        Площ таван: <Text style={styles.areaVal}>{formatArea(area)} м²</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 17,
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  field: { flex: 1 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.background,
  },
  times: { fontSize: 20, color: colors.textMuted, paddingBottom: 12 },
  area: { marginTop: spacing.sm, fontSize: 14, color: colors.textMuted },
  areaVal: { fontWeight: '700', color: colors.primary },
});
