[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=bcgov_cheque-verification&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=bcgov_cheque-verification)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bcgov_cheque-verification&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=bcgov_cheque-verification)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=bcgov_cheque-verification&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=bcgov_cheque-verification)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bcgov_cheque-verification&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=bcgov_cheque-verification)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bcgov_cheque-verification&metric=bugs)](https://sonarcloud.io/summary/new_code?id=bcgov_cheque-verification)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=bcgov_cheque-verification&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=bcgov_cheque-verification)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bcgov_cheque-verification&metric=coverage)](https://sonarcloud.io/summary/new_code?id=bcgov_cheque-verification)

# Cheque Verification System

A web application for BC Government to verify cheque numbers, amounts, and issue dates

## Contents

- [Architecture Overview](#architecture-overview)
- [Local Development](#local-development)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Security & Privacy Notes](#security--privacy-notes)
- [Additional Documentation](#additional-documentation)
- [Contributing](#contributing)
- [License](#license)

## Architecture Overview

- **Frontend (`frontend/`)** &mdash; React + TypeScript single-page app served by Vite. Responsible for rendering the cheque verification form and displaying results.
- **Backend (`backend/`)** &mdash; Express + TypeScript API that validates requests, applies rate limiting/logging, and calls the upstream cheque API. The frontend never talks to the upstream service directly.
- **External API (`api/`)** &mdash; Internal service (Node.js + Oracle DB integration) that returns authoritative cheque data. Credentials and access remain server-side.

> For a deeper dive, including sequence diagrams, see `docs/architecture.md`.

## Local Development

### Prerequisites

- Node.js **18.x** or later
- npm (ships with Node.js)
- Oracle client connectivity if you plan to run the upstream `api/` service locally (optional)

### First-Time Setup

```bash
# Install dependencies
npm install backend
npm install frontend

# Create environment files based on the provided examples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in the `.env` files with values appropriate for your environment. Do **not** commit environment files containing secrets.

### Running the Stack

```bash
# In one terminal, start the backend (defaults to http://localhost:4000)
npm run dev backend

# In another terminal, start the frontend (defaults to http://localhost:5173)
npm run dev frontend
```

The frontend proxy will read `VITE_API_URL` and forward requests to the backend's `/api/cheque/verify` endpoint.

### Production Builds

```bash
npm run build backend
npm run build frontend
```

The backend build outputs compiled JavaScript into `backend/dist/`. The frontend build emits static assets in `frontend/dist/`.

## Environment Configuration

Never commit secrets to source control. Use `.env` files for local development only.

### Backend (`backend/.env`)

| Variable       | Required | Default                 | Purpose                                                             |
| -------------- | -------- | ----------------------- | ------------------------------------------------------------------- |
| `PORT`         | No       | `4000`                  | Port the Express server listens on.                                 |
| `API_URL`      | Yes      | `http://localhost:3000` | Base URL of the upstream cheque API (internal).                     |
| `FRONTEND_URL` | No       | `http://localhost:5173` | Origin allowed by CORS. Set to deployed frontend URL in production. |
| `NODE_ENV`     | No       | `development`           | Used for environment-aware logging/config.                          |
| `JWT_SECRET`   | Optional | _unset_                 | Shared secret to mint a short-lived JWT for upstream API access.    |
| `JWT_ISSUER`   | Optional | `cheque-example`        | JWT issuer claim when `JWT_SECRET` is set.                          |
| `JWT_AUDIENCE` | Optional | `api-example`           | JWT audience claim when `JWT_SECRET` is set.                        |
| `JWT_TTL`      | Optional | `120` (seconds)         | Token lifetime for upstream calls.                                  |

### Frontend (`frontend/.env`)

| Variable       | Required | Default                 | Purpose                                                                      |
| -------------- | -------- | ----------------------- | ---------------------------------------------------------------------------- |
| `VITE_API_URL` | No       | `http://localhost:4000` | Backend base URL for API calls. Vite exposes `import.meta.env.VITE_API_URL`. |

> See `.env.example` files in each package for templated defaults.

## Testing

- **Frontend** (`frontend/`)
  - Unit/component tests: `npm test frontend`
  - Coverage: `npm run test:coverage frontend`
- **Backend** (`backend/`)
  - Unit/integration tests: `npm test backend`
  - CI coverage run: `npm run test:coverage backend`

All tests should pass locally before pushing changes or opening a pull request. Consider adding new tests for any bug fixes or feature work.

## Project Structure

```
cheque-verification/
├── backend/            # Express API (TypeScript)
├── frontend/           # React SPA (TypeScript + Vite)
├── api/                # Upstream service (Node + Oracle integration)
├── helm/               # Helm chart for Kubernetes deployments
└── docs/               # Architecture, API, and operational documentation
```

Refer to sub-package READMEs or scripts for additional details.

## Security & Privacy Notes

- Sensitive configuration (API credentials, JWT secrets, database handles) must stay outside of the repo.
- The backend enforces rate limiting, input validation, and JWT-based authentication before calling the upstream API.
- Avoid logging personal information; the backend currently logs only metadata (presence and length of fields, not the actual values).
- When contributing documentation, redact internal URLs, infrastructure identifiers, and any credentials.

## Additional Documentation

- `docs/architecture.md` &mdash; System diagram, request flow, and deployment considerations.
- `docs/backend-api.md` &mdash; Backend endpoint contract, expected payloads, and error handling.
- Additional docs can be added under `docs/` as the system evolves (runbooks, ADRs, etc.).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Licensed under the [Apache License 2.0](LICENSE).
