import React from 'react';
import styles from './NotesList.module.css';

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function getPreview(content) {
  const trimmed = (content || '').trim();
  if (!trimmed) return 'No content yet.';
  return trimmed.length > 110 ? `${trimmed.slice(0, 110)}…` : trimmed;
}

// PUBLIC_INTERFACE
export default function NotesList({
  notes,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onTogglePin,
}) {
  /** Renders notes list and note actions. */
  if (!notes.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyTitle}>No notes found</div>
          <div className={styles.emptyText}>
            Create a note using the form on the right, or clear your search.
          </div>
        </div>
      </div>
    );
  }

  return (
    <ul className={styles.list} aria-label="Notes list">
      {notes.map((note) => {
        const isSelected = note.id === selectedId;
        return (
          <li key={note.id} className={styles.item}>
            <button
              type="button"
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => onSelect(note.id)}
              aria-current={isSelected ? 'true' : undefined}
            >
              <div className={styles.cardTop}>
                <div className={styles.titleRow}>
                  <span className={styles.noteTitle}>{note.title}</span>
                  {note.pinned ? <span className={styles.pinnedBadge} aria-label="Pinned note">Pinned</span> : null}
                </div>
                <div className={styles.actions} aria-label={`Actions for ${note.title}`}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note.id);
                    }}
                    aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    {note.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(note.id);
                    }}
                    aria-label="Edit note"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.dangerBtn}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(note.id);
                    }}
                    aria-label="Delete note"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className={styles.preview}>{getPreview(note.content)}</div>

              <div className={styles.meta}>
                <span className={styles.metaItem}>Created: {formatTimestamp(note.createdAt)}</span>
                <span className={styles.metaDot} aria-hidden="true">•</span>
                <span className={styles.metaItem}>Updated: {formatTimestamp(note.updatedAt)}</span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
