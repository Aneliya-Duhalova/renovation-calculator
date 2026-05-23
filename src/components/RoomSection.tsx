import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { Room, WallsInputMode } from '../types';
import { DimensionCard } from './DimensionCard';
import { WallsSummaryInput } from './WallsSummaryInput';
import { areaFromItem, formatArea } from '../calculations';
import { colors, radius, spacing } from '../theme';

type DimField = 'width' | 'height' | 'label';

interface Props {
  room: Room;
  defaultExpanded?: boolean;
  onUpdateWall: (
    roomId: string,
    wallId: string,
    field: DimField,
    value: string,
  ) => void;
  onUpdateSummary: (
    roomId: string,
    field: 'wallsSummaryWidth' | 'wallsSummaryHeight',
    value: string,
  ) => void;
  onSetWallsMode: (roomId: string, mode: WallsInputMode) => void;
  onSetSyncHeights: (roomId: string, sync: boolean) => void;
  onUpdateCeiling: (roomId: string, field: DimField, value: string) => void;
  onUpdateDoor: (roomId: string, field: DimField, value: string) => void;
  onUpdateWindow: (
    roomId: string,
    windowId: string,
    field: DimField,
    value: string,
  ) => void;
  onAddWindow: (roomId: string) => void;
  onRemoveWindow: (roomId: string, windowId: string) => void;
}

export function RoomSection({
  room,
  defaultExpanded = false,
  onUpdateWall,
  onUpdateSummary,
  onSetWallsMode,
  onSetSyncHeights,
  onUpdateCeiling,
  onUpdateDoor,
  onUpdateWindow,
  onAddWindow,
  onRemoveWindow,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const ceilingArea = areaFromItem(room.ceiling);

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setExpanded((e) => !e)}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.chevron}>{expanded ? '▼' : '▶'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.subTitle}>Стени</Text>
          <View style={styles.modeRow}>
            <ModeChip
              label="Поотделно (4 стени)"
              active={room.wallsMode === 'detailed'}
              onPress={() => onSetWallsMode(room.id, 'detailed')}
            />
            <ModeChip
              label="Общо (сума + височина)"
              active={room.wallsMode === 'summary'}
              onPress={() => onSetWallsMode(room.id, 'summary')}
            />
          </View>

          {room.wallsMode === 'summary' ? (
            <WallsSummaryInput
              summaryWidth={room.wallsSummaryWidth}
              summaryHeight={room.wallsSummaryHeight}
              onChangeWidth={(v) => onUpdateSummary(room.id, 'wallsSummaryWidth', v)}
              onChangeHeight={(v) => onUpdateSummary(room.id, 'wallsSummaryHeight', v)}
            />
          ) : (
            <>
              <View style={styles.syncRow}>
                <Text style={styles.syncLabel}>Една височина за всички стени</Text>
                <Switch
                  value={room.syncWallHeights}
                  onValueChange={(v) => onSetSyncHeights(room.id, v)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={room.syncWallHeights ? colors.primary : '#f4f4f4'}
                />
              </View>
              {room.syncWallHeights && (
                <Text style={styles.syncHint}>
                  Първата въведена височина се копира автоматично на всички стени.
                </Text>
              )}
              {room.walls.map((wall, index) => (
                <DimensionCard
                  key={wall.id}
                  item={wall}
                  placeholderLabel={`Стена ${index + 1}`}
                  onChange={(id, field, value) =>
                    onUpdateWall(room.id, id, field as DimField, value)
                  }
                  onRemove={() => {}}
                  canRemove={false}
                />
              ))}
            </>
          )}

          <Text style={styles.subTitle}>Таван</Text>
          <DimensionCard
            item={room.ceiling}
            placeholderLabel="Таван"
            onChange={(_, field, value) => onUpdateCeiling(room.id, field as DimField, value)}
            onRemove={() => {}}
            canRemove={false}
          />
          {ceilingArea > 0 && (
            <Text style={styles.miniArea}>Площ таван: {formatArea(ceilingArea)} м²</Text>
          )}

          <Text style={styles.subTitle}>Врата (1)</Text>
          <DimensionCard
            item={room.door}
            placeholderLabel="Врата"
            onChange={(_, field, value) => onUpdateDoor(room.id, field as DimField, value)}
            onRemove={() => {}}
            canRemove={false}
          />

          <Text style={styles.subTitle}>Прозорци</Text>
          {room.windows.map((win, index) => (
            <DimensionCard
              key={win.id}
              item={win}
              placeholderLabel={`Прозорец ${index + 1}`}
              onChange={(id, field, value) =>
                onUpdateWindow(room.id, id, field as DimField, value)
              }
              onRemove={(id) => onRemoveWindow(room.id, id)}
              canRemove={room.windows.length > 1}
            />
          ))}
          <Pressable style={styles.addBtn} onPress={() => onAddWindow(room.id)}>
            <Text style={styles.addBtnText}>+ Добави прозорец</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function ModeChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
  },
  roomName: { fontSize: 17, fontWeight: '700', color: colors.primary },
  chevron: { fontSize: 14, color: colors.primary },
  body: { padding: spacing.md, paddingTop: 0 },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingVertical: 4,
  },
  syncLabel: { fontSize: 14, color: colors.text, flex: 1, paddingRight: spacing.sm },
  syncHint: {
    fontSize: 12,
    color: colors.accent,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  miniArea: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addBtnText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
