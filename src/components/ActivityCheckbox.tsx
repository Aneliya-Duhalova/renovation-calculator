import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ActivityPrice } from '../types';
import { CURRENCY, getActivityDef } from '../constants';
import { colors, radius, spacing } from '../theme';

interface Props {
  price: ActivityPrice;
  selected: boolean;
  onToggle: (id: string) => void;
}

function unitLabel(unit: ActivityPrice['unit']): string {
  return unit === 'lm' ? 'л.м.' : 'м²';
}

export function ActivityCheckbox({ price, selected, onToggle }: Props) {
  const def = getActivityDef(price.id);
  if (!def) return null;

  const priceLabel = def.priceOnRequest
    ? 'По договаряне'
    : `${price.price.toFixed(2)} ${CURRENCY} / ${unitLabel(price.unit)}`;

  return (
    <Pressable
      style={[styles.row, selected && styles.rowSelected]}
      onPress={() => onToggle(price.id)}
    >
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Text style={styles.check}>✓</Text>}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{def.name}</Text>
        <Text style={[styles.meta, def.priceOnRequest && styles.metaPending]}>{priceLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  check: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaPending: {
    color: colors.accent,
    fontStyle: 'italic',
  },
});
