import type { DimensionItem, Room } from './types';

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
    door: newDimensionItem(`${name} – врата`),
    windows: [newDimensionItem(`${name} – прозорец 1`)],
  };
}

export function createDefaultRooms(): Room[] {
  return DEFAULT_ROOM_NAMES.map((name) => createRoom(name));
}

export function flattenRooms(rooms: Room[]): {
  walls: DimensionItem[];
  openings: DimensionItem[];
} {
  const walls = rooms.flatMap((r) => r.walls);
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
    return {
      ...room,
      walls: room.walls.map((w) => (w.id === wallId ? { ...w, [field]: value } : w)),
    };
  });
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
