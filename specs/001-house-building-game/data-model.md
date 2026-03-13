# Data Model: House-Building Game

**Feature**: `001-house-building-game`  
**Phase**: Phase 1 — Design & Contracts  
**Date**: 2026-03-13

---

## Entities

### 1. `ComponentType` (Enum)

The fixed set of building component types available in the game (FR-002).

```typescript
enum ComponentType {
  WALL    = 'wall',
  FLOOR   = 'floor',
  ROOF    = 'roof',
  DOOR    = 'door',
  WINDOW  = 'window',
}
```

**Validation rules**: Only values from this enum are valid. The set is fixed and not player-expandable in this version.

---

### 2. `Orientation` (Enum)

Rotation of a placed component, expressed in degrees clockwise from north.

```typescript
enum Orientation {
  NORTH =   0,
  EAST  =  90,
  SOUTH = 180,
  WEST  = 270,
}
```

---

### 3. `GridPosition`

The grid coordinates of a cell on the plot. Origin `(0, 0)` is top-left.

```typescript
interface GridPosition {
  x: number;   // 0 … plot.width - 1
  y: number;   // 0 … plot.height - 1
}
```

**Validation rules**:
- `x` and `y` must be non-negative integers.
- `x < plot.width`, `y < plot.height`.

---

### 4. `BuildingComponent`

A single discrete piece placed on the plot (FR-002, FR-003).

```typescript
interface BuildingComponent {
  id:          string;          // UUID v4; unique within a plot
  type:        ComponentType;
  position:    GridPosition;
  orientation: Orientation;     // defaults to NORTH
  placedAt:    number;          // Unix timestamp (ms); used for ordering/undo
}
```

**Validation rules**:
- `id` is generated on placement and never changes.
- `position` must satisfy `GridPosition` bounds.
- One component per grid cell (enforced by spatial index).

---

### 5. `Plot`

The rectangular grid-based building area owned by a player session (FR-001).

```typescript
interface Plot {
  id:         string;                            // UUID v4
  width:      number;                            // Number of grid columns (default: 20)
  height:     number;                            // Number of grid rows   (default: 20)
  components: Map<string, BuildingComponent>;    // spatialKey "x,y" → component
}
```

**Validation rules**:
- `width` and `height` must be positive integers (minimum 5×5, maximum 50×50).
- `components` key is always `"${x},${y}"` — enforced by `PlacementRules`.
- A cell may contain at most one component.

**State transitions**:

```
EMPTY_CELL  ──place──►  OCCUPIED_CELL
OCCUPIED_CELL  ──remove──►  EMPTY_CELL
OCCUPIED_CELL  ──replace──►  OCCUPIED_CELL (new component type)
```

---

### 6. `HouseDesign`

A saved snapshot of a plot's state (FR-007, FR-008). Persisted to localStorage.

```typescript
interface HouseDesign {
  id:            string;       // UUID v4; stable across saves
  name:          string;       // Player-provided name; max 50 chars
  version:       number;       // Schema version (currently: 1)
  createdAt:     number;       // Unix timestamp (ms); set once
  updatedAt:     number;       // Unix timestamp (ms); updated on each save
  plotWidth:     number;
  plotHeight:    number;
  components:    SerializedComponent[];
  checksum:      string;       // Hex CRC32 of JSON(components); corruption guard
}

interface SerializedComponent {
  id:   string;
  type: ComponentType;
  x:    number;
  y:    number;
  o:    Orientation;           // Compact field name to minimise JSON size
  t:    number;                // placedAt timestamp
}
```

**Validation rules**:
- `name` is required, 1–50 characters.
- `version` must equal the current schema version; mismatches trigger migration.
- `checksum` is verified on load; mismatch means the file is corrupted.
- Up to 10 designs per browser origin (soft limit; oldest evicted on overflow).

---

### 7. `PlayerSession`

The current player's in-memory context (not persisted as a named entity; implied by spec).

```typescript
interface PlayerSession {
  activePlot:   Plot;                  // The plot currently being edited
  savedDesigns: HouseDesign[];         // All designs loaded from localStorage
  selectedType: ComponentType | null;  // Currently selected component type
  mode:         'build' | 'preview';   // Current UI mode
}
```

**Validation rules**:
- `activePlot` always exists (a new empty plot is created on session start).
- `mode` switches to `'preview'` on entering preview mode (FR-010), returns to `'build'` on exit.

---

## Relationships

```
PlayerSession
  │
  ├─── activePlot: Plot (1)
  │         └── components: Map<"x,y", BuildingComponent> (0..*)
  │
  └─── savedDesigns: HouseDesign[] (0..10)
                └── components: SerializedComponent[] (0..*)
```

---

## Spatial Index Convention

The spatial index key is the string `"${x},${y}"`. This provides O(1) collision detection, insert, and delete.

```typescript
// Key generation (canonical — always use these helpers)
const toKey = (x: number, y: number): string => `${x},${y}`;
const fromKey = (key: string): GridPosition => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};
```

---

## localStorage Schema

Designs are stored under a single key in `localStorage`:

```
Key:   "vibe_house_game_saves"
Value: JSON array of HouseDesign[]
```

### Current schema version: `1`

| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| `id`        | string   | UUID v4                            |
| `name`      | string   | 1–50 chars                         |
| `version`   | number   | Always `1` for current schema      |
| `createdAt` | number   | ms since epoch                     |
| `updatedAt` | number   | ms since epoch                     |
| `plotWidth` | number   | 5–50                               |
| `plotHeight`| number   | 5–50                               |
| `components`| array    | See `SerializedComponent`          |
| `checksum`  | string   | Hex string; CRC32 of component JSON|
