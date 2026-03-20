// T014 + T022 + T032: useGameState hook with useReducer + useContext
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type {
  Plot,
  ComponentType,
  GridPosition,
  PlacementResult,
  RemovalResult,
} from '@game/types.ts'
import { Orientation } from '@game/types.ts'
import {
  createPlot,
  placeComponent,
  removeComponent,
  replaceComponent,
} from '@game/GameState.ts'
import type { HouseDesign } from '@storage/IStorageAdapter.ts'
import { deserializeComponents } from '@utils/json.ts'
import { GRID_WIDTH, GRID_HEIGHT, COMPONENT_COSTS, INITIAL_MONEY } from '@game/constants.ts'

// ---- Actions ----

export type GameStateAction =
  | { type: 'PLACE_COMPONENT';   componentType: ComponentType; pos: GridPosition; orientation?: Orientation }
  | { type: 'REMOVE_COMPONENT';  pos: GridPosition }
  | { type: 'REPLACE_COMPONENT'; componentType: ComponentType; pos: GridPosition; orientation?: Orientation }
  | { type: 'LOAD_DESIGN';       design: HouseDesign }
  | { type: 'CLEAR_PLOT' }
  | { type: 'SET_MODE';          mode: 'build' | 'erase' | 'preview' }
  | { type: 'SELECT_COMPONENT';  componentType: ComponentType | null }
  | { type: 'SELECT_CELL';       pos: GridPosition | null };

// ---- State ----

export interface GameState {
  plot:             Plot;
  selectedType:     ComponentType | null;
  selectedCell:     GridPosition | null;
  mode:             'build' | 'erase' | 'preview';
  money:            number;
  lastActionResult: PlacementResult | RemovalResult | null;
}

function initialState(): GameState {
  return {
    plot:             createPlot(GRID_WIDTH, GRID_HEIGHT),
    selectedType:     null,
    selectedCell:     null,
    mode:             'build',
    money:            INITIAL_MONEY,
    lastActionResult: null,
  };
}

// ---- Reducer ----

function gameReducer(state: GameState, action: GameStateAction): GameState {
  switch (action.type) {
    case 'PLACE_COMPONENT': {
      const cost = COMPONENT_COSTS[action.componentType];
      if (state.money < cost) {
        return {
          ...state,
          lastActionResult: { success: false, error: 'INSUFFICIENT_FUNDS' },
        };
      }
      const { plot, result } = placeComponent(
        state.plot,
        action.componentType,
        action.pos,
        action.orientation ?? Orientation.NORTH,
      );
      const money = result.success ? state.money - cost : state.money;
      return { ...state, plot, money, lastActionResult: result };
    }
    case 'REMOVE_COMPONENT': {
      const { plot, result } = removeComponent(state.plot, action.pos);
      return { ...state, plot, lastActionResult: result, selectedCell: null };
    }
    case 'REPLACE_COMPONENT': {
      const cost = COMPONENT_COSTS[action.componentType];
      if (state.money < cost) {
        return {
          ...state,
          lastActionResult: { success: false, error: 'INSUFFICIENT_FUNDS' },
        };
      }
      const { plot, result } = replaceComponent(
        state.plot,
        action.componentType,
        action.pos,
        action.orientation ?? Orientation.NORTH,
      );
      const money = result.success ? state.money - cost : state.money;
      return { ...state, plot, money, lastActionResult: result, selectedCell: null };
    }
    case 'LOAD_DESIGN': {
      const { design } = action;
      const components = deserializeComponents(design.components);
      const newPlot: Plot = {
        id:         design.id,
        width:      design.plotWidth,
        height:     design.plotHeight,
        components: new Map(components.map(c => [`${c.position.x},${c.position.y}`, c])),
      };
      return { ...state, plot: newPlot, lastActionResult: null, selectedCell: null };
    }
    case 'CLEAR_PLOT':
      return {
        ...state,
        plot:             createPlot(state.plot.width, state.plot.height),
        money:            INITIAL_MONEY,
        lastActionResult: null,
        selectedCell:     null,
      };
    case 'SET_MODE':
      return { ...state, mode: action.mode, selectedCell: null };
    case 'SELECT_COMPONENT':
      return { ...state, selectedType: action.componentType, selectedCell: null };
    case 'SELECT_CELL':
      return { ...state, selectedCell: action.pos };
  }
}

// ---- Context ----

export interface GameStateContext extends GameState {
  dispatch: (action: GameStateAction) => void;
}

const Context = createContext<GameStateContext | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);
  return (
    <Context.Provider value={{ ...state, dispatch }}>
      {children}
    </Context.Provider>
  );
}

export function useGameState(): GameStateContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useGameState must be used inside <GameStateProvider>');
  return ctx;
}
