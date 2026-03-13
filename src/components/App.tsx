// T015 + T021 + T025 + T031 + T034 + T037: Root App component
import { useState } from 'react'
import { GameStateProvider, useGameState } from '@hooks/useGameState.tsx'
import { useSave } from '@hooks/useSave.ts'
import { GameCanvas } from './Canvas/GameCanvas.tsx'
import { ComponentPanel } from './ComponentPanel/ComponentPanel.tsx'
import { ActionPanel } from './ActionPanel/ActionPanel.tsx'
import { SaveLoadModal } from './SaveLoadModal/SaveLoadModal.tsx'
import { PreviewMode } from './PreviewMode/PreviewMode.tsx'
import { listComponents } from '@game/GameState.ts'
import styles from './App.module.css'

function GameApp() {
  const { plot, mode, lastActionResult, selectedCell, dispatch } = useGameState();
  const { designs, isSaving, isLoading, lastError, saveDesign, loadDesign, deleteDesign } = useSave();
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (name: string) => {
    if (listComponents(plot).length === 0) {
      showToast('⚠ Cannot save an empty plot. Place at least one component first.');
      return;
    }
    const result = await saveDesign(name, plot);
    if (result.success) {
      showToast(`✅ Design "${name}" saved!`);
      setModalOpen(false);
    } else {
      showToast(`❌ Save failed: ${result.error}`);
    }
  };

  const handleLoad = async (id: string) => {
    const result = await loadDesign(id);
    if (result.success) {
      showToast('✅ Design loaded!');
      setModalOpen(false);
    } else {
      showToast(`❌ Load failed: ${result.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDesign(id);
    showToast('🗑 Design deleted.');
  };

  const errorMsg = (() => {
    if (lastError === 'QUOTA_EXCEEDED')
      return '⚠ Storage full! Delete old designs to free space.';
    if (lastError === 'CORRUPTED')
      return '⚠ That design appears corrupted and cannot be loaded.';
    return null;
  })();

  const placementError = (() => {
    if (!lastActionResult) return null;
    if (!lastActionResult.success) {
      if (lastActionResult.error === 'CELL_OCCUPIED') return '⛔ Cell is already occupied.';
      if (lastActionResult.error === 'OUT_OF_BOUNDS') return '⛔ Position is out of bounds.';
      if (lastActionResult.error === 'CELL_EMPTY')    return '⛔ No component at that position.';
    }
    return null;
  })();

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.logo}>🏠 House Builder</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.headerBtn}
            onClick={() => dispatch({ type: 'CLEAR_PLOT' })}
            title="Clear all components"
          >
            🗑 Clear
          </button>
          <button
            className={styles.headerBtn}
            onClick={() => setModalOpen(true)}
          >
            💾 Save / Load
          </button>
          <button
            className={`${styles.headerBtn} ${mode === 'preview' ? styles.activeBtn : ''}`}
            onClick={() => dispatch({ type: 'SET_MODE', mode: mode === 'preview' ? 'build' : 'preview' })}
          >
            {mode === 'preview' ? '✏ Edit' : '👁 Preview'}
          </button>
        </div>
      </header>

      {/* Status bar */}
      {(placementError || errorMsg || toast) && (
        <div className={`${styles.statusBar} ${(placementError || errorMsg) ? styles.statusError : styles.statusInfo}`}>
          {toast ?? placementError ?? errorMsg}
        </div>
      )}

      {/* Main area */}
      <main className={styles.main}>
        {mode === 'preview' ? (
          <PreviewMode />
        ) : (
          <>
            <div className={styles.canvas}>
              <GameCanvas />
            </div>
            <aside className={styles.sidebar}>
              {selectedCell ? <ActionPanel /> : <ComponentPanel />}
            </aside>
          </>
        )}
      </main>

      {/* Save/Load Modal */}
      <SaveLoadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        designs={designs}
        isSaving={isSaving}
        isLoading={isLoading}
        onSave={handleSave}
        onLoad={handleLoad}
        onDelete={handleDelete}
      />
    </div>
  );
}

export function App() {
  return (
    <GameStateProvider>
      <GameApp />
    </GameStateProvider>
  );
}
