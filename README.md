<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/hero-banner?w=880&title=gita&tagline=Author%20once.%20Embed%20anywhere.%20Always%20live.&badge=open%20source&theme=dark" />
  <img alt="gita - dynamic widgets for your GitHub README" src="https://gita.jokelbaf.dev/api/widget/public/hero-banner?w=880&title=gita&tagline=Author%20once.%20Embed%20anywhere.%20Always%20live.&badge=open%20source&theme=light" width="880" />
</picture>

<p align="center">
<a href="https://gita.jokelbaf.dev">Website</a> · <a href="https://gita.jokelbaf.dev/widgets">Widget library</a> · <a href="https://gita.jokelbaf.dev/docs">Docs</a> · <a href="https://gita.jokelbaf.dev/docs/mcp">MCP for AI</a>
</p>

gita is a full-stack platform for authoring, sharing, and serving dynamic widgets for
GitHub READMEs. Write widgets as React components, publish them to a browsable library,
and embed them anywhere with a single image URL - rendered to SVG on demand and
aggressively cached.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/stat-strip?w=880&items=SVG%7CRender%20output%3B%20%3C1s%7CCold%20render%3B%2024h%7CEdge%20cache%3B%20100%25%7CType-safe&theme=dark" />
  <img alt="Highlights" src="https://gita.jokelbaf.dev/api/widget/public/stat-strip?w=880&items=SVG%7CRender%20output%3B%20%3C1s%7CCold%20render%3B%2024h%7CEdge%20cache%3B%20100%25%7CType-safe&theme=light" width="880" />
</picture>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Features&kicker=why%20gita&theme=dark" />
  <img alt="Features" src="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Features&kicker=why%20gita&theme=light" width="880" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/feature-cards?w=880&items=Sandboxed%7CWidget%20code%20runs%20in%20isolated-vm%20with%20strict%20time%20and%20memory%20limits%20-%20no%20network%2C%20no%20filesystem.%3B%20SVG-native%7CAuthored%20in%20React%2C%20laid%20out%20to%20crisp%20SVG%20with%20Satori%2C%20rendered%20on%20demand.%3B%20Cache-first%7CEvery%20image%20is%20aggressively%20cached%20at%20the%20edge%20and%20refreshed%20automatically.&theme=dark" />
  <img alt="Sandboxed, SVG-native, cache-first" src="https://gita.jokelbaf.dev/api/widget/public/feature-cards?w=880&items=Sandboxed%7CWidget%20code%20runs%20in%20isolated-vm%20with%20strict%20time%20and%20memory%20limits%20-%20no%20network%2C%20no%20filesystem.%3B%20SVG-native%7CAuthored%20in%20React%2C%20laid%20out%20to%20crisp%20SVG%20with%20Satori%2C%20rendered%20on%20demand.%3B%20Cache-first%7CEvery%20image%20is%20aggressively%20cached%20at%20the%20edge%20and%20refreshed%20automatically.&theme=light" width="880" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/feature-cards?w=880&items=Live%20data%7CUser%20and%20repo%20widgets%20bind%20to%20GitHub%20and%20render%20live%20profile%20and%20repository%20stats.%3B%20AI-ready%7CA%20REST%20API%20and%20an%20MCP%20server%20let%20an%20AI%20author%20and%20manage%20widgets%20for%20you.%3B%20Composable%7CFork%20any%20public%20widget%2C%20tweak%20it%20in%20the%20editor%2C%20and%20publish%20your%20own%20version.&theme=dark" />
  <img alt="Live data, AI-ready, composable" src="https://gita.jokelbaf.dev/api/widget/public/feature-cards?w=880&items=Live%20data%7CUser%20and%20repo%20widgets%20bind%20to%20GitHub%20and%20render%20live%20profile%20and%20repository%20stats.%3B%20AI-ready%7CA%20REST%20API%20and%20an%20MCP%20server%20let%20an%20AI%20author%20and%20manage%20widgets%20for%20you.%3B%20Composable%7CFork%20any%20public%20widget%2C%20tweak%20it%20in%20the%20editor%2C%20and%20publish%20your%20own%20version.&theme=light" width="880" />
</picture>

**How it works:** a widget is a single React component that returns inline-styled JSX.
It runs in a hardened `isolated-vm` sandbox (no imports, network, or filesystem), is laid
out to SVG with [Satori](https://github.com/vercel/satori), and is served from an image URL
that GitHub embeds directly. Generic widgets are parameterized through the query string;
user and repo widgets bind to a target and render live GitHub data using the owner's own
access token.

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Tech%20Stack&kicker=technologies&theme=dark" />
  <img alt="Features" src="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Features&kicker=technologies&theme=light" width="880" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/tech-chip-row?w=880&items=React%2019%2C%20React%20Router%208%2C%20Vite%208%2C%20TailwindCSS%204%2C%20shadcn%2Fui%2C%20Better%20Auth%2C%20Prisma%207%2C%20Postgres%2C%20Satori%2C%20isolated-vm&theme=dark" />
  <img alt="Tech stack" src="https://gita.jokelbaf.dev/api/widget/public/tech-chip-row?w=880&items=React%2019%2C%20React%20Router%208%2C%20Vite%208%2C%20TailwindCSS%204%2C%20shadcn%2Fui%2C%20Better%20Auth%2C%20Prisma%207%2C%20Postgres%2C%20Satori%2C%20isolated-vm&theme=light" width="880" />
</picture>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Quick%20start&kicker=get%20running&theme=dark" />
  <img alt="Quick start" src="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Quick%20start&kicker=get%20running&theme=light" width="880" />
</picture>

**Prerequisites**

- Node 22.22+ (26 recommended) and `pnpm`
- A **Postgres** database. The default `DATABASE_URL` expects a role/db named `gita` on
  `localhost:5432`:
  ```sql
  CREATE ROLE gita LOGIN PASSWORD 'gita' CREATEDB;
  CREATE DATABASE gita OWNER gita;
  ```
  (`CREATEDB` lets Prisma Migrate create its shadow database.)
- A **Dragonfly** (or Redis) instance for the render + rate-limit cache, reachable at
  `REDIS_URL`:
  ```bash
  docker run -d -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly
  ```

**Install and run**

```bash
pnpm install
cp .env.example .env      # then fill in the values (see Configuration)
pnpm db:migrate           # apply migrations
pnpm db:seed              # seed example users and widgets
pnpm dev                  # http://localhost:1791
```

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Configuration&kicker=environment&theme=dark" />
  <img alt="Configuration" src="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Configuration&kicker=environment&theme=light" width="880" />
</picture>

Configure the app through environment variables. See [`.env.example`](.env.example) for the
full annotated list.

| Variable                            | Purpose                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`                      | Postgres connection string                                  |
| `BETTER_AUTH_SECRET`                | Session secret (`openssl rand -base64 32`)                  |
| `BETTER_AUTH_URL`                   | App base URL (e.g. `http://localhost:1791`)                 |
| `GITHUB_CLIENT_ID` / `..._SECRET`   | GitHub OAuth app credentials (login / identity only)        |
| `CREDENTIAL_ENCRYPTION_KEY`         | 32-byte key encrypting user git tokens at rest (required)   |
| `REDIS_URL`                         | Dragonfly / Redis connection for the render cache           |
| `SEED_GITHUB_TOKEN`                 | Optional token so `db:seed` gives instances live data       |
| `PG_USER` / `PG_PASSWORD` / `PG_DB` | Postgres provisioning for Docker Compose (see Deployment)   |

For GitHub sign-in, create an OAuth app with callback URL
`http://localhost:1791/api/auth/callback/github` and set the client id / secret.

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Scripts&kicker=pnpm&theme=dark" />
  <img alt="Scripts" src="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Scripts&kicker=pnpm&theme=light" width="880" />
</picture>

| Script                                      | Description                              |
| ------------------------------------------- | ---------------------------------------- |
| `pnpm dev` / `build` / `start`              | Dev server / production build / serve    |
| `pnpm typecheck`                            | Route typegen + `tsc`                    |
| `pnpm lint` / `format`                      | ESLint / Prettier                        |
| `pnpm db:migrate` / `db:seed` / `db:studio` | Prisma migrate / seed / studio           |
| `pnpm db:reset`                             | Reset the database and re-run migrations |

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Deployment&kicker=docker%20compose&theme=dark" />
  <img alt="Deployment" src="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Deployment&kicker=docker%20compose&theme=light" width="880" />
</picture>

The production stack runs entirely via Docker Compose. It builds the app image, provisions
Postgres and a Dragonfly cache, applies database migrations, and only then starts the web
server.

1. Set the Compose environment variables in your deployment environment (or via
   `--env-file`). The [`.env.example`](.env.example) file lists all required variables.
2. Build and start all services:
   ```bash
   docker compose up -d --build
   ```
   On first start the `migrate` service runs `prisma migrate deploy` to initialise the
   schema, then exits; the `web` service starts only after migrations complete.
3. The app is served at `http://localhost:1791` (change the host mapping in
   `docker-compose.yml` if needed).

To apply new migrations later, re-run `docker compose up -d --build` - the `migrate`
service runs again before the web server restarts.

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Documentation%20%26%20AI&kicker=build%20with%20it&theme=dark" />
  <img alt="Documentation & AI" src="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=Documentation%20%26%20AI&kicker=build%20with%20it&theme=light" width="880" />
</picture>

- **[Docs](https://gita.jokelbaf.dev/docs)** - embedding, arguments, widget data, authoring,
  and caching.
- **[REST API](https://gita.jokelbaf.dev/docs/api)** - a versioned `/api/v1/*` surface for
  managing widgets and instances with a personal API key.
- **[MCP server](https://gita.jokelbaf.dev/docs/mcp)** - connect an AI agent (Claude Code,
  Claude Desktop, …) so it can author and manage widgets for you:
  ```bash
  claude mcp add --transport http gita https://gita.jokelbaf.dev/api/mcp \
    --header "Authorization: Bearer gita_your_api_key"
  ```

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=License&kicker=gpl-3.0&theme=dark" />
  <img alt="License" src="https://gita.jokelbaf.dev/api/widget/public/section-header-2?w=880&label=License&kicker=gpl-3.0&theme=light" width="880" />
</picture>

Licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE) for details.
