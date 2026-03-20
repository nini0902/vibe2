// T019: ComponentPanel — lists all ComponentType values as ComponentButton items
import { useGameState } from '@hooks/useGameState.tsx'
import { ComponentButton } from './ComponentButton.tsx'
import type { ComponentType } from '@game/types.ts'
import { COMPONENT_LIST, COMPONENT_COSTS } from '@game/constants.ts'
import styles from './ComponentPanel.module.css'

interface ComponentPanelProps {
  onSelect?: (type: ComponentType) => void;
}

export function ComponentPanel({ onSelect }: ComponentPanelProps) {
  const { selectedType, money, dispatch } = useGameState();

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
          cost={COMPONENT_COSTS[ct]}
          affordable={money >= COMPONENT_COSTS[ct]}
          onClick={handleSelect}
        />
      ))}
    </div>
  );
}
