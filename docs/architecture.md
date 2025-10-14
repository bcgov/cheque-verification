# Architecture Overview

This document describes how the cheque verification platform is structured and how requests flow through the system. It intentionally omits environment-specific secrets and infrastructure identifiers.

## High-Level Flow

```mermaid
flowchart TD
    User[End User Browser]
    FE[React Frontend<br/>(Vite, TypeScript)]
    BE[Backend Proxy<br/>(Express, TypeScript)]
    API[Cheque API<br/>(Internal Service)]
    DB[(Oracle Database)]

    User -->|HTTPS| FE
    FE -->|POST /api/cheque/verify| BE
    BE -->|GET /api/v1/cheque/:number| API
    API -->|SQL Query| DB
    API -->|Cheque result| BE
    BE -->|Validated response| FE
    FE -->|Display status| User
```

Key characteristics:

- The frontend never communicates with the upstream cheque API directly. All sensitive calls are made server-side by the backend.
- The backend enforces validation, rate limiting, and (optionally) JWT-based authentication before touching internal services.
- The upstream API is responsible for business rules and database access; the backend only proxies verified requests and compares user input against authoritative data.

## Component Responsibilities

### Frontend (`frontend/`)

- Presents the cheque verification form and related content (FAQ, notices).
- Calls `POST /api/cheque/verify` on the backend with the cheque number, payment issue date, and applied amount supplied by the user.
- Shows success, error, and validation states returned from the backend.
- Consumes a single environment variable: `VITE_API_URL`.

### Backend Proxy (`backend/`)

- Express application that accepts requests from the frontend.
- Validates payloads (format, required fields, domain constraints).
- Applies rate limits and logs metadata for observability without storing personal information.
- Fetches authoritative cheque data from the upstream API.
- Compares user-supplied values with authoritative data and returns either a `success` response or human-readable validation messages.
- Optionally signs a short-lived JWT when calling the upstream API to avoid sending static credentials.

### Upstream Cheque API (`api/`)

- Internal service owned by the payment team. Implementation details can vary by environment.
- Hosts `/api/v1/cheque/:chequeNumber`, returning cheque metadata (status, issue date, amount).
- Connects to Oracle and encapsulates all SQL access and error handling.
- Exposes structured JSON responses matching `ApiResponse<ChequeStatusResponse>`.

## Request Lifecycle

1. End user submits the web form.
2. Frontend posts to the backend (`/api/cheque/verify`) with the supplied details.
3. Backend validates the payload. If validation fails, it returns a `400` with contextual errors.
4. Backend fetches the cheque record from the upstream API using a GET request.
5. Backend compares the amount and date provided by the user with the canonical data.
6. Backend returns:
   - `200` + cheque payload when everything matches.
   - `400` + error list when the cheque exists but values do not match.
   - `404` when the cheque number cannot be found.
   - `5xx` when upstream dependencies fail.
7. Frontend surfaces the message to the user in a user-friendly format.

## Deployment Considerations

- **Environment segregation**: Deploy frontend and backend in separate environments (e.g., dev/test/prod) with matching `VITE_API_URL` and `FRONTEND_URL` origins.
- **Secrets management**: Store `JWT_SECRET` and upstream API credentials in a managed secret store (e.g., Vault, Kubernetes secrets). Do not bake secrets into images or config maps committed to Git.
- **Transport security**: Terminate TLS at the edge (reverse proxy, ingress controller). All internal traffic between services should also be encrypted where possible.
- **Scaling**: The backend is stateless; run multiple replicas behind a load balancer. Rate limiter configuration should be replaced with a distributed implementation (e.g., Redis) if horizontal scaling is required.
- **Observability**: Forward backend logs to a centralized platform. Consider enhancing with structured logging (e.g., Pino) and metrics endpoints for production.

## Future Enhancements

- Persist aggregate metrics (request counts, validation failures) for reporting and anomaly detection.
- Introduce Application Decision Records (ADRs) under `docs/adr/` to capture significant architectural decisions.
- Add automated contract tests to ensure the backend proxy remains aligned with the upstream API schema.
