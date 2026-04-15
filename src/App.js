import { useEffect, useMemo, useState } from 'react';
import styles from './App.module.css';

import { CreateGroupModal } from './components/CreateGroupModal/CreateGroupModal';
import { NotesPane } from './components/NotesPane/NotesPane';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ToastProvider, useToast } from './components/Toast/ToastProvider';
import { readAppState, writeAppState } from './storage/appStorage';
import { AppLoader } from './components/AppLoader/AppLoader';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpointPx}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    function onChange(e) {
      setIsMobile(e.matches);
    }
    mq.addEventListener?.('change', onChange);
    mq.addListener?.(onChange);
    setIsMobile(mq.matches);
    return () => {
      mq.removeEventListener?.('change', onChange);
      mq.removeListener?.(onChange);
    };
  }, [breakpointPx]);

  return isMobile;
}

function AppInner() {
  const [isHydrating, setIsHydrating] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [notesByGroupId, setNotesByGroupId] = useState({});
  const [activeGroupId, setActiveGroupId] = useState(null);
  const toast = useToast();
  const isMobile = useIsMobile(768);
  const [mobileView, setMobileView] = useState('sidebar'); // 'sidebar' | 'notes'
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const { groups: storedGroups, notesByGroupId: storedNotes, activeGroupId: storedActive } =
      readAppState();
    setGroups(storedGroups);
    setNotesByGroupId(storedNotes);
    const resolvedActive =
      storedActive && storedGroups.some((g) => g.id === storedActive)
        ? storedActive
        : storedGroups[0]?.id ?? null;
    setActiveGroupId(resolvedActive);
    window.setTimeout(() => setIsHydrating(false), 250);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    setMobileView(activeGroupId ? 'notes' : 'sidebar');
  }, [isMobile, activeGroupId]);

  useEffect(() => {
    if (isHydrating) return;
    writeAppState({ groups, notesByGroupId, activeGroupId });
  }, [groups, notesByGroupId, activeGroupId, isHydrating]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId]
  );

  const activeNotes = useMemo(
    () => (activeGroupId ? notesByGroupId[activeGroupId] ?? [] : []),
    [notesByGroupId, activeGroupId]
  );

  function handleSelectGroup(id) {
    setActiveGroupId(id);
    if (isMobile) setMobileView('notes');
  }

  function handleDeleteGroup(groupId) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    setConfirmState({
      type: 'delete-one',
      title: 'Delete group?',
      message: `Delete "${group.name}"? This will delete its notes too.`,
      confirmText: 'Delete',
      groupId,
    });
  }

  function handleDeleteAllGroups() {
    if (groups.length === 0) return;
    setConfirmState({
      type: 'delete-all',
      title: 'Delete all groups?',
      message: 'This will delete all groups and all notes.',
      confirmText: 'Delete all',
    });
  }

  function closeConfirm() {
    setConfirmState(null);
  }

  function confirmDelete() {
    if (!confirmState) return;

    if (confirmState.type === 'delete-one') {
      const { groupId } = confirmState;
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setNotesByGroupId((prev) => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });
      setActiveGroupId((prevActive) => {
        if (prevActive !== groupId) return prevActive;
        const remaining = groups.filter((g) => g.id !== groupId);
        return remaining[0]?.id ?? null;
      });
      toast.success('Group deleted');
    }

    if (confirmState.type === 'delete-all') {
      setGroups([]);
      setNotesByGroupId({});
      setActiveGroupId(null);
      if (isMobile) setMobileView('sidebar');
      toast.success('All groups deleted');
    }

    closeConfirm();
  }

  function handleCreateGroup({ name, color }) {
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const duplicate = groups.some(
      (g) => g.name.trim().toLowerCase() === normalizedName.toLowerCase()
    );
    if (duplicate) {
      toast.error('Group already exists');
      return;
    }

    const now = new Date().toISOString();
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const newGroup = {
      id,
      name: normalizedName,
      color,
      createdAt: now,
      updatedAt: now,
    };

    setGroups((prev) => [newGroup, ...prev]);
    setActiveGroupId(id);
    setIsCreateGroupOpen(false);
    if (isMobile) setMobileView('notes');
    toast.success('Group created');
  }

  function handleAddNote(text) {
    if (!activeGroupId) return;
    const content = text.trim();
    if (!content) return;

    const now = new Date().toISOString();
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const newNote = {
      id,
      content,
      createdAt: now,
      updatedAt: now,
    };

    setNotesByGroupId((prev) => ({
      ...prev,
      [activeGroupId]: [newNote, ...(prev[activeGroupId] ?? [])],
    }));
    setGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId ? { ...g, updatedAt: now } : g
      )
    );
  }

  return (
    <div className={styles.app}>
      {isHydrating ? <AppLoader /> : null}
      {(!isMobile || mobileView === 'sidebar') && (
        <Sidebar
          groups={groups}
          activeGroupId={activeGroupId}
          onSelectGroup={handleSelectGroup}
          onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
          onDeleteGroup={handleDeleteGroup}
          onDeleteAllGroups={handleDeleteAllGroups}
        />
      )}

      {(!isMobile || mobileView === 'notes') && (
        <NotesPane
          activeGroup={activeGroup}
          notes={activeNotes}
          onAddNote={handleAddNote}
          showBack={isMobile}
          onBack={() => setMobileView('sidebar')}
        />
      )}

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreate={handleCreateGroup}
      />

      <Dialog open={Boolean(confirmState)} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>{confirmState?.title ?? ''}</DialogTitle>
        <DialogContent>
          <div style={{ color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}>
            {confirmState?.message ?? ''}
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeConfirm} variant="outlined">
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            {confirmState?.confirmText ?? 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

export default App;
