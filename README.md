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
- **Backend (`backend/`)** &mdash; Express + TypeScript API that validates requests, applies rate limiting/logging, and calls the upstream cheque API.
- **External API (`api/`)** &mdash; Internal service that returns authoritative cheque data. Credentials and access remain server-side.

> For a deeper dive, including sequence diagrams, see `docs/architecture.md`.

## Local Development

### Prerequisites

- Node.js **18.x** or later
- npm (ships with Node.js)
- Database client connectivity if you plan to run the upstream `api/` service locally (optional)

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
# In one terminal, start the backend
npm run dev backend

# In another terminal, start the frontend
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

- **Rate Limiting**: The backend enforces strict rate limiting (global and per-route) with progressive delays to prevent brute-force attacks.
- **Error Handling**: API returns generic error messages to avoid leaking implementation details or validation rules.
- **Logging**: Caddy and backend logs capture metadata (IP, status, latency) for security monitoring but exclude sensitive personal information.
- **Configuration**: Sensitive configuration (API credentials, JWT secrets, database handles) must stay outside of the repo.
- **Authentication**: The backend uses JWT-based authentication for internal communication with the upstream API.

## Additional Documentation

- `docs/architecture.md` &mdash; System diagram, request flow, and deployment considerations.
- Additional docs can be added under `docs/` as the system evolves (runbooks, ADRs, etc.).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Licensed under the [Apache License 2.0](LICENSE).
