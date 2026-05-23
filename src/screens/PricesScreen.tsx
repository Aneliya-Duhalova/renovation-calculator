import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  activitiesByCategory,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CURRENCY,
  DEFAULT_PRICES,
} from '../constants';
import { loadPrices, savePrices } from '../storage';
import type { ActivityPrice, PriceUnit } from '../types';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Prices'>;

function unitLabel(unit: PriceUnit): string {
  return unit === 'lm' ? 'л.м.' : 'м²';
}

export function PricesScreen({ navigation }: Props) {
  const [prices, setPrices] = useState<ActivityPrice[]>([]);
  const [saving, setSaving] = useState(false);
  const grouped = activitiesByCategory();

  useEffect(() => {
    loadPrices().then(setPrices);
  }, []);

  const updatePrice = (id: string, value: string) => {
    const num = parseFloat(value.replace(',', '.'));
    setPrices((list) =>
      list.map((p) =>
        p.id === id ? { ...p, price: Number.isFinite(num) ? num : 0 } : p,
      ),
    );
  };

  const toggleEnabled = (id: string) => {
    setPrices((list) =>
      list.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
    );
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await savePrices(prices);
      Alert.alert('Запазено', 'Цените са обновени успешно.');
      navigation.goBack();
    } catch {
      Alert.alert('Грешка', 'Неуспешно запазване. Опитайте отново.');
    } finally {
      setSaving(false);
    }
  }, [navigation, prices]);

  const handleReset = () => {
    Alert.alert(
      'Нулиране на цени',
      'Да се върнат ли цените по подразбиране?',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Да',
          style: 'destructive',
          onPress: () => setPrices([...DEFAULT_PRICES]),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.intro}>
        Цените са в евро (€) за м² или л.м. ВиК и Електро – без цени по подразбиране;
        можете да ги включите в офертата и да зададете цена по-късно.
      </Text>

      {CATEGORY_ORDER.map((category) => {
        const defs = grouped.get(category) ?? [];

        return (
          <View key={category}>
            <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
            {defs.map((def) => {
              const row = prices.find((p) => p.id === def.id);
              if (!row) return null;

              const onRequest = Boolean(def.priceOnRequest);

              return (
                <View
                  key={row.id}
                  style={[styles.card, !row.enabled && styles.cardDisabled]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitles}>
                      <Text style={styles.name}>{def.name}</Text>
                      <Text style={styles.desc}>{def.description}</Text>
                    </View>
                    <Switch
                      value={row.enabled}
                      onValueChange={() => toggleEnabled(row.id)}
                      trackColor={{ false: colors.border, true: colors.primaryLight }}
                      thumbColor={row.enabled ? colors.primary : '#f4f4f4'}
                    />
                  </View>

                  {onRequest ? (
                    <Text style={styles.onRequest}>Без цена – по договаряне</Text>
                  ) : (
                    <View style={styles.priceRow}>
                      <TextInput
                        style={styles.priceInput}
                        value={row.price > 0 ? String(row.price) : ''}
                        onChangeText={(v) => updatePrice(row.id, v)}
                        keyboardType="decimal-pad"
                        editable={row.enabled}
                      />
                      <Text style={styles.unit}>
                        {CURRENCY} / {unitLabel(row.unit)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      <Pressable
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Запазване...' : 'Запази цените'}</Text>
      </Pressable>

      <Pressable style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetBtnText}>Възстанови цени по подразбиране</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  intro: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDisabled: { opacity: 0.55 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitles: { flex: 1, paddingRight: spacing.sm },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  desc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  onRequest: {
    fontSize: 14,
    color: colors.accent,
    fontStyle: 'italic',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.background,
  },
  unit: { fontSize: 14, color: colors.textMuted, minWidth: 72 },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resetBtn: {
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  resetBtnText: { color: colors.danger, fontSize: 15 },
});
