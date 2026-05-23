import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { DimensionItem } from '../types';
import { areaFromItem } from '../calculations';
import { formatArea } from '../calculations';
import { colors, radius, spacing } from '../theme';

interface Props {
  item: DimensionItem;
  placeholderLabel: string;
  firstFieldLabel?: string;
  secondFieldLabel?: string;
  areaLabel?: string;
  onChange: (id: string, field: keyof DimensionItem, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export function DimensionCard({
  item,
  placeholderLabel,
  firstFieldLabel = 'Ширина (м)',
  secondFieldLabel = 'Височина (м)',
  areaLabel = 'Площ',
  onChange,
  onRemove,
  canRemove,
}: Props) {
  const area = areaFromItem(item);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TextInput
          style={styles.labelInput}
          value={item.label}
          onChangeText={(v) => onChange(item.id, 'label', v)}
          placeholder={placeholderLabel}
          placeholderTextColor={colors.textMuted}
        />
        {canRemove && (
          <Pressable onPress={() => onRemove(item.id)} hitSlop={8}>
            <Text style={styles.remove}>Премахни</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{firstFieldLabel}</Text>
          <TextInput
            style={styles.input}
            value={item.width}
            onChangeText={(v) => onChange(item.id, 'width', v)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <Text style={styles.times}>×</Text>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{secondFieldLabel}</Text>
          <TextInput
            style={styles.input}
            value={item.height}
            onChangeText={(v) => onChange(item.id, 'height', v)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <Text style={styles.area}>
        {areaLabel}: <Text style={styles.areaValue}>{formatArea(area)} м²</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 4,
  },
  remove: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
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
  times: {
    fontSize: 20,
    color: colors.textMuted,
    paddingBottom: 12,
  },
  area: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
  },
  areaValue: {
    fontWeight: '700',
    color: colors.primary,
  },
});
