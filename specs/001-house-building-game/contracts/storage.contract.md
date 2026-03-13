# Contract: Storage Interface

**Feature**: `001-house-building-game`  
**Contract Type**: Internal TypeScript Interface (Storage Layer ↔ Game Logic)  
**Date**: 2026-03-13

---

## Purpose

This contract defines the public interface of the storage layer (`src/storage/`). It abstracts `localStorage` behind a typed interface so that game logic and UI code are decoupled from the browser storage API, enabling easy unit testing (mock adapter) and future backend migration.

---

## Types

```typescript
// src/storage/types.ts

export interface SerializedComponent {
  id:   string;
  type: string;       // ComponentType value
  x:    number;
  y:    number;
  o:    number;       // Orientation value (0 | 90 | 180 | 270)
  t:    number;       // placedAt timestamp
}

export interface HouseDesign {
  id:          string;   // UUID v4
  name:        string;   // Player-provided; max 50 chars
  version:     number;   // Schema version — currently always 1
  createdAt:   number;   // Unix ms
  updatedAt:   number;   // Unix ms
  plotWidth:   number;
  plotHeight:  number;
  components:  SerializedComponent[];
  checksum:    string;   // Hex CRC32 of JSON.stringify(components)
}

export type SaveResult =
  | { success: true;  design: HouseDesign }
  | { success: false; error: StorageError };

export type LoadResult =
  | { success: true;  design: HouseDesign }
  | { success: false; error: StorageError };

export type DeleteResult =
  | { success: true }
  | { success: false; error: StorageError };

export type StorageError =
  | 'NOT_FOUND'
  | 'CORRUPTED'
  | 'QUOTA_EXCEEDED'
  | 'INCOMPATIBLE_VERSION'
  | 'INVALID_NAME'
  | 'UNKNOWN';
```

---

## `IStorageAdapter` Interface

```typescript
// src/storage/IStorageAdapter.ts

export interface IStorageAdapter {
  /**
   * Save a house design.
   * - Generates a new UUID if design.id is not set.
   * - Updates `updatedAt` and recalculates `checksum`.
   * - Evicts the oldest design if the per-origin limit (10) is exceeded.
   * - Returns QUOTA_EXCEEDED if localStorage is full.
   * - Returns INVALID_NAME if name is empty or > 50 chars.
   */
  save(design: Omit<HouseDesign, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'checksum'>): SaveResult;

  /**
   * Update an existing design (re-save with same id).
   * Returns NOT_FOUND if the design id does not exist.
   */
  update(design: HouseDesign): SaveResult;

  /**
   * Load a single design by id.
   * Returns CORRUPTED if the checksum does not match.
   * Returns INCOMPATIBLE_VERSION if schema migration is not possible.
   */
  load(id: string): LoadResult;

  /**
   * List all saved designs (metadata only — components array included).
   * Silently ignores individual corrupted entries (does not throw).
   */
  listAll(): HouseDesign[];

  /**
   * Delete a design by id.
   * Returns NOT_FOUND if the id does not exist.
   */
  delete(id: string): DeleteResult;

  /**
   * Remove all saved designs. Used for "clear all" functionality.
   */
  deleteAll(): void;
}
```

---

## `LocalStorageAdapter` Implementation Contract

```typescript
// src/storage/LocalStorageAdapter.ts

/**
 * Concrete implementation of IStorageAdapter using browser localStorage.
 *
 * localStorage key: "vibe_house_game_saves"
 * Value: JSON.stringify(HouseDesign[])
 *
 * Error handling:
 * - QuotaExceededError → returns { success: false, error: 'QUOTA_EXCEEDED' }
 * - JSON.parse failure → logs warning, returns empty list (does not throw)
 * - Checksum mismatch → returns { success: false, error: 'CORRUPTED' }
 * - Version mismatch → attempts migration; if impossible, returns { success: false, error: 'INCOMPATIBLE_VERSION' }
 */
export class LocalStorageAdapter implements IStorageAdapter { /* ... */ }
```

---

## `useSave` Hook Contract

```typescript
// src/hooks/useSave.ts

export interface SaveLoadState {
  designs:     HouseDesign[];       // All designs, sorted by updatedAt DESC
  isSaving:    boolean;
  isLoading:   boolean;
  lastError:   StorageError | null;
}

export interface SaveLoadActions {
  /**
   * Save the current plot under the given name.
   * Merges with an existing design of the same name if one exists.
   */
  saveDesign(name: string, plot: Plot): Promise<SaveResult>;

  /**
   * Load a design by id, updating the active plot in GameStateContext.
   */
  loadDesign(id: string): Promise<LoadResult>;

  /**
   * Delete a design by id.
   */
  deleteDesign(id: string): Promise<DeleteResult>;

  /**
   * Refresh the list of saved designs from storage.
   */
  refreshDesigns(): void;
}

/**
 * Hook that wires the StorageAdapter to the React component tree.
 * Must be used inside <GameStateProvider>.
 */
export function useSave(): SaveLoadState & SaveLoadActions;
```

---

## localStorage Schema (v1)

```
Storage key:  "vibe_house_game_saves"
Storage value: JSON array — HouseDesign[]
Max entries:  10 (oldest evicted on overflow)
Max per-entry size: ~100 KB (enforced before write)
```

### Checksum Algorithm

```
checksum = hexString(CRC32(JSON.stringify(design.components)))
```

Verified on every `load()` call. A mismatch sets `error: 'CORRUPTED'` and the design is not returned.

### Schema Version History

| Version | Changes | Migration Path |
|---------|---------|----------------|
| 1       | Initial schema | N/A (baseline) |
