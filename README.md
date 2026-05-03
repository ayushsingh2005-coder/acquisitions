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

## Comprehensive Step-by-Step Build Guide

This section breaks down the entire project setup from scratch, explaining the reasoning behind every package and configuration.

### 1. Core Packages & Frameworks

- **`express`**: Fast, unopinionated, minimalist web framework for Node.js. Used as the core HTTP server.
- **`dotenv`**: Loads environment variables from a `.env` file into `process.env`. Keeps secrets out of the codebase.
- **`cors`**: Express middleware to enable CORS (Cross-Origin Resource Sharing). Essential for allowing frontend applications to interact with the API securely.
- **`helmet`**: Secures the Express app by setting various HTTP headers. Mitigates common web vulnerabilities like XSS and clickjacking.
- **`morgan`**: HTTP request logger middleware. Used to cleanly log incoming requests and debugging information to the console.
- **`cookie-parser`**: Parses `Cookie` header and populates `req.cookies`. Critical for extracting JWT tokens stored securely in HTTP-only cookies.

### 2. Database & ORM (Neon + Drizzle)

- **`drizzle-orm` & `drizzle-kit`**: A headless TypeScript/JavaScript ORM. Chosen over Prisma or Sequelize because it is lightweight, performs edge-ready SQL generation, and has first-class support for serverless databases. `drizzle-kit` handles seamless migration generation.
- **`@neondatabase/serverless`**: The Neon Postgres driver. It allows Drizzle to connect to the Neon serverless database using WebSockets or HTTP fetch, bypassing connection limits usually found in traditional Postgres setups—perfect for scale-to-zero serverless environments.

### 3. Security & Validation

- **`@arcjet/node` & `@arcjet/inspect`**: Next-generation security platform for Node.js. Used instead of generic rate-limiters because it provides intelligent bot protection, real-time shielding against malicious attacks, and highly configurable sliding-window rate limiting based on user roles.
- **`jsonwebtoken` (JWT)**: Generates and verifies secure, stateless authentication tokens. Used to securely transmit user identity across requests without needing session storage.
- **`bcrypt`**: A robust password-hashing function. Used to cryptographically hash user passwords before storing them in the database, protecting user data even in the event of a breach.
- **`zod`**: A TypeScript-first schema declaration and validation library. Used to enforce strict boundaries on incoming API request bodies and parameters, ensuring that malicious or malformed data never reaches the business logic.

### 4. Step-by-Step API Construction

#### Phase 1: Initialize the Project
Initialize a Node project and update `package.json` to use ECMAScript modules (`"type": "module"`) to utilize modern `import/export` syntax. Establish import aliases (e.g., `"#config/*": "./src/config/*"`) to avoid messy relative paths like `../../../`.

#### Phase 2: Database Configuration
1. **Define Schemas**: Build the SQL tables using Drizzle's `pgTable` inside `src/models/`.
2. **Setup Drizzle Config**: Create `drizzle.config.js` to point `drizzle-kit` at the models.
3. **Database Client**: In `src/config/database.js`, initialize the Neon serverless client. A custom interceptor checks if `USE_NEON_LOCAL=true` (like in the Docker Compose setup), overriding the fetch endpoint to point to the local container (`neon-local:5432`) instead of the cloud.

#### Phase 3: Service and Validation Layers
1. **Zod Schemas**: Inside `src/validations/`, build schemas to validate incoming `req.body` (e.g., ensuring emails are valid, passwords have a minimum length).
2. **Services**: Inside `src/services/`, encapsulate all `drizzle-orm` queries (e.g., `db.select()`, `db.update()`). This keeps database logic completely separate from Express request/response logic.

#### Phase 4: Middleware & Authentication
1. **JWT Auth**: Create `src/middleware/auth.middleware.js` to extract tokens from cookies, verify them using the secret key, and attach the decoded payload to `req.user`.
2. **RBAC**: Implement `requireRole(['admin'])` which checks `req.user.role` to conditionally block access to restricted endpoints.
3. **Arcjet**: In `src/middleware/security.middleware.js`, apply sliding window rate limits dynamically (Admins get 20 req/min, Users get 10 req/min).

#### Phase 5: Controllers and Routing
1. **Controllers**: Inside `src/controllers/`, wrap the service calls in `try/catch` blocks, passing errors to Express's `next(e)` for centralized handling.
2. **Routers**: Inside `src/routes/`, map HTTP methods and URLs to specific controllers, injecting the `authenticateToken` and `securityMiddleware` into the pipeline.

#### Phase 6: Containerization & CI/CD
1. **Multi-stage Dockerfile**: Build an optimized image by separating `deps` (all dependencies) from `prod-deps` (only production). This keeps the final image tiny and secure.
2. **Docker Compose**: Map `docker-compose.dev.yml` to spin up `neon_local` (which mocks Neon cloud Postgres) and the Express app side-by-side.
3. **GitHub Actions**: Finally, automate the workflow. Add `.github/workflows/` YAML files to trigger lint checks (`eslint`), automated testing (`jest` with native ESM support via `NODE_OPTIONS=--experimental-vm-modules`), and multi-platform Docker builds targeting `linux/amd64` and `linux/arm64`.

---

## Thank you
