# Coding standards & naming conventions

These are the only conventions that apply *across* apps in this repo. They are structural/organizational, not a shared code style guide — each app's actual coding standards, linting rules, and formatting are defined inside that app's own config and `CLAUDE.md`, and may differ freely between apps.

## Naming

- App folder names are lowercase-kebab-case and match the app's subdomain exactly: `magizhthunnu/` → `magizhthunnu.mapyapps.com`.
- CI/CD workflow files are named `<app-name>-ci.yml` / `<app-name>-cd.yml`.
- Branch names are prefixed with the app: `feature/<app>-...`, `fix/<app>-...`.

## Required contents of every app folder

- `README.md` — how to set up, run, build, and test this app.
- `CLAUDE.md` — this app's own stack and rules; must not assume anything from a sibling app.
- `docs/` — this app's own design/architecture documentation.
- `scripts/` — this app's own maintenance/one-off scripts.
- Its own environment file examples (`.env.example`), never the real `.env`.
- Its own `.gitignore`, in addition to (not instead of) the root's safety-net `.gitignore`.

## Isolation rules

- No cross-app imports, ever — not even "just this one utility."
- No shared `node_modules`, no shared lockfiles, no shared build artifacts.
- No dependency version needs to match across apps. Each app pins its own.
- If two apps happen to solve the same small problem the same way, that's an acceptable duplication — do not extract a shared package for it.

## Documentation placement

- Anything specific to one app → that app's own `docs/`.
- Anything about how the monorepo itself is organized, deployed, or extended → `mapy-apps/docs/` (this folder).
- Never mix the two: this `docs/` folder should never contain content specific to a single app.
