# mapy-apps monorepo

This repository hosts multiple independent applications under one Git repo. Each top-level folder (other than `docs/`) is a separate app with its own stack, its own dependencies, and its own `CLAUDE.md`.

## Rules for working here

- Never assume one app's stack, conventions, or dependencies apply to another. Read the target app's own `CLAUDE.md` before working in it.
- Never add shared packages, shared configs, or shared dependencies at this root. If a change seems to require one, stop and ask — it likely means the change belongs inside a single app instead.
- Always `cd` into the specific app folder before running any install/build/test/lint command. There is no root-level package manager.
- One PR / one piece of work touches exactly one app folder, plus optionally `docs/` or this file.

See [`docs/`](docs/) for repo-wide conventions (naming, adding a new app, deployment strategy). See each app's own `README.md`/`CLAUDE.md`/`docs/` for everything about that app.
