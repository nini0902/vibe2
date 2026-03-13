// T024: ActionPanel — shown when a cell is selected, allows remove/replace
import { useGameState } from '@hooks/useGameState.tsx'
import { ComponentPanel } from '../ComponentPanel/ComponentPanel.tsx'
import { getOccupant } from '@game/PlacementRules.ts'
import type { ComponentType } from '@game/types.ts'
import styles from './ActionPanel.module.css'

export function ActionPanel() {
  const { plot, selectedCell, dispatch } = useGameState();

  if (!selectedCell) return null;

  const occupant = getOccupant(plot, selectedCell);

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_COMPONENT', pos: selectedCell });
  };

  const handleReplace = (type: ComponentType) => {
    dispatch({ type: 'REPLACE_COMPONENT', componentType: type, pos: selectedCell });
  };

  const handleDeselect = () => {
    dispatch({ type: 'SELECT_CELL', pos: null });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          Selected: {occupant?.type ?? 'empty'}
        </span>
        <button className={styles.closeBtn} onClick={handleDeselect} title="Deselect">✕</button>
      </div>
      <button className={styles.removeBtn} onClick={handleRemove}>
        🗑 Remove
      </button>
      <hr className={styles.divider} />
      <span className={styles.replaceLabel}>Replace with:</span>
      <ComponentPanel onSelect={handleReplace} />
    </div>
  );
}
