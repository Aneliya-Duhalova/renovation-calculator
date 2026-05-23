import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { formatArea, formatMoney } from '../calculations';
import { CURRENCY } from '../constants';
import {
  createOfferNumber,
  exportOfferPdf,
  formatOfferDate,
} from '../offerPdf';
import { loadOfferProfile, saveOfferProfile } from '../offerStorage';
import type { OfferProfile } from '../types';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Offer'>;

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

export function OfferScreen({ route }: Props) {
  const { walls, openings, perimeterLm, result } = route.params;
  const [profile, setProfile] = useState<OfferProfile | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadOfferProfile().then(setProfile);
  }, []);

  const update = (key: keyof OfferProfile, value: string) => {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  };

  const handleSaveProfile = useCallback(async () => {
    if (!profile) return;
    try {
      await saveOfferProfile(profile);
      Alert.alert('Запазено', 'Данните за офертата са запазени.');
    } catch {
      Alert.alert('Грешка', 'Неуспешно запазване.');
    }
  }, [profile]);

  const handleGeneratePdf = useCallback(async () => {
    if (!profile) return;
    if (result.lines.length === 0) {
      Alert.alert('Няма дейности', 'Изберете поне една дейност с цена преди PDF оферта.');
      return;
    }
    if (result.netArea <= 0 && result.lines.every((l) => l.unit !== 'lm')) {
      Alert.alert(
        'Липсват размери',
        'Въведете размери на стени, за да се изчисли площта.',
      );
      return;
    }

    setGenerating(true);
    try {
      await saveOfferProfile(profile);
      await exportOfferPdf({
        profile,
        offerNumber: createOfferNumber(),
        offerDate: formatOfferDate(),
        walls,
        openings,
        perimeterLm,
        result,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Неуспешно създаване на PDF.';
      Alert.alert('Грешка', message);
    } finally {
      setGenerating(false);
    }
  }, [profile, result, walls, openings, perimeterLm]);

  if (!profile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Обобщение за офертата</Text>
          <Text style={styles.previewLine}>
            Нетна площ: <Text style={styles.previewBold}>{formatArea(result.netArea)} м²</Text>
          </Text>
          <Text style={styles.previewLine}>
            Дейности: <Text style={styles.previewBold}>{result.lines.length}</Text>
          </Text>
          <Text style={styles.previewTotal}>
            Общо: {formatMoney(result.grandTotal)} {CURRENCY}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Вашата фирма / изпълнител</Text>
        <Field
          label="Име / фирма"
          value={profile.companyName}
          onChangeText={(v) => update('companyName', v)}
          placeholder="Пример: Ремонти Иванов ЕООД"
        />
        <Field
          label="Телефон"
          value={profile.companyPhone}
          onChangeText={(v) => update('companyPhone', v)}
          placeholder="+359 ..."
        />
        <Field
          label="Имейл"
          value={profile.companyEmail}
          onChangeText={(v) => update('companyEmail', v)}
          placeholder="email@example.com"
        />
        <Field
          label="Адрес"
          value={profile.companyAddress}
          onChangeText={(v) => update('companyAddress', v)}
          placeholder="Град, адрес"
        />

        <Text style={styles.sectionTitle}>Клиент и обект</Text>
        <Field
          label="Име на клиент"
          value={profile.clientName}
          onChangeText={(v) => update('clientName', v)}
          placeholder="Име на клиента"
        />
        <Field
          label="Телефон на клиент"
          value={profile.clientPhone}
          onChangeText={(v) => update('clientPhone', v)}
          placeholder="+359 ..."
        />
        <Field
          label="Адрес на обекта"
          value={profile.projectAddress}
          onChangeText={(v) => update('projectAddress', v)}
          placeholder="Къде ще се извършва ремонтът"
        />

        <Text style={styles.sectionTitle}>Условия на офертата</Text>
        <Field
          label="Валидност (дни)"
          value={profile.validityDays}
          onChangeText={(v) => update('validityDays', v)}
          placeholder="14"
        />
        <Field
          label="Бележки (показват се в PDF)"
          value={profile.offerNotes}
          onChangeText={(v) => update('offerNotes', v)}
          multiline
        />

        <Pressable style={styles.secondaryBtn} onPress={handleSaveProfile}>
          <Text style={styles.secondaryBtnText}>Запази данните за следващи оферти</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, generating && styles.primaryBtnDisabled]}
          onPress={handleGeneratePdf}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Генерирай PDF оферта</Text>
          )}
        </Pressable>

        <Text style={styles.hint}>
          На телефон: споделяне през приложения. В браузър: отвори се прозорец – изберете
          „Запази като PDF“ при печат.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  preview: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  previewLine: { fontSize: 14, color: colors.text, marginBottom: 4 },
  previewBold: { fontWeight: '700' },
  previewTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputMultiline: { minHeight: 100, paddingTop: 12 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryBtnText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
