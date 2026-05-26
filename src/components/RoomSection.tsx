import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Room } from '../types';
import { CeilingInput } from './CeilingInput';
import { DimensionCard } from './DimensionCard';
import { WallObikolkaInput } from './WallObikolkaInput';
import { colors, radius, spacing } from '../theme';

type DimField = 'width' | 'height' | 'label';

interface Props {
  room: Room;
  defaultExpanded?: boolean;
  onUpdateWalls: (roomId: string, field: 'wallPerimeter' | 'wallHeight', value: string) => void;
  onUpdateCeiling: (roomId: string, field: 'width' | 'length', value: string) => void;
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
  onUpdateWalls,
  onUpdateCeiling,
  onUpdateDoor,
  onUpdateWindow,
  onAddWindow,
  onRemoveWindow,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setExpanded((e) => !e)}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.chevron}>{expanded ? '▼' : '▶'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.subTitle}>Стени</Text>
          <WallObikolkaInput
            room={room}
            onChangePerimeter={(v) => onUpdateWalls(room.id, 'wallPerimeter', v)}
            onChangeHeight={(v) => onUpdateWalls(room.id, 'wallHeight', v)}
          />

          <CeilingInput
            ceiling={room.ceiling}
            onChangeWidth={(v) => onUpdateCeiling(room.id, 'width', v)}
            onChangeLength={(v) => onUpdateCeiling(room.id, 'length', v)}
          />

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
