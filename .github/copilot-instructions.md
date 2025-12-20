# Copilot Instructions for AI Agents

## Project Overview
- **Stack:** React + TypeScript + Vite, using Tailwind CSS for styling.
- **Structure:**
  - `src/` contains all source code, with `components/` for UI, `pages/` for route-level views, and `assets/` for static resources.
  - `public/` holds static files, including subfolders for `rooms/` and `villas/` with Arabic-named directories for unit details.
  - Admin and dashboard features are in `src/pages/dashboard/`.

## Key Patterns & Conventions
- **Component Organization:**
  - Reusable UI in `components/`, route logic in `pages/`.
  - Room and villa details are handled by `RoomCard.tsx`, `VillaDetails.tsx`, etc.
- **Routing:**
  - Page components in `pages/` are mapped to routes.
- **State & Data:**
  - Firebase integration in `src/firebase.ts`.
  - Data upload scripts in `src/scripts/` (see `uploadRooms.ts`).
- **Styling:**
  - Tailwind CSS is configured via `tailwind.config.js` and `postcss.config.cjs`.

## Developer Workflows
- **Development:**
  - Start dev server: `npm run dev`
  - Build for production: `npm run build`
  - Preview build: `npm run preview`
- **Linting:**
  - ESLint config in `eslint.config.js` (see README for type-aware rules).
- **Type Checking:**
  - TypeScript configs: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.

## Integration Points
- **Firebase:**
  - All backend/data logic is in `src/firebase.ts`.
  - Collections used by UI: `rooms`, `villas`, and optional `bookings` (if present, search will exclude overlapping `unitId` bookings). See `src/pages/SearchResults.tsx` for the filtering pattern.
- **Search service & UX:**
  - There is a new `src/components/FancySearch.tsx` component that provides a hotel-style search UI: text autocomplete, date range, guests, type (room/villa/all), and price hints.
  - Search navigation populates `/search` query params (e.g., `?checkIn=2025-12-25&checkOut=2025-12-28&guests=2&type=all&q=sea`). The results page (`src/pages/SearchResults.tsx`) applies all filters client-side and attempts to exclude overlapping bookings when `bookings` exist.
- **Static Data:**
  - Room/villa images and info are in `public/rooms/` and `public/villas/`.

## Project-Specific Notes
- **Arabic Support:**
  - Many directories and files use Arabic names—handle with care in scripts and UI.
- **Admin Features:**
  - Admin and dashboard management in `src/pages/dashboard/`.
- **Scripts:**
  - Use scripts in `src/scripts/` for bulk data operations.

## Examples
- To add a new room type, create a folder in `public/rooms/`, add images, and update relevant components in `src/pages/Rooms.tsx` and `src/components/RoomCard.tsx`.
- For new admin features, add pages/components under `src/pages/dashboard/`.

---
For more details, see [README.md](../README.md) and configs in the project root.
