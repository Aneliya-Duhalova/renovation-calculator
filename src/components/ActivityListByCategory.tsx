import { StyleSheet, Text, View } from 'react-native';
import { ActivityCheckbox } from './ActivityCheckbox';
import { activitiesByCategory, CATEGORY_LABELS, CATEGORY_ORDER } from '../constants';
import type { ActivityPrice } from '../types';
import { colors, spacing } from '../theme';

interface Props {
  prices: ActivityPrice[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}

export function ActivityListByCategory({ prices, selected, onToggle }: Props) {
  const grouped = activitiesByCategory();

  return (
    <>
      {CATEGORY_ORDER.map((category) => {
        const defs = grouped.get(category) ?? [];
        const categoryPrices = defs
          .map((d) => prices.find((p) => p.id === d.id))
          .filter((p): p is ActivityPrice => Boolean(p));

        if (categoryPrices.length === 0) return null;

        const isPendingSection = category === 'plumbing' || category === 'electrical';

        return (
          <View key={category} style={styles.block}>
            <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
            {isPendingSection && (
              <Text style={styles.categoryHint}>
                Услугите са без зададени цени – изберете ги за офертата; сумата е по договаряне.
              </Text>
            )}
            {categoryPrices.map((price) => (
              <ActivityCheckbox
                key={price.id}
                price={price}
                selected={selected.has(price.id)}
                onToggle={onToggle}
              />
            ))}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: spacing.md },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  categoryHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 17,
  },
});
