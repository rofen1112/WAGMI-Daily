# Data layout

This project keeps public data and local admin data separate.

## `data/dev`

Local administrator workspace.

- Can contain SQLite databases, raw fetch outputs, temporary candidate files, and update-strategy working data.
- Ignored by Git except `.gitkeep`.
- Must not be exposed through public preview or tunnels.

## `data/main`

Curated main-track source data.

- Use this for reviewed snapshots that are safe to publish.
- Public builds should consume only reviewed main-track data.

## `public/data/main`

Public static snapshots.

- Files here are copied into `dist/` by Vite.
- Only place visitor-safe JSON/HTML/Markdown here.
- Do not put local databases or private raw fetch output here.
