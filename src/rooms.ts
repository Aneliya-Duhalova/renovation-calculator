import { areaFromItem } from './calculations';
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
    wallPerimeter: '',
    wallHeight: '',
    ceiling: newDimensionItem(`${name} – таван`),
    door: newDimensionItem(`${name} – врата`),
    windows: [newDimensionItem(`${name} – прозорец 1`)],
  };
}

export function createDefaultRooms(): Room[] {
  return DEFAULT_ROOM_NAMES.map((name) => createRoom(name));
}

export function roomWallsDimension(room: Room): DimensionItem | null {
  const p = room.wallPerimeter.trim();
  const h = room.wallHeight.trim();
  if (!p || !h) return null;
  return {
    id: `${room.id}-walls`,
    width: p,
    height: h,
    label: `${room.name} – стени`,
  };
}

/** Повърхности за площ: стени (обиколка × височина) + таван */
export function roomWallAndCeilingSurfaces(room: Room): DimensionItem[] {
  const surfaces: DimensionItem[] = [];
  const walls = roomWallsDimension(room);
  if (walls) surfaces.push(walls);
  surfaces.push(room.ceiling);
  return surfaces;
}

export function roomWallsArea(room: Room): number {
  const walls = roomWallsDimension(room);
  return walls ? areaFromItem(walls) : 0;
}

export function flattenRooms(rooms: Room[]): {
  walls: DimensionItem[];
  openings: DimensionItem[];
} {
  const walls = rooms.flatMap((r) => roomWallAndCeilingSurfaces(r));
  const openings = rooms.flatMap((r) => [r.door, ...r.windows]);
  return { walls, openings };
}

export function updateRoomWalls(
  rooms: Room[],
  roomId: string,
  field: 'wallPerimeter' | 'wallHeight',
  value: string,
): Room[] {
  return rooms.map((room) => (room.id === roomId ? { ...room, [field]: value } : room));
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
