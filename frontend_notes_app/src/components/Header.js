import React from 'react';
import styles from './Header.module.css';

// PUBLIC_INTERFACE
export default function Header({ searchQuery, onSearchQueryChange }) {
  /** Header with title and search input. */
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Simple Notes</h1>
        <p className={styles.subtitle}>Write, search, pin, and keep notes offline.</p>
      </div>

      <div className={styles.right}>
        <label className={styles.searchLabel} htmlFor="search">
          Search notes
        </label>
        <input
          id="search"
          className={styles.searchInput}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search by title or content…"
          autoComplete="off"
        />
      </div>
    </header>
  );
}
