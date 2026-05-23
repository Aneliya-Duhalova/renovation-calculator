import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityListByCategory } from '../components/ActivityListByCategory';
import { MrRuHeader } from '../components/MrRuHeader';
import { OpeningsTreatmentSection } from '../components/OpeningsTreatmentSection';
import { RoomSection } from '../components/RoomSection';
import { calculateCosts, formatArea, formatMoney } from '../calculations';
import { CURRENCY } from '../constants';
import {
  addRoomWindow,
  createDefaultRooms,
  flattenRooms,
  removeRoomWindow,
  setRoomSyncWallHeights,
  setRoomWallsMode,
  updateRoomCeiling,
  updateRoomDoor,
  updateRoomSummary,
  updateRoomWall,
  updateRoomWindow,
} from '../rooms';
import { loadPrices } from '../storage';
import type { ActivityPrice, OpeningsTreatment, Room } from '../types';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Calculator'>;

export function CalculatorScreen({ navigation }: Props) {
  const [rooms, setRooms] = useState<Room[]>(() => createDefaultRooms());
  const [perimeterLm, setPerimeterLm] = useState('');
  const [openingsTreatment, setOpeningsTreatment] =
    useState<OpeningsTreatment>('subtract_and_linear');
  const [prices, setPrices] = useState<ActivityPrice[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const loadPriceList = useCallback(async () => {
    const loaded = await loadPrices();
    setPrices(loaded);
  }, []);

  useEffect(() => {
    loadPriceList();
    const unsub = navigation.addListener('focus', loadPriceList);
    return unsub;
  }, [navigation, loadPriceList]);

  const { walls, openings } = useMemo(() => flattenRooms(rooms), [rooms]);

  const result = useMemo(
    () =>
      calculateCosts(walls, openings, perimeterLm, openingsTreatment, selected, prices),
    [walls, openings, perimeterLm, openingsTreatment, selected, prices],
  );

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
        <MrRuHeader />

        <Section
          title="Помещения"
          hint="Стени, таван, врата и прозорци. Може поотделно, общо (сума ширини × височина) или една височина за всички стени."
        >
          {rooms.map((room, index) => (
            <RoomSection
              key={room.id}
              room={room}
              defaultExpanded={index === 0}
              onUpdateWall={(roomId, wallId, field, value) =>
                setRooms((list) => updateRoomWall(list, roomId, wallId, field, value))
              }
              onUpdateSummary={(roomId, field, value) =>
                setRooms((list) => updateRoomSummary(list, roomId, field, value))
              }
              onSetWallsMode={(roomId, mode) =>
                setRooms((list) => setRoomWallsMode(list, roomId, mode))
              }
              onSetSyncHeights={(roomId, sync) =>
                setRooms((list) => setRoomSyncWallHeights(list, roomId, sync))
              }
              onUpdateCeiling={(roomId, field, value) =>
                setRooms((list) => updateRoomCeiling(list, roomId, field, value))
              }
              onUpdateDoor={(roomId, field, value) =>
                setRooms((list) => updateRoomDoor(list, roomId, field, value))
              }
              onUpdateWindow={(roomId, windowId, field, value) =>
                setRooms((list) => updateRoomWindow(list, roomId, windowId, field, value))
              }
              onAddWindow={(roomId) => setRooms((list) => addRoomWindow(list, roomId))}
              onRemoveWindow={(roomId, windowId) =>
                setRooms((list) => removeRoomWindow(list, roomId, windowId))
              }
            />
          ))}
        </Section>

        <OpeningsTreatmentSection
          openings={openings}
          treatment={openingsTreatment}
          onTreatmentChange={setOpeningsTreatment}
          perimeterLm={perimeterLm}
          onPerimeterLmChange={setPerimeterLm}
        />

        <View style={styles.summaryCard}>
          <SummaryRow
            label="Обща площ (стени + тавани)"
            value={`${formatArea(result.grossArea)} м²`}
          />
          {result.subtractOpeningsFromArea && result.openingsArea > 0 && (
            <SummaryRow
              label="Минус отвори (м²)"
              value={`− ${formatArea(result.openingsArea)} м²`}
              muted
            />
          )}
          <SummaryRow
            label="Площ за работа (м²)"
            value={`${formatArea(result.netArea)} м²`}
            highlight
          />
          {result.subtractOpeningsFromArea ? (
            <SummaryRow
              label="Обръщане – линейни метри"
              value={`${formatArea(result.wrapLinearMeters)} л.м.`}
              muted
            />
          ) : (
            result.openingsArea > 0 && (
              <SummaryRow label="Отвори" value="включени в м² на стените" muted />
            )
          )}
        </View>

        <Section
          title="Изберете дейности"
          hint="Първоначално нищо не е избрано – маркирайте нужните услуги"
        >
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
                  rooms,
                  walls,
                  openings,
                  perimeterLm,
                  openingsTreatment,
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
  settingsLink: { alignItems: 'center', padding: spacing.md },
  settingsLinkText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});
