
# mapy-apps

A monorepo that hosts multiple **independent** applications, each with its own tech stack, its own dependencies, and its own deployment pipeline. Grouping them here is purely organizational — under `https://www.mapyapps.com` and its subdomains — not architectural. No code, config, or dependency is ever shared between apps.

## Apps

| App | Stack | Subdomain | Path |
|---|---|---|---|
| magizhthunnu | React 18 (Vite) + Node/Express + MongoDB + Paytm | `magizhthunnu.mapyapps.com` | [`magizhthunnu/`](magizhthunnu/) |

New apps are added the same way regardless of stack — see [`docs/adding-a-new-project.md`](docs/adding-a-new-project.md).

## Repo-wide docs

- [Architecture overview](docs/architecture-overview.md)
- [Repository structure](docs/repository-structure.md)
- [Development workflow](docs/development-workflow.md)
- [Deployment strategy](docs/deployment-strategy.md)
- [Adding a new project](docs/adding-a-new-project.md)
- [Coding standards & naming conventions](docs/coding-standards-and-naming-conventions.md)

Everything else — architecture, tech choices, build process, testing — is documented inside each app's own `README.md`, `CLAUDE.md`, and `docs/` folder. This root README never grows app-specific content.
