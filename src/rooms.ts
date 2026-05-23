import { areaFromItem } from './calculations';
import type { DimensionItem, Room, WallsInputMode } from './types';

export const DEFAULT_ROOM_NAMES = [
  'Кухня',
  'Коридор',
  'Спалня 1',
  'Спалня 2',
  'Спалня 3',
] as const;

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function newDimensionItem(label: string): DimensionItem {
  return { id: newId(), width: '', height: '', label };
}

export function createRoom(name: string): Room {
  return {
    id: newId(),
    name,
    walls: [1, 2, 3, 4].map((n) => newDimensionItem(`${name} – стена ${n}`)),
    wallsMode: 'detailed',
    wallsSummaryWidth: '',
    wallsSummaryHeight: '',
    syncWallHeights: true,
    ceiling: newDimensionItem(`${name} – таван`),
    door: newDimensionItem(`${name} – врата`),
    windows: [newDimensionItem(`${name} – прозорец 1`)],
  };
}

export function createDefaultRooms(): Room[] {
  return DEFAULT_ROOM_NAMES.map((name) => createRoom(name));
}

/** Повърхности за площ: стени + таван */
export function roomWallAndCeilingSurfaces(room: Room): DimensionItem[] {
  const surfaces: DimensionItem[] = [];

  if (room.wallsMode === 'summary') {
    const w = room.wallsSummaryWidth.trim();
    const h = room.wallsSummaryHeight.trim();
    if (w && h) {
      surfaces.push({
        id: `${room.id}-walls-summary`,
        width: w,
        height: h,
        label: `${room.name} – стени (общо)`,
      });
    }
  } else {
    surfaces.push(...room.walls);
  }

  surfaces.push(room.ceiling);
  return surfaces;
}

export function flattenRooms(rooms: Room[]): {
  walls: DimensionItem[];
  openings: DimensionItem[];
} {
  const walls = rooms.flatMap((r) => roomWallAndCeilingSurfaces(r));
  const openings = rooms.flatMap((r) => [r.door, ...r.windows]);
  return { walls, openings };
}

export function updateRoomWall(
  rooms: Room[],
  roomId: string,
  wallId: string,
  field: keyof DimensionItem,
  value: string,
): Room[] {
  return rooms.map((room) => {
    if (room.id !== roomId) return room;

    let walls = room.walls.map((w) => (w.id === wallId ? { ...w, [field]: value } : w));

    if (field === 'height' && room.syncWallHeights && value.trim()) {
      walls = walls.map((w) => ({ ...w, height: value }));
    }

    return { ...room, walls };
  });
}

export function updateRoomSummary(
  rooms: Room[],
  roomId: string,
  field: 'wallsSummaryWidth' | 'wallsSummaryHeight',
  value: string,
): Room[] {
  return rooms.map((room) => (room.id === roomId ? { ...room, [field]: value } : room));
}

export function setRoomWallsMode(
  rooms: Room[],
  roomId: string,
  mode: WallsInputMode,
): Room[] {
  return rooms.map((room) => (room.id === roomId ? { ...room, wallsMode: mode } : room));
}

export function setRoomSyncWallHeights(
  rooms: Room[],
  roomId: string,
  sync: boolean,
): Room[] {
  return rooms.map((room) => {
    if (room.id !== roomId) return room;
    if (!sync) return { ...room, syncWallHeights: false };

    const firstHeight = room.walls.find((w) => w.height.trim())?.height ?? '';
    const walls = firstHeight
      ? room.walls.map((w) => ({ ...w, height: firstHeight }))
      : room.walls;
    return { ...room, syncWallHeights: true, walls };
  });
}

export function updateRoomCeiling(
  rooms: Room[],
  roomId: string,
  field: keyof DimensionItem,
  value: string,
): Room[] {
  return rooms.map((room) =>
    room.id === roomId ? { ...room, ceiling: { ...room.ceiling, [field]: value } } : room,
  );
}

export function updateRoomDoor(
  rooms: Room[],
  roomId: string,
  field: keyof DimensionItem,
  value: string,
): Room[] {
  return rooms.map((room) =>
    room.id === roomId ? { ...room, door: { ...room.door, [field]: value } } : room,
  );
}

export function updateRoomWindow(
  rooms: Room[],
  roomId: string,
  windowId: string,
  field: keyof DimensionItem,
  value: string,
): Room[] {
  return rooms.map((room) => {
    if (room.id !== roomId) return room;
    return {
      ...room,
      windows: room.windows.map((w) =>
        w.id === windowId ? { ...w, [field]: value } : w,
      ),
    };
  });
}

export function addRoomWindow(rooms: Room[], roomId: string): Room[] {
  return rooms.map((room) => {
    if (room.id !== roomId) return room;
    const n = room.windows.length + 1;
    return {
      ...room,
      windows: [...room.windows, newDimensionItem(`${room.name} – прозорец ${n}`)],
    };
  });
}

export function removeRoomWindow(rooms: Room[], roomId: string, windowId: string): Room[] {
  return rooms.map((room) => {
    if (room.id !== roomId || room.windows.length <= 1) return room;
    return { ...room, windows: room.windows.filter((w) => w.id !== windowId) };
  });
}
