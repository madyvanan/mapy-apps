# Repository structure

```
mapy-apps/
│
├── README.md              # monorepo index: app list, subdomains, links to docs/
├── CLAUDE.md               # working rules for AI assistants at the monorepo level
├── .gitignore              # root-level safety net (OS/editor junk + generic patterns)
│
├── .github/
│   └── workflows/
│       ├── magizhthunnu-ci.yml    # one CI file per app, path-filtered to that app's folder
│       └── magizhthunnu-cd.yml    # one CD file per app, path-filtered to that app's folder
│
├── docs/                   # THIS folder — monorepo-wide docs only, never app-specific
│   ├── architecture-overview.md
│   ├── repository-structure.md
│   ├── development-workflow.md
│   ├── deployment-strategy.md
│   ├── adding-a-new-project.md
│   └── coding-standards-and-naming-conventions.md
│
└── magizhthunnu/            # one app, fully self-contained
    ├── README.md
    ├── CLAUDE.md
    ├── .gitignore
    ├── docker-compose.yml, nginx.conf
    ├── scripts/
    ├── docs/                # app-specific docs (system design, etc.) — not this docs/
    ├── frontend/
    └── backend/
```

## What's allowed at the repo root

Only these things belong directly under `mapy-apps/`:

- `README.md`, `CLAUDE.md`, `.gitignore` — monorepo-level metadata.
- `docs/` — conventions and processes that apply across every app, never a specific app's design docs.
- `.github/workflows/` — required by GitHub Actions to live at the repo root; each file is scoped to one app via a `paths` filter (see [deployment-strategy.md](deployment-strategy.md)).
- One folder per app.

Nothing else. No shared `src/`, no shared `package.json`, no shared `tsconfig.json`, no shared `node_modules/`.

## What every app folder should contain

Each app folder is a complete, independently-runnable project:

- `README.md` — setup, prerequisites, how to run/build/test this specific app.
- `CLAUDE.md` — this app's own stack, conventions, and rules (does not apply to sibling apps).
- `docs/` — this app's own design/architecture docs.
- `scripts/` — one-off or maintenance scripts specific to this app.
- Its own package manager files (`package.json`, `composer.json`, `pubspec.yaml`, etc.), lint config, formatter config, and `.gitignore`.
- Its own `.env` files (never committed).

An app may have any internal layout appropriate to its stack (e.g. `frontend/` + `backend/` for magizhthunnu, or a single root for a Next.js app) — the monorepo does not prescribe internals, only the top-level contract above.
