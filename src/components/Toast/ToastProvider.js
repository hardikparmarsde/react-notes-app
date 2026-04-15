import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import styles from './ToastProvider.module.css';

const ToastContext = createContext(null);

function Toast({ toast, onClose }) {
  return (
    <div className={`${styles.toast} ${styles[toast.type] ?? ''}`} role="status">
      <div className={styles.message}>{toast.message}</div>
      <button type="button" className={styles.close} onClick={() => onClose(toast.id)}>
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (type, message) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next = { id, type, message };
      setToasts((prev) => [...prev, next]);
      window.setTimeout(() => removeToast(id), 2000);
    },
    [removeToast]
  );

  const api = useMemo(
    () => ({
      success: (msg) => pushToast('success', msg),
      error: (msg) => pushToast('error', msg),
      info: (msg) => pushToast('info', msg),
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.container} aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}

