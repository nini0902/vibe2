# Research: House-Building Game

**Feature**: `001-house-building-game`  
**Phase**: Phase 0 — Outline & Research  
**Date**: 2026-03-13

---

## R-001: Framework Selection

**Decision**: React 18 + TypeScript 5  
**Rationale**: The house-building game is a creative UI tool, not a performance-critical game engine. React's component model maps naturally to the building UI (component panel, canvas host, save/load modal). TypeScript provides type safety for complex game state (grid coordinates, component types, validation rules). Vite is used as the build tool for fast HMR.  
**Alternatives considered**:
- *Phaser.js / PixiJS*: Overkill; adds bundle size and complexity (physics, sprite sheets) not needed for a static grid view.
- *Vue 3*: Functionally equivalent to React; React chosen for ecosystem maturity and tooling.
- *Vanilla JS*: Lacks reactive state management; localStorage sync becomes error-prone without a framework.

---

## R-002: Rendering Engine

**Decision**: HTML5 Canvas 2D API for the game grid; React DOM for all UI chrome  
**Rationale**: A 50×50 grid creates 2,500 cells. Rendering each cell as a DOM element causes memory bloat and layout thrashing. Canvas 2D provides efficient pixel-level drawing, simple click-to-grid coordinate mapping, and easy hover/selection highlighting without DOM reflows.  
**Alternatives considered**:
- *WebGL / Three.js*: 3D capability not needed; adds shader complexity for no gain.
- *CSS Grid (DOM)*: Suitable only for grids <20×20; performance degrades at larger sizes.
- *SVG*: Similar perf issues to DOM at scale; harder to implement hover effects efficiently.

---

## R-003: Grid State Data Structure

**Decision**: Sparse `Map<string, BuildingComponent>` keyed by `"x,y"` (spatial index)  
**Rationale**: Only occupied cells are stored, keeping memory O(n) where n = placed components rather than O(width × height). `Map` provides O(1) lookup, insert, and delete for all placement operations. The string key `"x,y"` acts as a spatial index without a 2D array.  
**Alternatives considered**:
- *Dense 2D array*: Fine for small grids but wastes memory if mostly empty; chosen when grid is known to be small and full.
- *Flat array + linear search*: O(n) collision detection — rejected for correctness and performance.
- *Component list only (no index)*: Requires O(n) search to check cell occupancy — rejected.

---

## R-004: Save/Load Persistence

**Decision**: Browser `localStorage` with versioned JSON + simple checksum  
**Rationale**: Spec states "saving may use local storage or a simple session key" and "no mandatory account registration". localStorage is available in all evergreen browsers, requires no backend, and supports up to ~5 MB per origin (ample for game state JSON). Saves are wrapped in a versioned envelope to support future schema migrations.  
**Alternatives considered**:
- *IndexedDB*: Better for large binary data; unnecessary complexity for small JSON game state.
- *sessionStorage*: Data lost on tab close — does not satisfy FR-007 (persist between sessions).
- *Backend API*: Out of scope; adds server dependency and authentication complexity.

**Error handling patterns**:
- `QuotaExceededError` → prompt user to delete old saves.
- Corrupted JSON → `JSON.parse` try/catch → return empty list rather than crash.
- Schema mismatch → version field triggers migration path.
- Interrupted save (tab close mid-write) → write to temp key, verify readback, then rename (atomic-write pattern).

---

## R-005: Testing Strategy

**Decision**: Vitest + React Testing Library (unit + integration); optional Playwright (E2E)  
**Rationale**: Vitest runs 2–3× faster than Jest (esbuild-powered), has native TypeScript support, and is a drop-in Jest replacement. React Testing Library encourages testing user behavior rather than implementation details. The test pyramid focuses on: (60%) unit tests for pure game logic (`game/`), (30%) integration tests for React hooks + UI flows, (10%) optional E2E for full player sessions.  
**Alternatives considered**:
- *Jest*: Functionally equivalent but slower; no ESM-native support.
- *Cypress (component tests)*: Heavier; better suited for E2E than unit/integration.
- *Enzyme*: Deprecated; tests implementation details.

---

## R-006: Replace-Component Operation

**Decision**: Atomic read-modify-write on the spatial index Map  
**Rationale**: "Replace" (FR-006) must swap the existing component for a new one in one interaction. Using the Map, this is: `map.set(key, newComponent)` — a single O(1) operation that atomically overwrites the previous value. No intermediate "empty" state is visible to the user.  
**Alternatives considered**:
- *Remove + Place (two steps)*: Risk of intermediate empty state showing in UI if React re-renders between the two operations; solved by batching in a single state update.

---

## R-007: Preview Mode

**Decision**: CSS `transform: perspective()` + `rotateX()` for isometric-like 2D tilt; no 3D engine  
**Rationale**: The spec requires "at least one perspective outside the grid editor" (FR-010). A CSS transform applied to the canvas element simulates isometric depth cheaply without a 3D engine, WebGL, or additional libraries. Players can rotate using mouse drag (touch on canvas).  
**Alternatives considered**:
- *Three.js / Babylon.js*: Full 3D — out of scope per spec assumption "two-dimensional (top-down or isometric view)"; full 3D placement explicitly excluded.
- *Pre-rendered sprites*: Requires art assets; out of scope for MVP.

---

## R-008: State Management

**Decision**: React `useReducer` + `useContext` (no external state library for MVP)  
**Rationale**: Game state fits cleanly into a reducer pattern (actions: `PLACE_COMPONENT`, `REMOVE_COMPONENT`, `REPLACE_COMPONENT`, `LOAD_DESIGN`, `CLEAR_PLOT`). No async middleware needed — localStorage is synchronous. Context distributes state to Canvas and UI without prop drilling.  
**Alternatives considered**:
- *Zustand*: Good alternative if complexity grows; can be adopted later without architectural change.
- *Redux Toolkit*: Overkill for a single-player game with simple state shape.
- *useState*: Difficult to manage multiple inter-related state slices (grid, selection, saves).
