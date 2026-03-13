// T012: JSON serialisation helpers and CRC32 checksum utility
import type { BuildingComponent, ComponentType, Orientation } from '@game/types.ts'
import type { SerializedComponent } from '@storage/IStorageAdapter.ts'

// --- CRC32 ---

const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table.push(c);
  }
  return table;
})();

export function crc32(str: string): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    crc = CRC_TABLE[(crc ^ str.charCodeAt(i)) & 0xFF]! ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function hexCrc32(str: string): string {
  return crc32(str).toString(16).padStart(8, '0');
}

// --- Serialisation ---

export function serializeComponents(components: BuildingComponent[]): SerializedComponent[] {
  return components.map(c => ({
    id:   c.id,
    type: c.type,
    x:    c.position.x,
    y:    c.position.y,
    o:    c.orientation,
    t:    c.placedAt,
  }));
}

export function deserializeComponents(serialized: SerializedComponent[]): BuildingComponent[] {
  return serialized.map(s => ({
    id:          s.id,
    type:        s.type as ComponentType,
    position:    { x: s.x, y: s.y },
    orientation: s.o as Orientation,
    placedAt:    s.t,
  }));
}

