// T026: LocalStorageAdapter — concrete implementation using browser localStorage
import { v4 as uuidv4 } from 'uuid'
import type {
  HouseDesign,
  SerializedComponent,
  IStorageAdapter,
  SaveResult,
  LoadResult,
  DeleteResult,
} from './IStorageAdapter.ts'
import { hexCrc32 } from '@utils/json.ts'

const STORAGE_KEY    = 'vibe_house_game_saves';
const SCHEMA_VERSION = 1;
const MAX_DESIGNS    = 10;

export class LocalStorageAdapter implements IStorageAdapter {
  private readAll(): HouseDesign[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as HouseDesign[];
    } catch {
      console.warn('[LocalStorageAdapter] Failed to parse saved designs, resetting.');
      return [];
    }
  }

  private writeAll(designs: HouseDesign[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        return false;
      }
      return false;
    }
  }

  private computeChecksum(components: SerializedComponent[]): string {
    return hexCrc32(JSON.stringify(components));
  }

  save(design: Omit<HouseDesign, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'checksum'>): SaveResult {
    if (!design.name || design.name.trim().length === 0 || design.name.length > 50) {
      return { success: false, error: 'INVALID_NAME' };
    }

    const now = Date.now();
    const newDesign: HouseDesign = {
      id:         uuidv4(),
      version:    SCHEMA_VERSION,
      createdAt:  now,
      updatedAt:  now,
      checksum:   this.computeChecksum(design.components),
      name:       design.name.trim(),
      plotWidth:  design.plotWidth,
      plotHeight: design.plotHeight,
      components: design.components,
    };

    let designs = this.readAll();

    // Evict oldest if over limit
    if (designs.length >= MAX_DESIGNS) {
      designs.sort((a, b) => a.updatedAt - b.updatedAt);
      designs = designs.slice(designs.length - MAX_DESIGNS + 1);
    }

    designs.push(newDesign);
    const ok = this.writeAll(designs);
    if (!ok) return { success: false, error: 'QUOTA_EXCEEDED' };
    return { success: true, design: newDesign };
  }

  update(design: HouseDesign): SaveResult {
    const designs = this.readAll();
    const idx = designs.findIndex(d => d.id === design.id);
    if (idx === -1) return { success: false, error: 'NOT_FOUND' };

    const updated: HouseDesign = {
      ...design,
      updatedAt: Date.now(),
      checksum:  this.computeChecksum(design.components),
    };
    designs[idx] = updated;
    const ok = this.writeAll(designs);
    if (!ok) return { success: false, error: 'QUOTA_EXCEEDED' };
    return { success: true, design: updated };
  }

  load(id: string): LoadResult {
    const designs = this.readAll();
    const design = designs.find(d => d.id === id);
    if (!design) return { success: false, error: 'NOT_FOUND' };
    if (design.version !== SCHEMA_VERSION) return { success: false, error: 'INCOMPATIBLE_VERSION' };

    const expected = this.computeChecksum(design.components);
    if (design.checksum !== expected) return { success: false, error: 'CORRUPTED' };

    return { success: true, design };
  }

  listAll(): HouseDesign[] {
    return this.readAll().filter(d => {
      try {
        return d.version === SCHEMA_VERSION;
      } catch {
        return false;
      }
    });
  }

  delete(id: string): DeleteResult {
    const designs = this.readAll();
    const idx = designs.findIndex(d => d.id === id);
    if (idx === -1) return { success: false, error: 'NOT_FOUND' };
    designs.splice(idx, 1);
    this.writeAll(designs);
    return { success: true };
  }

  deleteAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
