import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatArea, perimeterFromOpenings, sumAreas } from '../calculations';
import type { DimensionItem, OpeningsTreatment } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  openings: DimensionItem[];
  treatment: OpeningsTreatment;
  onTreatmentChange: (mode: OpeningsTreatment) => void;
  perimeterLm: string;
  onPerimeterLmChange: (value: string) => void;
}

const OPTIONS: {
  id: OpeningsTreatment;
  title: string;
  description: string;
}[] = [
  {
    id: 'include_in_wall_area',
    title: 'Остават в квадратурата на стените',
    description:
      'Отворите не се изваждат – влизат в м² за шпакловка, боя и др. (препоръчително по подразбиране).',
  },
  {
    id: 'subtract_and_linear',
    title: 'Изваждат се от м² + обръщане на л.м.',
    description:
      'Площта на прозорците/вратите се изважда от стените. За „Обръщане на врати и прозорци“ се ползват линейни метри.',
  },
];

export function OpeningsTreatmentSection({
  openings,
  treatment,
  onTreatmentChange,
  perimeterLm,
  onPerimeterLmChange,
}: Props) {
  const autoLm = perimeterFromOpenings(openings);
  const subtractMode = treatment === 'subtract_and_linear';

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Отвори – площ и линейни метри</Text>
      <Text style={styles.hint}>
        Изберете дали прозорците и вратите се изваждат от стените или остават в общата квадратура.
      </Text>

      {OPTIONS.map((opt) => {
        const selected = treatment === opt.id;
        return (
          <Pressable
            key={opt.id}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onTreatmentChange(opt.id)}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected && <View style={styles.radioDot} />}
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                {opt.title}
              </Text>
              <Text style={styles.optionDesc}>{opt.description}</Text>
            </View>
          </Pressable>
        );
      })}

      {subtractMode && (
        <View style={styles.lmCard}>
          <Text style={styles.lmTitle}>Линейни метри за обръщане</Text>
          {openings.length === 0 ? (
            <Text style={styles.lmEmpty}>
              Добавете прозорци/врати по-горе или въведете л.м. ръчно по-долу.
            </Text>
          ) : (
            <>
              {openings.map((o) => {
                const w = parseFloat(o.width.replace(',', '.')) || 0;
                const h = parseFloat(o.height.replace(',', '.')) || 0;
                const lm = w > 0 && h > 0 ? 2 * (w + h) : 0; // периметър на отвор
                return (
                  <View key={o.id} style={styles.lmRow}>
                    <Text style={styles.lmLabel}>{o.label || 'Отвор'}</Text>
                    <Text style={styles.lmValue}>
                      {lm > 0 ? `${formatArea(lm)} л.м.` : '—'}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.lmTotalRow}>
                <Text style={styles.lmTotalLabel}>Общо за обръщане</Text>
                <Text style={styles.lmTotalValue}>
                  {autoLm > 0 ? `${formatArea(autoLm)} л.м.` : '—'}
                </Text>
              </View>
            </>
          )}
          <Text style={styles.manualLabel}>Корекция ръчно (по избор)</Text>
          <TextInput
            style={styles.manualInput}
            value={perimeterLm}
            onChangeText={onPerimeterLmChange}
            keyboardType="decimal-pad"
            placeholder={
              autoLm > 0
                ? `Автоматично: ${formatArea(autoLm)} л.м.`
                : 'Линейни метри (л.м.)'
            }
            placeholderTextColor={colors.textMuted}
          />
          {perimeterLm.trim().length > 0 && autoLm > 0 && (
            <Text style={styles.manualNote}>
              При попълнено поле се ползва ръчната стойност вместо автоматичната.
            </Text>
          )}
        </View>
      )}

      {!subtractMode && openings.length > 0 && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Площ отвори: {formatArea(sumAreas(openings))} м² – включена в общата площ на
            стените.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  optionTitleSelected: { color: colors.primary },
  optionDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 17 },
  lmCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.xs,
  },
  lmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  lmEmpty: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },
  lmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lmLabel: { fontSize: 14, color: colors.text },
  lmValue: { fontSize: 14, fontWeight: '700', color: colors.primary },
  lmTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  lmTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  lmTotalValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  manualLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  manualNote: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  infoBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  infoText: { fontSize: 13, color: colors.text, lineHeight: 18 },
});
