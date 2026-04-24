# Parallel Selves

Parallel Selves is a static React prototype for exploring identity-driven matching. It presents a polished, dashboard-style experience where you can sign in, browse personas, inspect compatibility matches, view a relationship graph, and review drift over time.

## What it includes

- Login and registration screens with an animated atmospheric backdrop.
- A dashboard with persona cards, top matches, and summary stats.
- Persona management views for browsing, creating, editing, and deleting selves.
- Match browsing in both ranked and swipe-style modes.
- A compatibility graph that links personas to external matches.
- A drift timeline that tracks how personas evolve over time.
- A tweaks panel for switching theme, accent color, graph animation, and avatar style.

## How to run

This project does not use a build step or package manager. It is a single-page prototype that loads React, ReactDOM, and Babel from public CDNs.

1. Open `Parallel Selves.html` directly in a browser.
2. If your browser blocks local file access, serve the folder with any static server and open the HTML file through that server.

## Project structure

- `Parallel Selves.html` - app shell, CDN imports, and bootstrapping.
- `styles.css` - full visual design and layout styling.
- `src/data.jsx` - seeded personas, matches, drift events, and lookup helpers.
- `src/ui.jsx` - shared UI helpers, icons, toast system, and avatar rendering.
- `src/auth.jsx` - login and registration flows.
- `src/dashboard.jsx` - main dashboard view.
- `src/personas.jsx` - persona list and editor screens.
- `src/matches.jsx` - compatibility dashboard, swipe mode, and AI report drawer.
- `src/graph.jsx` - compatibility graph view.
- `src/drift.jsx` - drift timeline and comparison view.
- `src/tweaks.jsx` - runtime tweak panel wired to the host editor.
- `src/app.jsx` - app router and top-level state.

## Notes

- The app uses in-browser Babel, which is convenient for prototyping but not ideal for production.
- All data is seeded locally in the browser, so the app behaves like a demo rather than a backend-connected product.
- The current persisted state is limited to the selected route and runtime UI tweaks stored in `localStorage`.
