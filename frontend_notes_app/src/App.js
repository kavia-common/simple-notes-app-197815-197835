import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/Header';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';
import { loadNotesFromStorage, saveNotesToStorage } from './utils/storage';

/**
 * @returns {string}
 */
function createId() {
  // Prefer crypto.randomUUID if available, fall back to a simple unique-ish id.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `note_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * @returns {import('./types/note').Note[]}
 */
function seedNotes() {
  const now = Date.now();
  return [
    {
      id: createId(),
      title: 'Welcome to Simple Notes',
      content:
        'This app stores notes offline in your browser (localStorage).\n\nTry: pinning a note, editing it, or searching for a keyword.',
      createdAt: now - 1000 * 60 * 60 * 6,
      updatedAt: now - 1000 * 60 * 60 * 2,
      pinned: true,
    },
    {
      id: createId(),
      title: 'Quick checklist',
      content: '- Add a new note\n- Edit an existing note\n- Delete with confirmation\n- Search by title/content',
      createdAt: now - 1000 * 60 * 45,
      updatedAt: now - 1000 * 60 * 30,
      pinned: false,
    },
  ];
}

/**
 * @param {import('./types/note').Note[]} notes
 * @returns {import('./types/note').Note[]}
 */
function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    const ap = a.pinned ? 1 : 0;
    const bp = b.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap; // pinned first
    return b.updatedAt - a.updatedAt; // most recently updated first
  });
}

// PUBLIC_INTERFACE
function App() {
  /** Main app entrypoint: manages notes state, persistence, and layout. */
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState('create'); // 'create' | 'edit'
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message: string } | null

  // Hydrate notes on first load (seed if none).
  useEffect(() => {
    const stored = loadNotesFromStorage();
    if (stored && stored.length) {
      const sorted = sortNotes(stored);
      setNotes(sorted);
      setSelectedId(sorted[0]?.id ?? null);
    } else {
      const seeded = seedNotes();
      const sorted = sortNotes(seeded);
      setNotes(sorted);
      setSelectedId(sorted[0]?.id ?? null);
      saveNotesToStorage(sorted);
    }
  }, []);

  // Persist on any notes change.
  useEffect(() => {
    if (!notes) return;
    saveNotesToStorage(notes);
  }, [notes]);

  // Subtle feedback (auto-dismiss).
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const activeNote = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;

    return notes.filter((n) => {
      const hay = `${n.title}\n${n.content}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notes, searchQuery]);

  // Keep selection sane if it gets filtered out or deleted.
  useEffect(() => {
    if (!selectedId) return;
    const stillExists = notes.some((n) => n.id === selectedId);
    if (!stillExists) {
      setSelectedId(notes[0]?.id ?? null);
      setMode('create');
    }
  }, [notes, selectedId]);

  // PUBLIC_INTERFACE
  const handleCreateNew = () => {
    /** Switches form into "create" mode and clears selection. */
    setMode('create');
    setSelectedId(null);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setMode('edit');
  };

  const handleEdit = (id) => {
    setSelectedId(id);
    setMode('edit');
  };

  const handleDelete = (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    // Confirmation as requested.
    const ok = window.confirm(`Delete "${note.title}"? This cannot be undone.`);
    if (!ok) return;

    setNotes((prev) => sortNotes(prev.filter((n) => n.id !== id)));
    setToast({ type: 'info', message: 'Note deleted.' });
  };

  const handleTogglePin = (id) => {
    setNotes((prev) =>
      sortNotes(
        prev.map((n) =>
          n.id === id
            ? { ...n, pinned: !n.pinned, updatedAt: Date.now() }
            : n
        )
      )
    );
  };

  const handleSave = ({ title, content }) => {
    if (mode === 'edit' && activeNote) {
      setNotes((prev) =>
        sortNotes(
          prev.map((n) =>
            n.id === activeNote.id
              ? { ...n, title, content, updatedAt: Date.now() }
              : n
          )
        )
      );
      setToast({ type: 'success', message: 'Note updated.' });
      return;
    }

    const now = Date.now();
    const newNote = {
      id: createId(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };

    setNotes((prev) => sortNotes([newNote, ...prev]));
    setSelectedId(newNote.id);
    setMode('edit');
    setToast({ type: 'success', message: 'Note created.' });
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      // If editing an existing note, cancel returns to view/edit unchanged (no state change needed).
      setToast({ type: 'info', message: 'Changes not saved.' });
      return;
    }

    // If creating, clear the form via switching mode momentarily by resetting selection.
    setToast({ type: 'info', message: 'Cleared.' });
  };

  return (
    <div className="AppShell">
      <Header searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />

      <main className="Main" aria-label="Notes application">
        <section className="Column ColumnLeft" aria-label="Notes list section">
          <div className="Toolbar">
            <div className="ToolbarLeft">
              <div className="CountPill" aria-label={`${filteredNotes.length} notes`}>
                {filteredNotes.length} note{filteredNotes.length === 1 ? '' : 's'}
              </div>
              {searchQuery.trim() ? (
                <div className="SearchPill" aria-label="Search active">
                  Filtering
                </div>
              ) : null}
            </div>

            <div className="ToolbarRight">
              <button type="button" className="Btn BtnPrimary" onClick={handleCreateNew}>
                New note
              </button>
            </div>
          </div>

          <NotesList
            notes={filteredNotes}
            selectedId={selectedId}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
          />
        </section>

        <section className="Column ColumnRight" aria-label="Editor section">
          <NoteForm
            mode={mode === 'edit' && activeNote ? 'edit' : 'create'}
            activeNote={mode === 'edit' ? activeNote : null}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </section>
      </main>

      {toast ? (
        <div className={`Toast Toast-${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

export default App;
