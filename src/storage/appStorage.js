const STORAGE_KEY = 'pocket-notes:v1';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function readAppState() {
  if (typeof window === 'undefined')
    return { groups: [], notesByGroupId: {}, activeGroupId: null };

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { groups: [], notesByGroupId: {}, activeGroupId: null };

  const parsed = safeParse(raw);
  if (!parsed || typeof parsed !== 'object')
    return { groups: [], notesByGroupId: {}, activeGroupId: null };

  const groups = Array.isArray(parsed.groups) ? parsed.groups : [];
  const notesByGroupId =
    parsed.notesByGroupId && typeof parsed.notesByGroupId === 'object'
      ? parsed.notesByGroupId
      : {};

  const activeGroupId =
    typeof parsed.activeGroupId === 'string' ? parsed.activeGroupId : null;

  return { groups, notesByGroupId, activeGroupId };
}

export function writeAppState({ groups, notesByGroupId, activeGroupId }) {
  if (typeof window === 'undefined') return;
  const payload = {
    groups: Array.isArray(groups) ? groups : [],
    notesByGroupId:
      notesByGroupId && typeof notesByGroupId === 'object' ? notesByGroupId : {},
    activeGroupId: typeof activeGroupId === 'string' ? activeGroupId : null,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

