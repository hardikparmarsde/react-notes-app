import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './CreateGroupModal.module.css';
import { useToast } from '../Toast/ToastProvider';

const COLORS = ['#B38BFA', '#FF79F2', '#43E6FC', '#F19576', '#0047FF', '#6691FF'];

export function CreateGroupModal({ isOpen, onClose, onCreate }) {
  const backdropRef = useRef(null);
  const inputRef = useRef(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const toast = useToast();

  const canCreate = useMemo(() => name.trim().length > 0 && Boolean(color), [name, color]);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setColor(COLORS[0]);
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && canCreate) handleCreate();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, canCreate, onClose]);

  if (!isOpen) return null;

  function handleBackdropMouseDown(e) {
    if (e.target === backdropRef.current) onClose();
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Please enter a group name');
      return;
    }
    if (!color) {
      toast.error('Please select a color');
      return;
    }
    onCreate({ name: trimmed, color });
  }

  return (
    <div
      className={styles.backdrop}
      ref={backdropRef}
      onMouseDown={handleBackdropMouseDown}
      role="presentation"
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Create group">
        <div className={styles.title}>Create New group</div>

        <div className={styles.row}>
          <div className={styles.label}>Group Name</div>
          <input
            ref={inputRef}
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.label}>Choose colour</div>
          <div className={styles.colors}>
            {COLORS.map((c) => {
              const selected = c === color;
              return (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorDot} ${selected ? styles.selected : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                />
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={!canCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

