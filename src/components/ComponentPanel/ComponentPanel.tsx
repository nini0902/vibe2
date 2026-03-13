// T019: ComponentPanel — lists all ComponentType values as ComponentButton items
import { useGameState } from '@hooks/useGameState.tsx'
import { ComponentButton } from './ComponentButton.tsx'
import type { ComponentType } from '@game/types.ts'
import { COMPONENT_LIST } from '@game/constants.ts'
import styles from './ComponentPanel.module.css'

interface ComponentPanelProps {
  onSelect?: (type: ComponentType) => void;
}

export function ComponentPanel({ onSelect }: ComponentPanelProps) {
  const { selectedType, dispatch } = useGameState();

  const handleSelect = (type: ComponentType) => {
    dispatch({ type: 'SELECT_COMPONENT', componentType: type });
    onSelect?.(type);
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Components</h3>
      {COMPONENT_LIST.map(ct => (
        <ComponentButton
          key={ct}
          componentType={ct}
          selected={selectedType === ct}
          onClick={handleSelect}
        />
      ))}
    </div>
  );
}
