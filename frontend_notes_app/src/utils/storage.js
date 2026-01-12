import { NOTES_STORAGE_KEY } from '../types/note';

/**
 * Safely parses JSON, returning null on error.
 * @param {string} value
 * @returns {any|null}
 */
function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

/**
 * @param {any} value
 * @returns {string|null}
 */
function safeJsonStringify(value) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    return null;
  }
}

// PUBLIC_INTERFACE
export function loadNotesFromStorage() {
  /** Loads notes array from localStorage (or returns null if missing/invalid). */
  const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
  if (!raw) return null;

  const parsed = safeJsonParse(raw);
  if (!Array.isArray(parsed)) return null;

  // Light validation to avoid runtime issues if storage is corrupted.
  const sanitized = parsed
    .filter((n) => n && typeof n === 'object')
    .map((n) => ({
      id: typeof n.id === 'string' ? n.id : '',
      title: typeof n.title === 'string' ? n.title : '',
      content: typeof n.content === 'string' ? n.content : '',
      createdAt: typeof n.createdAt === 'number' ? n.createdAt : Date.now(),
      updatedAt: typeof n.updatedAt === 'number' ? n.updatedAt : Date.now(),
      pinned: Boolean(n.pinned),
    }))
    .filter((n) => n.id && n.title);

  return sanitized;
}

// PUBLIC_INTERFACE
export function saveNotesToStorage(notes) {
  /** Saves notes array to localStorage. */
  const json = safeJsonStringify(notes);
  if (json === null) return;
  window.localStorage.setItem(NOTES_STORAGE_KEY, json);
}
