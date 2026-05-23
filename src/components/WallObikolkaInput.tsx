import { StyleSheet, Text, TextInput, View } from 'react-native';
import { formatArea } from '../calculations';
import { roomWallsArea } from '../rooms';
import type { Room } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  room: Room;
  onChangePerimeter: (value: string) => void;
  onChangeHeight: (value: string) => void;
}

export function WallObikolkaInput({ room, onChangePerimeter, onChangeHeight }: Props) {
  const area = roomWallsArea(room);

  return (
    <View style={styles.card}>
      <Text style={styles.hint}>Общо за стените: площ = обиколка × височина</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Обиколка (м)</Text>
          <TextInput
            style={styles.input}
            value={room.wallPerimeter}
            onChangeText={onChangePerimeter}
            keyboardType="decimal-pad"
            placeholder="напр. 12"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <Text style={styles.times}>×</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Височина (м)</Text>
          <TextInput
            style={styles.input}
            value={room.wallHeight}
            onChangeText={onChangeHeight}
            keyboardType="decimal-pad"
            placeholder="напр. 2.7"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
      <Text style={styles.area}>
        Площ стени: <Text style={styles.areaVal}>{formatArea(area)} м²</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: { fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  field: { flex: 1 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  times: { fontSize: 20, color: colors.textMuted, paddingBottom: 12 },
  area: { marginTop: spacing.sm, fontSize: 14, color: colors.textMuted },
  areaVal: { fontWeight: '700', color: colors.primary },
});
