// T027: useSave hook — wires LocalStorageAdapter to the React component tree
import { useState, useCallback, useEffect } from 'react'
import { LocalStorageAdapter } from '@storage/LocalStorageAdapter.ts'
import type { SaveResult, LoadResult, DeleteResult, HouseDesign } from '@storage/IStorageAdapter.ts'
import type { StorageError } from '@storage/IStorageAdapter.ts'
import { useGameState } from './useGameState.tsx'
import { serializeComponents, deserializeComponents } from '@utils/json.ts'
import { listComponents } from '@game/GameState.ts'
import type { Plot } from '@game/types.ts'

const adapter = new LocalStorageAdapter();

export interface SaveLoadState {
  designs:    HouseDesign[];
  isSaving:   boolean;
  isLoading:  boolean;
  lastError:  StorageError | null;
}

export interface SaveLoadActions {
  saveDesign(name: string, plot: Plot): Promise<SaveResult>;
  loadDesign(id: string): Promise<LoadResult>;
  deleteDesign(id: string): Promise<DeleteResult>;
  refreshDesigns(): void;
}

export function useSave(): SaveLoadState & SaveLoadActions {
  const { dispatch } = useGameState();
  const [designs, setDesigns]     = useState<HouseDesign[]>([]);
  const [isSaving, setIsSaving]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<StorageError | null>(null);

  const refreshDesigns = useCallback(() => {
    const all = adapter.listAll();
    all.sort((a, b) => b.updatedAt - a.updatedAt);
    setDesigns(all);
  }, []);

  useEffect(() => {
    refreshDesigns();
  }, [refreshDesigns]);

  const saveDesign = useCallback(async (name: string, plot: Plot): Promise<SaveResult> => {
    setIsSaving(true);
    setLastError(null);
    const components = serializeComponents(listComponents(plot));
    const result = adapter.save({
      name,
      plotWidth:  plot.width,
      plotHeight: plot.height,
      components,
    });
    setIsSaving(false);
    if (!result.success) setLastError(result.error);
    refreshDesigns();
    return result;
  }, [refreshDesigns]);

  const loadDesign = useCallback(async (id: string): Promise<LoadResult> => {
    setIsLoading(true);
    setLastError(null);
    const result = adapter.load(id);
    setIsLoading(false);
    if (!result.success) {
      setLastError(result.error);
    } else {
      // Deserialize and dispatch
      const components = deserializeComponents(result.design.components);
      void components; // used via LOAD_DESIGN
      dispatch({ type: 'LOAD_DESIGN', design: result.design });
    }
    return result;
  }, [dispatch]);

  const deleteDesign = useCallback(async (id: string): Promise<DeleteResult> => {
    const result = adapter.delete(id);
    if (!result.success) setLastError(result.error);
    refreshDesigns();
    return result;
  }, [refreshDesigns]);

  return { designs, isSaving, isLoading, lastError, saveDesign, loadDesign, deleteDesign, refreshDesigns };
}
