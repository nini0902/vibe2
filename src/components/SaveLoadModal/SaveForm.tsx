// T028: SaveForm — text input for design name and submit button
import { useState } from 'react'
import styles from './SaveLoadModal.module.css'

interface SaveFormProps {
  onSave:   (name: string) => void;
  isSaving: boolean;
}

export function SaveForm({ onSave, isSaving }: SaveFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  return (
    <form className={styles.saveForm} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.nameInput}
        placeholder="Design name (max 50 chars)"
        maxLength={50}
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={isSaving}
      />
      <button
        type="submit"
        className={styles.saveBtn}
        disabled={isSaving || !name.trim()}
      >
        {isSaving ? 'Saving…' : '💾 Save'}
      </button>
    </form>
  );
}
