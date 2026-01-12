import React, { useEffect, useMemo, useState } from 'react';
import styles from './NoteForm.module.css';

function nowLabel(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// PUBLIC_INTERFACE
export default function NoteForm({
  mode, // 'create' | 'edit'
  activeNote,
  onSave,
  onCancel,
}) {
  /** Controlled form for creating or editing a note. */
  const isEdit = mode === 'edit';
  const initialTitle = isEdit && activeNote ? activeNote.title : '';
  const initialContent = isEdit && activeNote ? activeNote.content : '';

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id, mode]);

  const titleError = useMemo(() => {
    if (!touched) return '';
    if (!title.trim()) return 'Title is required.';
    return '';
  }, [title, touched]);

  const canSave = title.trim().length > 0;

  return (
    <section className={styles.panel} aria-label={isEdit ? 'Edit note' : 'Create note'}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>{isEdit ? 'Edit note' : 'New note'}</h2>
          <div className={styles.meta}>
            <span className={styles.metaItem}>Created: {nowLabel(activeNote?.createdAt)}</span>
            <span className={styles.metaDot} aria-hidden="true">•</span>
            <span className={styles.metaItem}>Updated: {nowLabel(activeNote?.updatedAt)}</span>
          </div>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (!canSave) return;

          onSave({
            title: title.trim(),
            content: content,
          });
        }}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Title <span className={styles.required} aria-hidden="true">*</span>
          </label>
          <input
            id="title"
            className={`${styles.input} ${titleError ? styles.inputError : ''}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g., Grocery list"
            maxLength={120}
          />
          {titleError ? <div className={styles.errorText} role="alert">{titleError}</div> : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something…"
            rows={10}
          />
          <div className={styles.hint}>Tip: You can keep this empty and fill it later.</div>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={!canSave}
          >
            Save
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onCancel}
          >
            {isEdit ? 'Cancel' : 'Clear'}
          </button>
        </div>

        {!isEdit ? (
          <div className={styles.footerNote}>
            Notes are saved locally to your browser.
          </div>
        ) : null}
      </form>
    </section>
  );
}
