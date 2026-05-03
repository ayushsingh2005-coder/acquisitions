# Acquisitions API

A robust, production-ready Express.js REST API featuring role-based access control, advanced security features (via Arcjet), seamless Neon Serverless Postgres integration using Drizzle ORM, and comprehensive CI/CD pipelines.

## Tech Stack
- **Framework:** Node.js, Express.js
- **Database:** Neon Serverless Postgres
- **ORM:** Drizzle ORM
- **Security:** Arcjet (Rate Limiting, Bot Protection, Shield), Helmet, CORS
- **Authentication:** JWT, bcrypt
- **Validation:** Zod
- **Testing:** Jest, Supertest
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Features
- **Authentication**: JWT-based sign-up, sign-in, and sign-out functionality.
- **User Management**: Full CRUD capabilities for users with Role-Based Access Control (RBAC). Admin can modify any user, while normal users can only manage themselves.
- **Security First**: 
  - `Arcjet` integrated for request rate limiting, intelligent bot detection, and malicious request shielding.
  - Express best practices (`helmet`, `cors`, `cookie-parser`).
- **Development Experience**: Containerized development environment using `neon-local` to provide ephemeral Postgres databases locally, without requiring constant cloud connectivity.
- **Automated Workflows**: Full CI/CD via GitHub actions (Linting, Testing, Multi-platform Docker Image builds).

---

## Getting Started

### Prerequisites
- Node.js (v20 or higher recommended)
- Docker & Docker Compose
- Neon Cloud API Key (for production, or advanced local setups)

### Environment Setup
The project requires `.env.development` and `.env.production` files at the root level.

**`.env.development`**
```env
# Neon Local connection string
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require
DELETE_BRANCH=true
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1d
ARCJET_KEY=your-arcjet-test-key
```

**`.env.production`**
```env
# Neon Cloud connection string
DATABASE_URL=postgres://your_user:your_password@ep-your-db.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=1d
ARCJET_KEY=your-arcjet-production-key
```

---

## Running the Application

### 1) Development Setup
The development stack spins up your Express application alongside `neon-local`, a proxy that mocks the Neon serverless environment locally. It automatically creates ephemeral branches on startup.

```bash
# Start the development container stack
docker compose -f docker-compose.dev.yml up --build
```
- App runs on: `http://localhost:3000`
- Neon Local Postgres runs on: `localhost:5432`

### 2) Production Setup
The production stack runs only the Express API container, connecting directly to your Neon Cloud database specified in `.env.production`.

```bash
# Start the production container stack in detached mode
docker compose -f docker-compose.prod.yml up --build -d
```

---

## Available NPM Scripts
If you prefer running the app locally without Docker:

- `npm run dev`: Starts the server with `nodemon` for hot-reloading.
- `npm run start`: Starts the application in production mode.
- `npm run lint` / `npm run format`: Runs ESLint and Prettier.
- `npm run test`: Executes the Jest test suite with experimental VM modules for native ESM support.
- `npm run db:generate`: Generates Drizzle SQL migrations based on your schema.
- `npm run db:migrate`: Applies migrations to your database.
- `npm run db:studio`: Opens Drizzle Studio to explore your database locally.

---

## Project Structure
```
.
├── .github/workflows/       # CI/CD pipelines (Lint, Test, Docker Build)
├── src/
│   ├── config/              # Centralized configuration (Arcjet, DB, Logger)
│   ├── controllers/         # Route controllers (Auth, Users)
│   ├── middleware/          # Express middleware (Auth, Security)
│   ├── models/              # Drizzle ORM schemas
│   ├── routes/              # Express API routers
│   ├── services/            # Business logic and database operations
│   ├── utils/               # Helpers (Cookies, JWT, formatting)
│   ├── app.js               # Express application setup
│   └── index.js             # Server entry point
├── drizzle/                 # Generated database migrations
├── tests/                   # Jest test suites
├── Dockerfile               # Multi-stage Dockerfile
├── docker-compose.*.yml     # Environment-specific Compose setups
└── package.json
```

---

## CI/CD Pipelines
The project utilizes GitHub Actions to ensure code quality and seamless deployments:

1. **Lint and Format**: Runs `eslint` and `prettier` on every pull request and push to `main` and `staging`.
2. **Tests**: Executes Jest test suites, passing necessary environments, and uploads code coverage as an artifact.
3. **Docker Build and Push**: Automatically triggers on `main` branch merges, executing a multi-platform (`amd64`, `arm64`) Docker Buildx task. Images are tagged dynamically (including short SHAs and timestamps) and published securely to Docker Hub.
