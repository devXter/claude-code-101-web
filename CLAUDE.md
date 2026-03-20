# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page React 19 presentation website for the "Claude Code 101" workshop (Accenture Chile, JavaScript Chapter). Built with Vite, no CSS framework — all styling is inline via JSX `style` props and a `<style>` block inside the App component.

## Commands

- `npm run dev` — Start Vite dev server (localhost:5173)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally

No tests configured.

## Architecture

The entire app lives in `src/App.jsx` (~1145 lines). This is intentional — it's a self-contained presentation, not a growing application.

**Key structures in App.jsx:**
- `C` object — color palette constants used across all components
- `CMDS` object — placeholder terminal commands shown in the guide section
- `nav` array — 18 section definitions (`{ id, label }`) that drive navigation dots, keyboard nav, and IntersectionObserver tracking
- `useInView` hook — custom IntersectionObserver hook for scroll-triggered fade-in animations
- `App` component — orchestrates all sections, manages `active` section state with refs (`targetRef`, `isScrolling`) to prevent race conditions between smooth scroll and the observer

**Navigation system:** Arrow keys and dot navigation use `targetRef` (not the `active` state) to determine current position. An `isScrolling` flag blocks the observer during programmatic smooth scrolls (~800ms) to prevent section skipping.

## Git

- Never include `Co-Authored-By` lines in commit messages

## Conventions

- Language: Spanish (content and UI labels)
- Styling: Inline styles only. No CSS files. Google Fonts loaded via `@import` in JSX `<style>` block
- No TypeScript — pure JSX
- Zero external dependencies beyond React and ReactDOM
