// T020: useCanvas hook — holds canvas ref and triggers redraws
import { useRef, useEffect, useCallback } from 'react'
import { useGameState } from './useGameState.tsx'
import { renderGrid, DEFAULT_RENDER_OPTIONS } from '../components/Canvas/GridRenderer.ts'
import type { GridPosition } from '@game/types.ts'

export function useCanvas(hoveredCell: GridPosition | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { plot, selectedCell } = useGameState();

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderGrid(ctx, plot, DEFAULT_RENDER_OPTIONS, hoveredCell, selectedCell);
  }, [plot, hoveredCell, selectedCell]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  return { canvasRef, redraw };
}
