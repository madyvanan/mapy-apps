# Development workflow

## Local development

1. Clone the repo once.
2. `cd` into the app you're working on — e.g. `cd magizhthunnu`.
3. Follow that app's own `README.md` for setup, install, and run instructions. Every command is run from inside the app folder (or its own subfolders, e.g. `magizhthunnu/frontend`).
4. Never run install/build/test/lint commands from the `mapy-apps/` root — there is no root-level package manager or script runner, by design.

## Branching

- `feature/<app>-short-description` (e.g. `feature/magizhthunnu-add-refund-flow`)
- `fix/<app>-short-description`
- The `<app>` prefix makes it obvious from the branch name alone which app a change touches, since a single repo now hosts many apps.

## Pull requests

- One PR touches exactly one app folder (plus optionally this `docs/` folder or the root `README.md`/`CLAUDE.md` when adding/registering a new app).
- Do not bundle changes across two apps in one PR, even if they're small — it breaks the path-scoped CI (see [deployment-strategy.md](deployment-strategy.md)) and makes it unclear which app's release the PR belongs to.
- Squash merge into `main`, matching each app's own git workflow conventions (see that app's `CLAUDE.md`).

## Adding changes that seem "shared"

If you find yourself wanting to add a dependency, config, or utility at the `mapy-apps/` root because two apps could both use it — don't. Duplicate it into each app instead. This repo's explicit design goal is zero coupling between apps; a small amount of duplication is the accepted cost.
