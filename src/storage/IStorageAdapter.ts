// T013: Storage types and IStorageAdapter interface

export interface SerializedComponent {
  id:   string;
  type: string;  // ComponentType value
  x:    number;
  y:    number;
  o:    number;  // Orientation value (0 | 90 | 180 | 270)
  t:    number;  // placedAt timestamp
}

export interface HouseDesign {
  id:          string;   // UUID v4; stable across saves
  name:        string;   // Player-provided; max 50 chars
  version:     number;   // Schema version — currently always 1
  createdAt:   number;   // Unix ms
  updatedAt:   number;   // Unix ms
  plotWidth:   number;
  plotHeight:  number;
  components:  SerializedComponent[];
  checksum:    string;   // Hex CRC32 of JSON.stringify(components)
}

export type StorageError =
  | 'NOT_FOUND'
  | 'CORRUPTED'
  | 'QUOTA_EXCEEDED'
  | 'INCOMPATIBLE_VERSION'
  | 'INVALID_NAME'
  | 'UNKNOWN';

export type SaveResult =
  | { success: true;  design: HouseDesign }
  | { success: false; error: StorageError };

export type LoadResult =
  | { success: true;  design: HouseDesign }
  | { success: false; error: StorageError };

export type DeleteResult =
  | { success: true }
  | { success: false; error: StorageError };

export interface IStorageAdapter {
  /**
   * Save a house design.
   * Evicts the oldest design if the per-origin limit (10) is exceeded.
   */
  save(design: Omit<HouseDesign, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'checksum'>): SaveResult;

  /**
   * Update an existing design (re-save with same id).
   */
  update(design: HouseDesign): SaveResult;

  /**
   * Load a single design by id.
   */
  load(id: string): LoadResult;

  /**
   * List all saved designs.
   */
  listAll(): HouseDesign[];

  /**
   * Delete a design by id.
   */
  delete(id: string): DeleteResult;

  /**
   * Remove all saved designs.
   */
  deleteAll(): void;
}
