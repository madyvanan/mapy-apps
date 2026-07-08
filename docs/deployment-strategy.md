# Deployment strategy

## Why CI/CD files live at the repo root

GitHub Actions only discovers workflow files under the repository root's `.github/workflows/` — it does not read `.github/workflows/` inside subfolders. Since every app needs its own pipeline, all workflow files live at `mapy-apps/.github/workflows/`, one CI and one CD file per app, named with an app prefix (`<app>-ci.yml`, `<app>-cd.yml`) so they never collide.

This is the one place the monorepo structure "reaches into" an app folder from outside it. It does not create coupling: each workflow file is fully independent — its own steps, its own secrets, its own triggers — and is scoped with a `paths` filter so it only ever runs for changes inside its own app folder.

```yaml
on:
  push:
    branches: ['**']
    paths: ['magizhthunnu/**']   # <- only fires on changes to this app
```

## Per-app deployment

Each app deploys independently to its own subdomain, using whatever hosting fits its stack. For magizhthunnu today: frontend → Vercel, backend → Render, both triggered only by changes under `magizhthunnu/**` (see `magizhthunnu-cd.yml`).

A future app with a different stack (say, a Laravel app) would get its own `<app>-cd.yml` deploying to whatever host suits it (e.g. a VM or a PHP-friendly platform) — nothing about magizhthunnu's pipeline needs to change or be reused.

## Adding deployment for a new app

1. Create `<app>-ci.yml` and `<app>-cd.yml` under `mapy-apps/.github/workflows/`.
2. Set `paths: ['<app>/**']` on every trigger in both files.
3. Set every `working-directory` / `cache-dependency-path` (or stack equivalent) to start with `<app>/`.
4. Add that app's deploy secrets to the repo's GitHub Actions secrets, prefixed if there's any risk of collision with another app's secret names.
5. Point the new subdomain (`<app>.mapyapps.com`) at whatever host the CD job deploys to.

## Secrets

Secrets are still stored once at the repo/organization level in GitHub, but each app's workflow only references the secrets it needs. There is no shared secret bundle — if two apps need "the same" secret value, they should each hold their own copy under their own name.
