# Architecture overview

## What mapy-apps is

`mapy-apps` is a single Git repository that hosts several **independent** applications. It is a monorepo only in the literal sense — one repo — not in the tooling sense. There is no npm/yarn/pnpm workspace, no shared `tsconfig`, no shared UI kit, no shared build pipeline, and no shared dependency graph. Each app is a poly-repo project that happens to live in the same repo for organizational convenience.

This is intentional: apps in this repo do and will use different stacks entirely (e.g. React/Express, Next.js, Laravel/Vue, Nuxt, Flutter Web). Any shared abstraction would force a lowest-common-denominator on projects that have nothing in common technically.

## Why one repo instead of many

- Single place to browse everything under `mapyapps.com`.
- Simple onboarding: clone once, `cd` into the app you need.
- No cross-repo tooling (submodules, meta-repos) required.

The cost of this choice — every app must be fully self-contained and CI/CD must be path-scoped so apps don't trigger each other — is documented in [deployment-strategy.md](deployment-strategy.md).

## Deployment model

```
                     https://www.mapyapps.com
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
magizhthunnu.mapyapps.com   <app-2>.mapyapps.com   <app-3>.mapyapps.com
   (magizhthunnu/)              (app-2/)                (app-3/)
```

Each subdomain maps to exactly one app folder. Each app is built, tested, and deployed independently of every other app in the repo (see [deployment-strategy.md](deployment-strategy.md)).

## Folder shape

```
mapy-apps/
├── README.md, CLAUDE.md, .gitignore   # monorepo-level only, never app content
├── .github/workflows/                 # one CI + one CD file per app (GitHub requires root-level workflows)
├── docs/                              # this folder — repo-wide conventions only
└── <app-name>/                        # one folder per app, fully self-contained
```

See [repository-structure.md](repository-structure.md) for the full breakdown.
