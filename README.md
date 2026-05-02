# Acquisitions Docker setup (Neon Local for dev, Neon Cloud for prod)
This project now supports two database modes:
- development: app + `neondatabase/neon_local` in Docker Compose
- production: app container only, connecting directly to Neon Cloud via `DATABASE_URL`
## Files added
- `Dockerfile`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env.development`
- `.env.production`
## 1) Development (Neon Local + ephemeral branches)
Neon Local runs as `neon-local` and exposes Postgres on `5432`.
The app uses this connection string in `.env.development`:
`DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require`
By default, Neon Local creates an ephemeral branch on container start and deletes it on stop (`DELETE_BRANCH=true`).
If you want to pick a specific base branch, set `PARENT_BRANCH_ID` in `.env.development`.
### Start dev stack
```bash
docker compose -f docker-compose.dev.yml up --build
```
App: `http://localhost:3000`
Neon Local proxy: `localhost:5432`
## 2) Production (Neon Cloud URL only)
Production does **not** run Neon Local.
Set your real Neon cloud URL in `.env.production`:
`DATABASE_URL=postgres://...neon.tech...`
### Start prod stack
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
## How DATABASE_URL switches between environments
- `docker-compose.dev.yml` loads `.env.development`, so app uses the Neon Local URL.
- `docker-compose.prod.yml` loads `.env.production`, so app uses the Neon Cloud URL.
No database URL is hardcoded in the app; it always comes from environment variables.
