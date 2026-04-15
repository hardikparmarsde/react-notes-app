import { useMemo, useState } from 'react';
import styles from './NotesPane.module.css';
import { getGroupInitials } from '../../utils/groupInitials';
import { formatDateTime } from '../../utils/formatDateTime';

function LockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4V7Zm7 12H7v-8h10v8Z"
      />
    </svg>
  );
}

function SendIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"
      />
    </svg>
  );
}

function BackIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 11H7.83l5.58-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"
      />
    </svg>
  );
}

export function NotesPane({
  activeGroup,
  notes,
  onAddNote,
  showBack = false,
  onBack,
}) {
  const [draft, setDraft] = useState('');

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  function handleSend() {
    if (!canSend) return;
    onAddNote(draft);
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!activeGroup) {
    return (
      <main className={styles.empty}>
        <div className={styles.illustrationWrap} aria-hidden="true">
          <img
            className={styles.illustrationImg}
            src="/home-illustration.svg"
            alt=""
            draggable="false"
          />
        </div>
        <div className={styles.title}>Pocket Notes</div>
        <div className={styles.subtitle}>
          Send and receive messages without keeping your phone online.
          <br />
          Use Pocket Notes on up to 4 linked devices and 1 mobile phone
        </div>
        <div className={styles.footer}>
          <LockIcon className={styles.lock} />
          end-to-end encrypted
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pane}>
      <div className={styles.topBar}>
        {showBack ? (
          <button type="button" className={styles.backBtn} onClick={onBack} aria-label="Back">
            <BackIcon className={styles.backIcon} />
          </button>
        ) : null}
        <div
          className={styles.avatar}
          style={{ backgroundColor: activeGroup.color }}
          aria-hidden="true"
        >
          {getGroupInitials(activeGroup.name)}
        </div>
        <div className={styles.groupName}>{activeGroup.name}</div>
      </div>

      <div className={styles.notesList}>
        {notes.map((note) => (
          <div key={note.id} className={styles.noteCard}>
            <div className={styles.noteText}>{note.content}</div>
            <div className={styles.noteMeta}>
              <span>{formatDateTime(note.updatedAt || note.createdAt).date}</span>
              <span className={styles.dot} aria-hidden="true">
                •
              </span>
              <span>{formatDateTime(note.updatedAt || note.createdAt).time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.composer}>
        <div className={styles.composerInner}>
          <textarea
            className={styles.textarea}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your text here.........."
          />
          <button
            type="button"
            className={`${styles.sendBtn} ${canSend ? styles.sendActive : ''}`}
            onClick={handleSend}
            aria-label="Send note"
            disabled={!canSend}
          >
            <SendIcon className={styles.sendIcon} />
          </button>
        </div>
      </div>
    </main>
  );
}

