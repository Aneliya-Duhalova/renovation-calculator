import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Room } from '../types';

type DimField = 'width' | 'height' | 'label';
import { DimensionCard } from './DimensionCard';
import { colors, radius, spacing } from '../theme';

interface Props {
  room: Room;
  defaultExpanded?: boolean;
  onUpdateWall: (
    roomId: string,
    wallId: string,
    field: 'width' | 'height' | 'label',
    value: string,
  ) => void;
  onUpdateDoor: (roomId: string, field: 'width' | 'height' | 'label', value: string) => void;
  onUpdateWindow: (
    roomId: string,
    windowId: string,
    field: 'width' | 'height' | 'label',
    value: string,
  ) => void;
  onAddWindow: (roomId: string) => void;
  onRemoveWindow: (roomId: string, windowId: string) => void;
}

export function RoomSection({
  room,
  defaultExpanded = false,
  onUpdateWall,
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
          <Text style={styles.subTitle}>4 стени</Text>
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
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  chevron: { fontSize: 14, color: colors.primary },
  body: { padding: spacing.md, paddingTop: 0 },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
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
