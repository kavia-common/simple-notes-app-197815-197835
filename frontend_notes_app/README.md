# Simple Notes (React)

A lightweight, browser-based notes app built with React. All data is stored locally in your browser using `localStorage` (no backend required).

## Features

- Add notes (title + content)
- Edit notes
- Delete notes (with confirmation)
- Search notes by title/content
- Persist notes in `localStorage`
- Pin notes (pinned notes appear first)
- Seed sample notes on first run

## Data storage

Notes are stored in the browser at:

- `localStorage` key: `notes.v1`

If you clear site data / localStorage in your browser, notes will be removed.

## Run locally

From `frontend_notes_app/`:

```bash
npm install
npm start
```

Open http://localhost:3000
