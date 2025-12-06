# Repository Guidelines

## Project Structure & Module Organization

- Next.js 15 App Router with TypeScript; routes live in `app/` (landing, teacher builder/classroom, student portal, classroom dashboard).
- Shared UI in `components/` (`builder`, `nodes`, `student`, `classroom`, `ui`); shared state and hooks in `contexts/` and `hooks/`.
- Domain logic and constants in `lib/` (types, constants, engine); static assets in `public/`; global styles and tokens in `styles/`.
- Key configuration files: `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `components.json`.

## Build, Test, and Development Commands

- `npm install --legacy-peer-deps` to install dependencies.
- `npm run dev` starts the dev server on port 3000; `npm run start` serves the production build.
- `npm run build` produces the optimized production bundle.
- `npm run lint` runs `next lint` (ESLint + TypeScript rules); fix or justify any warnings before merging.

## Coding Style & Naming Conventions

- Follow existing formatting (Prettier/Next defaults): 2-space indent, double quotes, trailing commas, and no semicolons.
- React components are TypeScript-first; default to server components and add `"use client"` only when hooks or browser APIs are needed.
- File names stay kebab-case; components/types/interfaces are PascalCase; functions and variables use camelCase.
- Favor Tailwind for styling; use `clsx`/`cva` utilities for variants and keep class lists grouped logically (layout → spacing → color → state).

## Testing Guidelines

- Automated tests are not yet configured; rely on linting and manual walkthroughs of affected routes before submitting.
- When adding tests, co-locate `*.test.ts(x)` files with the code under test; prefer React Testing Library/Playwright patterns and mock external data.
- For UI changes, include before/after screenshots or a short GIF/Loom in the PR to document behavior.

## Commit & Pull Request Guidelines

- Write short, imperative commit subjects (e.g., `Add ESL node palette filters`); keep commits scoped to one concern.
- PRs should include a concise summary of changes, rationale, and user impact; link any related issues/tasks.
- Call out configuration/migration steps and update docs (`README.md`, `IMPLEMENTATION_STATUS.md`) when behavior shifts.
- Keep PRs small and focused; note deferred work in a checklist instead of bundling it.

## Security & Configuration

- Never commit secrets; place runtime values in `.env.local` and read them via `process.env`.
- Review new dependencies for license/size impact; prefer well-maintained libraries already in use when adding features.
- AI SDK setup: set `AI_OPENAI_API_KEY` (required) plus optional `AI_DEFAULT_MODEL`/`AI_DEFAULT_TEMPERATURE` before running AI nodes; fall back to mock behavior if keys are absent.
