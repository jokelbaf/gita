# gita

A full-stack platform for creating, sharing, and serving dynamic widgets for
GitHub READMEs. Author widgets as React components, publish them to a browsable
library, and embed them anywhere with a single image URL - rendered to SVG on
demand and aggressively cached.

## Stack

- React 19
- React Router 8 (framework mode, SSR)
- Vite 8
- TailwindCSS 4
- shadcn/ui
- Better Auth (GitHub OAuth)
- Prisma 7 / Postgres
- zod (validation)
- pino (logging)
- pnpm (package manager)

## Prerequisites

- Node 22.22+ (26 recommended) and `pnpm`
- A Postgres database. The default `DATABASE_URL` expects a role/db named `gita` on
  `localhost:5432`. Create them however you like, e.g. via `psql`:
  ```sql
  CREATE ROLE gita LOGIN PASSWORD 'gita' CREATEDB;
  CREATE DATABASE gita OWNER gita;
  ```
  (`CREATEDB` lets Prisma Migrate create its shadow database.)
- A Dragonfly (or Redis) instance for the render + rate-limit cache, reachable at
  `REDIS_URL`. Quick start:
  ```bash
  docker run -d -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly
  ```

## Setup

```bash
pnpm install
cp .env.example .env      # then fill in the values (see below)
pnpm db:migrate           # apply migrations
pnpm db:seed              # seed 3 users and 6 example widgets
pnpm dev                  # http://localhost:5173
```

### Environment

| Variable                          | Purpose                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`                    | Postgres connection string                                |
| `BETTER_AUTH_SECRET`              | Session secret (`openssl rand -base64 32`)                |
| `BETTER_AUTH_URL`                 | App base URL (e.g. `http://localhost:5173`)               |
| `GITHUB_CLIENT_ID` / `..._SECRET` | GitHub OAuth app credentials (login/identity only)        |
| `CREDENTIAL_ENCRYPTION_KEY`       | 32-byte key encrypting user git tokens at rest (required) |
| `REDIS_URL`                       | Dragonfly/Redis connection for the render cache           |
| `SEED_GITHUB_TOKEN`               | Optional token so `db:seed` gives instances live data     |
| `PG_USER` / `PG_PASSWORD` / `PG_DB` | Postgres provisioning for Docker Compose (see below)    |

For GitHub sign-in, create an OAuth app with callback URL
`http://localhost:5173/api/auth/callback/github` and set the client id/secret.

See [`.env.example`](.env.example) for the full annotated list.

## Scripts

| Script                         | Description                              |
| ------------------------------ | ---------------------------------------- |
| `pnpm dev` / `build` / `start` | Dev server / production build / serve    |
| `pnpm typecheck`               | Route typegen + `tsc`                    |
| `pnpm lint` / `format`         | ESLint / Prettier                        |
| `pnpm db:migrate` / `db:seed` / `db:studio` | Prisma migrate / seed / studio |
| `pnpm db:reset`                | Reset the database and re-run migrations |

## Production (Docker Compose)

The production stack runs entirely via Docker Compose. It builds the app image,
provisions Postgres and a Dragonfly cache, applies database migrations, and only
then starts the web server.

1. Set up environment variables. Compose reads them from a root `.env` file (see
   [`.env.example`](.env.example)). The app secrets (`BETTER_AUTH_SECRET`,
   `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`/`_SECRET`, `CREDENTIAL_ENCRYPTION_KEY`)
   come from there, plus `PG_USER` / `PG_PASSWORD` / `PG_DB` to provision Postgres.
   `DATABASE_URL` and `REDIS_URL` are overridden inside compose to point at the
   `db` and `cache` services, so you don't need to set them for the container.

2. Build and start all services:
   ```bash
   # Locally, reading variables from .env
   docker compose --env-file .env up -d --build
   # Or, if the variables are already set in your CI/host environment
   docker compose up -d --build
   ```
   On first start the `migrate` service runs `prisma migrate deploy` to initialise
   the schema, then exits; the `web` service starts only after migrations complete.

3. The app is served at `http://localhost:1791` (change the host mapping in
   `docker-compose.yml` if needed).

To apply new migrations later, re-run `docker compose up -d --build` — the `migrate`
service runs again before the web server restarts.

## License

The project is licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE) for details.