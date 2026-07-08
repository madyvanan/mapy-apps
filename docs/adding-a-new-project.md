# Adding a new project

These steps work regardless of the new app's tech stack — Next.js, Laravel + Vue, Nuxt, Flutter Web, or anything else.

1. **Create the app folder** at `mapy-apps/<app-name>/`, using a lowercase-kebab name that matches its intended subdomain (e.g. `magiluunthu/` → `magiluunthu.mapyapps.com`).
2. **Give it a complete, self-contained project**: its own package manager files, its own lint/formatter config, its own `.gitignore`, its own `.env.example`, its own `README.md`, its own `CLAUDE.md`, its own `docs/`, its own `scripts/`. Do not import or reference anything from another app folder or from the monorepo root.
3. **Add CI/CD** at `mapy-apps/.github/workflows/<app-name>-ci.yml` and `<app-name>-cd.yml` (workflows must live at the repo root — see [deployment-strategy.md](deployment-strategy.md)). Scope every trigger with `paths: ['<app-name>/**']` so it never runs for other apps' changes, and never let another app's workflow run for this one.
4. **Register the subdomain** (`<app-name>.mapyapps.com`) with whatever host the new CD job deploys to.
5. **List it in the root README** — add one row to the app table in `mapy-apps/README.md` (name, stack, subdomain, path). Do not add anything else to the root.

## What NOT to do

- Do not add a shared `package.json`, `tsconfig.json`, lint config, or dependency at the monorepo root for the new app to consume.
- Do not import code from an existing app (e.g. `../magizhthunnu/...`) into the new one, even if it seems convenient.
- Do not modify another app's files, workflows, or docs as part of adding a new one.
- Do not assume the new app needs the same internal layout (`frontend/` + `backend/`) as magizhthunnu — pick whatever layout fits its own stack.
