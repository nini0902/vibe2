# Implementation Plan: House-Building Game

**Branch**: `001-house-building-game` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-house-building-game/spec.md`

## Summary

Build a browser-based, single-player, grid-based 2D house-building game. Players place and remove building components (walls, floors, roof, doors, windows) on a rectangular plot, save/load designs via localStorage, and enter a preview mode to view the finished house. The technical approach uses React + TypeScript for the UI, HTML5 Canvas for grid rendering, and a sparse Map-based grid state for O(1) placement and collision detection.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18  
**Primary Dependencies**: React, Vite, Vitest, React Testing Library, UUID  
**Storage**: Browser localStorage (versioned JSON with checksums)  
**Testing**: Vitest (unit + integration), React Testing Library (component), Playwright (E2E optional)  
**Target Platform**: Web browser (modern evergreen browsers — Chrome, Firefox, Safari, Edge)  
**Project Type**: Web application (frontend-only SPA, no backend)  
**Performance Goals**: Smooth placement interactions (<16ms per frame on 50×50 grid); save/load in <3 s (SC-003)  
**Constraints**: No mandatory login; localStorage only; 2D top-down view (no 3D); single player  
**Scale/Scope**: Single SPA; grid up to 50×50 cells; up to 10 saved designs per browser

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> The project constitution (`/memory/constitution.md`) contains placeholder template text and has not yet been filled in with project-specific principles. No gates can fail against placeholder content. This section will be revisited once the constitution is ratified.

**Post-design re-check**: No constitution violations identified. The design uses a single frontend project (no unnecessary complexity), localStorage (simplest persistence for a browser game), and a clear separation between game logic (`game/`) and React UI (`components/`).

## Project Structure

### Documentation (this feature)

```text
specs/001-house-building-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── game-state.contract.md
│   └── storage.contract.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   ├── GameCanvas.tsx          # Canvas host component
│   │   └── GridRenderer.ts         # Pure canvas drawing logic
│   ├── ComponentPanel/
│   │   ├── ComponentPanel.tsx      # Building component selector
│   │   └── ComponentButton.tsx
│   ├── SaveLoadModal/
│   │   ├── SaveLoadModal.tsx       # Save / Load UI
│   │   ├── SaveForm.tsx
│   │   └── LoadList.tsx
│   ├── PreviewMode/
│   │   └── PreviewMode.tsx         # Preview / rotate view
│   └── App.tsx                     # Root component
│
├── game/                           # Framework-agnostic game logic
│   ├── types.ts                    # All TypeScript interfaces & enums
│   ├── GameState.ts                # Core state model
│   ├── PlacementRules.ts           # Validation (pure functions)
│   └── constants.ts                # GRID_WIDTH, GRID_HEIGHT, component list
│
├── storage/
│   ├── StorageManager.ts           # Save/load interface
│   └── LocalStorageAdapter.ts      # Browser localStorage implementation
│
├── hooks/
│   ├── useGameState.ts             # Game state + dispatch
│   ├── useCanvas.ts                # Canvas ref + redraw
│   └── useSave.ts                  # Save/load actions
│
├── utils/
│   ├── canvas.ts                   # Pixel ↔ grid coordinate conversion
│   └── json.ts                     # JSON serialisation helpers
│
├── styles/                         # CSS modules
└── main.tsx                        # Vite entry point

tests/
├── unit/                           # Pure function tests (GameState, rules)
├── integration/                    # Multi-module flow tests
└── e2e/                            # Optional Playwright tests

public/
└── index.html

package.json
tsconfig.json
vite.config.ts
```

**Structure Decision**: Pure frontend SPA (Option 2 simplified — no backend). Game logic lives in `game/` with zero React imports, enabling independent testing. React UI lives in `components/` and `hooks/`. `storage/` abstracts localStorage behind an interface for testability.

## Complexity Tracking

> No constitution violations require justification.
