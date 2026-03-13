# Quickstart: House-Building Game

**Feature**: `001-house-building-game`  
**Date**: 2026-03-13

---

## Overview

A browser-based, single-player, grid-based 2D house-building game. Players place and remove building components (walls, floors, roof, doors, windows) on a rectangular plot, save/load designs via localStorage, and enter a preview mode to view the finished house.

---

## Prerequisites

- **Node.js** ≥ 18  
- **npm** ≥ 9 (or pnpm/yarn equivalent)  
- A modern browser (Chrome 110+, Firefox 110+, Safari 16+, Edge 110+)

---

## Bootstrap

```bash
# 1. Create the Vite + React + TypeScript project
npm create vite@latest house-game -- --template react-ts
cd house-game

# 2. Install runtime dependencies
npm install uuid

# 3. Install dev/test dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom \
              @testing-library/user-event jsdom @types/uuid

# 4. Configure Vitest in vite.config.ts
#    (see Configuration section below)

# 5. Start development server
npm run dev
# → http://localhost:5173
```

---

## Directory Layout

```
house-game/
├── src/
│   ├── components/          # React UI components
│   │   ├── Canvas/          # GameCanvas + GridRenderer
│   │   ├── ComponentPanel/  # Building component selector
│   │   ├── SaveLoadModal/   # Save / Load UI
│   │   ├── PreviewMode/     # Preview / tilt view
│   │   └── App.tsx
│   ├── game/                # Framework-agnostic game logic
│   │   ├── types.ts
│   │   ├── GameState.ts
│   │   ├── PlacementRules.ts
│   │   └── constants.ts
│   ├── storage/             # localStorage abstraction
│   │   ├── IStorageAdapter.ts
│   │   └── LocalStorageAdapter.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useGameState.ts
│   │   ├── useCanvas.ts
│   │   └── useSave.ts
│   ├── utils/
│   │   ├── canvas.ts        # Pixel ↔ grid coordinate helpers
│   │   └── json.ts          # Serialisation helpers
│   └── main.tsx
├── tests/
│   ├── unit/                # Pure function tests
│   └── integration/         # Multi-module flow tests
├── public/index.html
├── vite.config.ts
└── tsconfig.json
```

---

## Configuration

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@game':    '/src/game',
      '@storage': '/src/storage',
      '@hooks':   '/src/hooks',
      '@utils':   '/src/utils',
    },
  },
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  './tests/setup.ts',
  },
});
```

### `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
```

### `tsconfig.json` path aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@game/*":    ["src/game/*"],
      "@storage/*": ["src/storage/*"],
      "@hooks/*":   ["src/hooks/*"],
      "@utils/*":   ["src/utils/*"]
    }
  }
}
```

---

## Key Scripts

```bash
npm run dev        # Vite dev server with HMR (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run test       # Vitest in watch mode
npm run test:run   # Vitest single-run (CI)
npm run lint       # ESLint
```

---

## Core Concepts

### Placing a Component

```typescript
import { placeComponent } from '@game/GameState';
import { ComponentType } from '@game/types';

const { plot: updatedPlot, result } = placeComponent(
  plot,
  ComponentType.WALL,
  { x: 3, y: 4 },
);

if (result.success) {
  setPlot(updatedPlot);               // React state update
} else {
  showError(result.error);            // 'CELL_OCCUPIED' | 'OUT_OF_BOUNDS'
}
```

### Saving a Design

```typescript
import { LocalStorageAdapter } from '@storage/LocalStorageAdapter';

const adapter = new LocalStorageAdapter();
const result = adapter.save({
  name:       'My First House',
  plotWidth:  plot.width,
  plotHeight: plot.height,
  components: serializeComponents(plot),
});

if (!result.success) {
  showError(result.error);            // 'QUOTA_EXCEEDED' | 'INVALID_NAME'
}
```

### Loading a Design

```typescript
const result = adapter.load(design.id);

if (result.success) {
  const restoredPlot = deserializePlot(result.design);
  dispatch({ type: 'LOAD_DESIGN', design: result.design });
} else {
  showError(result.error);            // 'CORRUPTED' | 'NOT_FOUND'
}
```

---

## Running Tests

```bash
# All tests
npm run test:run

# Watch mode during development
npm run test

# With coverage
npm run test -- --coverage
```

### Example Unit Test

```typescript
// tests/unit/PlacementRules.test.ts
import { describe, it, expect } from 'vitest';
import { createPlot, placeComponent } from '@game/GameState';
import { ComponentType } from '@game/types';

describe('Placement Rules', () => {
  it('prevents placement on an occupied cell', () => {
    let plot = createPlot(10, 10);

    ({ plot } = placeComponent(plot, ComponentType.WALL, { x: 5, y: 5 }));

    const { result } = placeComponent(plot, ComponentType.DOOR, { x: 5, y: 5 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('CELL_OCCUPIED');
    }
  });
});
```

---

## Acceptance Scenario Checklist

Before marking a user story as done, verify:

- [ ] **US-1** New session starts with an empty plot (FR-001)
- [ ] **US-1** Component panel shows all 5 component types (FR-002)
- [ ] **US-1** Clicking an empty cell places the selected component (FR-003)
- [ ] **US-1** Clicking an occupied cell shows "Cell occupied" message (FR-004)
- [ ] **US-2** Selecting a placed component and clicking Remove empties the cell (FR-005)
- [ ] **US-2** Selecting a placed component and clicking a new type replaces it (FR-006)
- [ ] **US-3** Clicking Save persists the design to localStorage (FR-007)
- [ ] **US-3** Loading a design restores all components at correct positions (FR-008)
- [ ] **US-4** Clicking Preview enters preview mode with a clear house render (FR-010)
- [ ] Grid re-renders on every placement/removal (FR-009)
