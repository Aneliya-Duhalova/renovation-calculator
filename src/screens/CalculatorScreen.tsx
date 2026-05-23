import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityListByCategory } from '../components/ActivityListByCategory';
import { DimensionCard } from '../components/DimensionCard';
import { calculateCosts, formatArea, formatMoney } from '../calculations';
import { CURRENCY } from '../constants';
import { loadPrices } from '../storage';
import type { ActivityPrice, DimensionItem } from '../types';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Calculator'>;

function newItem(label: string): DimensionItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    width: '',
    height: '',
    label,
  };
}

export function CalculatorScreen({ navigation }: Props) {
  const [walls, setWalls] = useState<DimensionItem[]>([newItem('Стена 1')]);
  const [openings, setOpenings] = useState<DimensionItem[]>([]);
  const [perimeterLm, setPerimeterLm] = useState('');
  const [prices, setPrices] = useState<ActivityPrice[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const refreshPrices = useCallback(async () => {
    const loaded = await loadPrices();
    setPrices(loaded);
    setSelected(new Set(loaded.filter((p) => p.enabled).map((p) => p.id)));
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      refreshPrices();
    });
    refreshPrices();
    return unsub;
  }, [navigation, refreshPrices]);

  const result = useMemo(
    () => calculateCosts(walls, openings, perimeterLm, selected, prices),
    [walls, openings, perimeterLm, selected, prices],
  );

  const updateList = (
    setter: React.Dispatch<React.SetStateAction<DimensionItem[]>>,
    id: string,
    field: keyof DimensionItem,
    value: string,
  ) => {
    setter((list) =>
      list.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const toggleActivity = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Ремонт калкулатор</Text>
          <Text style={styles.heroSubtitle}>
            Въведете размери на стени и отвори. Приложението изважда прозорци и врати и
            изчислява квадратни метри и цена.
          </Text>
        </View>

        <Section title="Стени" hint="Ширина × височина за всяка стена">
          {walls.map((wall, index) => (
            <DimensionCard
              key={wall.id}
              item={wall}
              placeholderLabel={`Стена ${index + 1}`}
              onChange={(id, field, value) => updateList(setWalls, id, field, value)}
              onRemove={(id) => setWalls((list) => list.filter((w) => w.id !== id))}
              canRemove={walls.length > 1}
            />
          ))}
          <AddButton
            label="+ Добави стена"
            onPress={() => setWalls((list) => [...list, newItem(`Стена ${list.length + 1}`)])}
          />
        </Section>

        <Section
          title="Прозорци и врати"
          hint="От тяхната площ се изважда от общата площ на стените"
        >
          {openings.length === 0 ? (
            <Text style={styles.empty}>Няма добавени отвори</Text>
          ) : (
            openings.map((opening, index) => (
              <DimensionCard
                key={opening.id}
                item={opening}
                placeholderLabel={index % 2 === 0 ? 'Прозорец' : 'Врата'}
                onChange={(id, field, value) => updateList(setOpenings, id, field, value)}
                onRemove={(id) => setOpenings((list) => list.filter((o) => o.id !== id))}
                canRemove
              />
            ))
          )}
          <AddButton
            label="+ Добави прозорец / врата"
            onPress={() =>
              setOpenings((list) => [
                ...list,
                newItem(list.length % 2 === 0 ? 'Прозорец' : 'Врата'),
              ])
            }
          />
        </Section>

        <Section
          title="Линейни метри – ръчно (по избор)"
          hint="За обръщане на отвори: автоматично от прозорци/врати; ръчно само ако е нужно"
        >
          <TextInput
            style={styles.perimeterInput}
            value={perimeterLm}
            onChangeText={setPerimeterLm}
            keyboardType="decimal-pad"
            placeholder="Линейни метри (л.м.)"
            placeholderTextColor={colors.textMuted}
          />
        </Section>

        <View style={styles.summaryCard}>
          <SummaryRow label="Обща площ на стени" value={`${formatArea(result.grossArea)} м²`} />
          <SummaryRow
            label="Минус отвори"
            value={`− ${formatArea(result.openingsArea)} м²`}
            muted
          />
          <SummaryRow
            label="Нетна площ за работа"
            value={`${formatArea(result.netArea)} м²`}
            highlight
          />
          <SummaryRow
            label="Периметър на отвори"
            value={`${formatArea(result.openingsPerimeter)} л.м.`}
            muted
          />
        </View>

        <Section title="Изберете дейности" hint="Маркирайте какво ще се извършва">
          <ActivityListByCategory
            prices={prices}
            selected={selected}
            onToggle={toggleActivity}
          />
        </Section>

        {result.lines.length > 0 && (
          <View style={styles.costCard}>
            <Text style={styles.costTitle}>Разбивка на разходите</Text>
            {result.lines.map((line) => (
              <View key={line.id} style={styles.costRow}>
                <View style={styles.costLeft}>
                  <Text style={styles.costName}>{line.name}</Text>
                  <Text style={styles.costDetail}>
                    {line.priceOnRequest
                      ? 'По договаряне'
                      : `${formatArea(line.quantity)} ${line.unit === 'lm' ? 'л.м.' : 'м²'} × ${formatMoney(line.unitPrice)} ${CURRENCY}`}
                  </Text>
                </View>
                <Text style={styles.costValue}>
                  {line.priceOnRequest ? '—' : `${formatMoney(line.total)} ${CURRENCY}`}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Общо</Text>
              <Text style={styles.totalValue}>
                {formatMoney(result.grandTotal)} {CURRENCY}
              </Text>
            </View>

            <Pressable
              style={styles.pdfBtn}
              onPress={() =>
                navigation.navigate('Offer', {
                  walls,
                  openings,
                  perimeterLm,
                  result,
                })
              }
            >
              <Text style={styles.pdfBtnText}>Създай PDF оферта</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={styles.settingsLink}
          onPress={() => navigation.navigate('Prices')}
        >
          <Text style={styles.settingsLinkText}>⚙ Редактирай цени на дейностите</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
      {children}
    </View>
  );
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.addBtn} onPress={onPress}>
      <Text style={styles.addBtnText}>{label}</Text>
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, muted && styles.muted]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          highlight && styles.summaryHighlight,
          muted && styles.muted,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E8F5EF',
    lineHeight: 20,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  empty: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  perimeterInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 15, color: colors.text },
  summaryValue: { fontSize: 15, fontWeight: '600', color: colors.text },
  summaryHighlight: { fontSize: 17, color: colors.primary, fontWeight: '800' },
  muted: { color: colors.textMuted },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  costCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  costTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  costLeft: { flex: 1, paddingRight: spacing.sm },
  costName: { fontSize: 15, fontWeight: '600', color: colors.text },
  costDetail: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  costValue: { fontSize: 15, fontWeight: '700', color: colors.accent },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  totalLabel: { fontSize: 18, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  pdfBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  pdfBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  settingsLink: {
    alignItems: 'center',
    padding: spacing.md,
  },
  settingsLinkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
