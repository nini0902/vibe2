---

description: "Task list for House-Building Game implementation"

---

# Tasks: House-Building Game

**Input**: Design documents from `/specs/001-house-building-game/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths are included in every description

## Path Conventions

Single frontend SPA — all source code lives at repository root:  
`src/` (game logic, components, hooks, storage, utils), `tests/` (unit, integration)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vite + React + TypeScript project and establish the full directory structure before any game code is written.

- [ ] T001 Scaffold Vite + React + TypeScript project: `npm create vite@latest . -- --template react-ts` at repository root
- [ ] T002 Install runtime dependency: `npm install uuid` (UUID generation for component/design IDs)
- [ ] T003 [P] Install dev/test dependencies: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/uuid`
- [ ] T004 [P] Configure Vite dev server and Vitest (globals, jsdom environment, setupFiles, path aliases) in `vite.config.ts`
- [ ] T005 [P] Configure TypeScript path aliases (`@game`, `@storage`, `@hooks`, `@utils`) in `tsconfig.json`
- [ ] T006 Create full project directory skeleton: `src/components/Canvas/`, `src/components/ComponentPanel/`, `src/components/SaveLoadModal/`, `src/components/PreviewMode/`, `src/game/`, `src/storage/`, `src/hooks/`, `src/utils/`, `src/styles/`, `tests/unit/`, `tests/integration/`

**Checkpoint**: `npm run dev` launches a blank Vite + React app; `npm run test:run` runs zero tests without error.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core game-logic types, pure functions, and shared infrastructure that every user story depends on. No user story implementation can begin until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Define all TypeScript enums and interfaces (`ComponentType`, `Orientation`, `GridPosition`, `BuildingComponent`, `Plot`, `PlacementResult`, `RemovalResult`) in `src/game/types.ts`
- [ ] T008 [P] Define game constants (`GRID_WIDTH = 20`, `GRID_HEIGHT = 20`, `COMPONENT_LIST`, `MIN_GRID = 5`, `MAX_GRID = 50`) in `src/game/constants.ts`
- [ ] T009 [P] Implement pure `PlacementRules` functions (`canPlace`, `canRemove`, `getOccupant`) using spatial-index key `"x,y"` in `src/game/PlacementRules.ts`
- [ ] T010 Implement `GameState` module (`createPlot`, `placeComponent`, `removeComponent`, `replaceComponent`, `listComponents`, `toKey`) with immutable snapshot returns in `src/game/GameState.ts` (depends on T007, T009)
- [ ] T011 [P] Implement canvas pixel-to-grid coordinate helpers (`pixelToGrid`, `gridToPixel`) in `src/utils/canvas.ts`
- [ ] T012 [P] Implement JSON serialisation helpers (`serializeComponents`, `deserializeComponents`) and CRC32 checksum utility in `src/utils/json.ts`
- [ ] T013 [P] Define `SerializedComponent`, `HouseDesign`, `SaveResult`, `LoadResult`, `DeleteResult`, and `StorageError` types; define `IStorageAdapter` interface in `src/storage/IStorageAdapter.ts`
- [ ] T014 Implement `useGameState` hook with `useReducer` + `useContext` (actions: `PLACE_COMPONENT`, `REMOVE_COMPONENT`, `REPLACE_COMPONENT`, `LOAD_DESIGN`, `CLEAR_PLOT`, `SET_MODE`, `SELECT_COMPONENT`) in `src/hooks/useGameState.ts` (depends on T007, T010)
- [ ] T015 Create `App.tsx` root component with `<GameStateProvider>` context provider and top-level layout scaffold (header, canvas area, side panel) in `src/components/App.tsx` (depends on T014)

**Checkpoint**: `src/game/GameState.ts` and `src/game/PlacementRules.ts` are independently importable and all exported functions are callable without React. Foundation is ready — user story phases can now proceed.

---

## Phase 3: User Story 1 — Place and Build a House (Priority: P1) 🎯 MVP

**Goal**: A player can start a new game session, select a building component from the panel, click a grid cell to place it, and see immediate visual feedback. Placing on an occupied cell shows an error message.

**Independent Test**: Launch `npm run dev`, open the app, select a wall from the panel, click an empty grid cell — the wall appears. Click the same cell again — an error message appears. No save/load or preview functionality is required.

- [ ] T016 [P] [US1] Implement `GridRenderer` pure functions (`renderGrid`, `pixelToGrid`) that draw grid lines and component tiles onto a `CanvasRenderingContext2D` using `RenderOptions` in `src/components/Canvas/GridRenderer.ts`
- [ ] T017 [US1] Implement `GameCanvas` React component that hosts the `<canvas>` element, listens for mouse clicks and hover, converts pixel coords via `GridRenderer.pixelToGrid`, and dispatches `PLACE_COMPONENT` or `SELECT_COMPONENT` actions via `useGameState` in `src/components/Canvas/GameCanvas.tsx` (depends on T014, T016)
- [ ] T018 [P] [US1] Implement `ComponentButton` displaying a component type icon/label and highlighting when selected in `src/components/ComponentPanel/ComponentButton.tsx`
- [ ] T019 [US1] Implement `ComponentPanel` listing all five `ComponentType` values as `<ComponentButton>` items; dispatches `SELECT_COMPONENT` on click in `src/components/ComponentPanel/ComponentPanel.tsx` (depends on T018)
- [ ] T020 [US1] Implement `useCanvas` hook that holds the canvas `ref`, triggers `renderGrid` redraws whenever `plot` state changes, and exposes `canvasRef` to `GameCanvas` in `src/hooks/useCanvas.ts` (depends on T014, T016)
- [ ] T021 [US1] Wire `App.tsx` to render `<GameCanvas>` and `<ComponentPanel>` side-by-side, initialise an empty 20×20 plot on first render via `createPlot`, and display a status bar showing `lastActionResult` errors (e.g., "Cell is already occupied") in `src/components/App.tsx` (depends on T015, T017, T019, T020)

**Checkpoint**: User Story 1 is fully functional — a player can open the app, select any component, and place it on the grid. Occupied-cell error message displays correctly. No other stories are required to verify this.

---

## Phase 4: User Story 2 — Remove or Modify Placed Components (Priority: P2)

**Goal**: A player can click an existing component on the grid to select it, then choose "Remove" to clear the cell or select a different component type to replace it — all in at most two interactions.

**Independent Test**: Place a door, click it to select it, click "Remove" — the cell empties. Place a window, click it, select a wall from the panel — the window is replaced by a wall. Verify via `npm run dev` only; no save/load required.

- [ ] T022 [P] [US2] Extend `useGameState` reducer to track `selectedCell: GridPosition | null` and add `SELECT_CELL` action so clicking an occupied cell selects it (rather than attempting placement) in `src/hooks/useGameState.ts` (depends on T014)
- [ ] T023 [US2] Update `GameCanvas` click handler to distinguish between "select occupied cell" and "place on empty cell" based on `canRemove` / `canPlace` from `PlacementRules`, and highlight the selected cell on the canvas in `src/components/Canvas/GameCanvas.tsx` (depends on T017, T022)
- [ ] T024 [P] [US2] Implement `ActionPanel` component that appears when a cell is selected, showing "Remove" button and the `<ComponentPanel>` for replacement in `src/components/ActionPanel/ActionPanel.tsx` (depends on T019)
- [ ] T025 [US2] Wire `ActionPanel` into `App.tsx`: render it conditionally when `selectedCell` is non-null; dispatch `REMOVE_COMPONENT` on "Remove" click and `REPLACE_COMPONENT` on component-type selection in `src/components/App.tsx` (depends on T021, T024)

**Checkpoint**: User Stories 1 and 2 both work independently. Players can fully place, select, remove, and replace components before save/load or preview exist.

---

## Phase 5: User Story 3 — Save and Load a House Design (Priority: P3)

**Goal**: A player can save the current plot under a chosen name (persisted to `localStorage`), see a list of saved designs, and load any one of them to restore all placed components exactly.

**Independent Test**: Build a partial house, click "Save", provide a name, confirm save toast. Refresh the page (new session), click "Load", select the saved design — all components reappear at the correct positions. Test via `npm run dev` only.

- [ ] T026 [US3] Implement `LocalStorageAdapter` class (methods: `save`, `update`, `load`, `listAll`, `delete`, `deleteAll`) with CRC32 checksum verification, schema version checking, QuotaExceededError handling, and 10-design eviction policy in `src/storage/LocalStorageAdapter.ts` (depends on T012, T013)
- [ ] T027 [US3] Implement `useSave` hook that instantiates `LocalStorageAdapter`, exposes `saveDesign`, `loadDesign`, `deleteDesign`, `refreshDesigns`, and manages `SaveLoadState` (`designs`, `isSaving`, `isLoading`, `lastError`) in `src/hooks/useSave.ts` (depends on T014, T026)
- [ ] T028 [P] [US3] Implement `SaveForm` component with a text input for design name and a "Save" submit button in `src/components/SaveLoadModal/SaveForm.tsx`
- [ ] T029 [P] [US3] Implement `LoadList` component rendering a list of `HouseDesign` items (name, updatedAt, delete button) with "Load" action per item in `src/components/SaveLoadModal/LoadList.tsx`
- [ ] T030 [US3] Implement `SaveLoadModal` shell that composes `<SaveForm>` and `<LoadList>` inside a modal overlay with open/close state in `src/components/SaveLoadModal/SaveLoadModal.tsx` (depends on T028, T029)
- [ ] T031 [US3] Wire `SaveLoadModal` and `useSave` into `App.tsx`: add "Save / Load" button to the header, handle `saveDesign` with the current plot, handle `loadDesign` by dispatching `LOAD_DESIGN` action in `src/components/App.tsx` (depends on T025, T027, T030)

**Checkpoint**: User Stories 1, 2, and 3 all work independently. Players can build, edit, save, and reload house designs across browser sessions.

---

## Phase 6: User Story 4 — View Completed House (Priority: P4)

**Goal**: A player can enter a "Preview" mode that displays the finished house with a CSS perspective transform (isometric-like tilt), allowing them to rotate/zoom the view using mouse drag.

**Independent Test**: Build a house structure, click "Preview" — the canvas tilts into an isometric-like view. Drag the mouse to rotate. Click "Exit Preview" to return to the grid editor. Test via `npm run dev`.

- [ ] T032 [P] [US4] Add `SET_MODE` action handler to `useGameState` reducer to toggle `mode` between `'build'` and `'preview'` in `src/hooks/useGameState.ts` (depends on T022)
- [ ] T033 [US4] Implement `PreviewMode` component that wraps the canvas in a `<div>` with CSS `transform: perspective(800px) rotateX(45deg)`, listens for `mousemove` drag events to update `rotateY`, and exposes an "Exit Preview" button in `src/components/PreviewMode/PreviewMode.tsx` (depends on T016)
- [ ] T034 [US4] Wire `PreviewMode` into `App.tsx`: add "Preview" button to the header; conditionally render `<PreviewMode>` instead of `<GameCanvas>` when `mode === 'preview'`; dispatch `SET_MODE` actions in `src/components/App.tsx` (depends on T031, T033)

**Checkpoint**: All four user stories are independently functional. Players can build, edit, save/load, and preview their house design.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Styling, entry-point wiring, edge-case handling, and final acceptance validation across all user stories.

- [ ] T035 [P] Add CSS module files for all components (`GameCanvas.module.css`, `ComponentPanel.module.css`, `ActionPanel.module.css`, `SaveLoadModal.module.css`, `PreviewMode.module.css`) with base layout and colour theme in `src/styles/`
- [ ] T036 Wire application entry point: import `<App>` and mount into `#root` in `src/main.tsx`; ensure `index.html` in `public/` references `main.tsx`
- [ ] T037 [P] Add edge-case handling: display quota-exceeded banner when `LocalStorageAdapter` returns `QUOTA_EXCEEDED`; show corrupted-design warning when `load` returns `CORRUPTED`; prevent saving an empty plot with a clear user message in `src/components/App.tsx`
- [ ] T038 [P] Add hover highlight to `GridRenderer.renderGrid` so the cell under the cursor is visually distinct from empty and occupied cells in `src/components/Canvas/GridRenderer.ts`
- [ ] T039 Run the full acceptance scenario checklist from `specs/001-house-building-game/quickstart.md` manually against `npm run dev` and confirm all items pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **User Stories (Phases 3–6)**: All depend on Foundational phase completion; can proceed in priority order (P1 → P2 → P3 → P4) or in parallel by separate developers
- **Polish (Phase 7)**: Depends on all desired user story phases being complete

### User Story Dependencies

| Story | Priority | Depends on | Independently testable? |
|-------|----------|------------|------------------------|
| US1 — Place & Build | P1 | Phase 2 only | ✅ Yes |
| US2 — Remove & Modify | P2 | Phase 2 + US1 GameCanvas | ✅ Yes (builds on US1 UI) |
| US3 — Save & Load | P3 | Phase 2 only | ✅ Yes (storage is separate) |
| US4 — Preview | P4 | Phase 2 + US1 GridRenderer | ✅ Yes (CSS transform only) |

### Within Each User Story

- Foundational types/logic (Phase 2) must be complete before story tasks begin
- Components rendered on canvas depend on `GridRenderer` (T016) being complete
- Hooks depend on types and GameState module
- UI components can be built in parallel where marked [P]

### Parallel Opportunities

- All Setup tasks marked [P] can run simultaneously within Phase 1
- All Foundational tasks marked [P] can run simultaneously within Phase 2
- Once Phase 2 is complete, US1 and US3 can begin in parallel (they share no files)
- Within each user story, all tasks marked [P] can run simultaneously

---

## Parallel Example: Phase 2 (Foundational)

```
# These four tasks have no interdependencies and touch different files:
T008 [P] src/game/constants.ts
T009 [P] src/game/PlacementRules.ts
T011 [P] src/utils/canvas.ts
T012 [P] src/utils/json.ts
T013 [P] src/storage/IStorageAdapter.ts
```

## Parallel Example: User Story 1

```
# These two tasks can run at the same time:
T016 [P] [US1] src/components/Canvas/GridRenderer.ts
T018 [P] [US1] src/components/ComponentPanel/ComponentButton.tsx
```

## Parallel Example: User Story 3

```
# These two tasks can run at the same time:
T028 [P] [US3] src/components/SaveLoadModal/SaveForm.tsx
T029 [P] [US3] src/components/SaveLoadModal/LoadList.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL** — blocks everything)
3. Complete Phase 3: User Story 1 (Place & Build)
4. **STOP and VALIDATE**: open `npm run dev`, place components, verify occupied-cell error
5. Demo / deploy if ready

### Incremental Delivery

1. **Foundation** (Phase 1 + 2) → project runs, game logic is testable
2. **+US1** (Phase 3) → core build loop playable → **Ship MVP**
3. **+US2** (Phase 4) → remove/replace works → improved UX
4. **+US3** (Phase 5) → save/load works → persistent designs
5. **+US4** (Phase 6) → preview mode → visual payoff
6. **Polish** (Phase 7) → production-ready

### Parallel Team Strategy (if multiple developers)

After Phases 1–2 are complete:

- **Developer A**: Phase 3 (US1 — core placement loop)
- **Developer B**: Phase 5 US3 T026–T027 (storage layer — no UI dependency)

US1 and US3 storage layer share no files and can be built simultaneously.

---

## Notes

- `[P]` tasks touch different files and have no dependency on incomplete tasks in the same phase
- `[US1]`–`[US4]` labels map each task to the user story it directly implements
- Each story phase ends with a checkpoint describing exactly how to verify the story independently
- No test tasks are included (tests not explicitly requested in the feature specification)
- All localStorage operations are synchronous; no async middleware is needed in `useGameState`
- CRC32 checksum implementation should use a pure-JS algorithm (no native dependencies) to keep bundle size minimal
- The `Map<string, BuildingComponent>` spatial index must be serialised/deserialised as a plain array in `SerializedComponent[]` format because `JSON.stringify` does not support `Map` natively
