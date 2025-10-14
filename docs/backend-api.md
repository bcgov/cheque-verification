# Backend API Contract

This document captures the public surface area exposed by the backend proxy (`backend/`). The proxy is the only API consumed by the frontend; it in turn communicates with the upstream cheque service.

## Base URL

- Local development: `http://localhost:4000`
- Deployed environments: set via configuration; never expose internal hostnames or credentials in documentation.

All endpoints return JSON.

## Authentication

- Requests from the frontend are expected to originate from the configured `FRONTEND_URL`.
- No user-level authentication is currently enforced. If that changes, update this document and the frontend accordingly.
- Rate limiting protects the endpoints from abuse. See [Rate Limiting](#rate-limiting).

## Endpoints

### `POST /api/cheque/verify`

Verifies a cheque number against authoritative data returned by the internal cheque API.

#### Request

```http
POST /api/cheque/verify
Content-Type: application/json

{
  "chequeNumber": "123456789",
  "appliedAmount": "125.50",
  "paymentIssueDate": "2024-03-15"
}
```

**Request Body Fields:**

| Field              | Type   | Required | Rules                                    |
| ------------------ | ------ | -------- | ---------------------------------------- |
| `chequeNumber`     | string | Yes      | 1–16 digits, cannot be zero.             |
| `appliedAmount`    | string | Yes      | Parses to a positive number.             |
| `paymentIssueDate` | string | Yes      | ISO-8601 or any date parsable by `Date`. |

> **Note:** All request fields are sent as strings in the JSON body. The backend validates and converts them to appropriate types internally.

#### Responses

- `200 OK`

  ```json
  {
    "success": true,
    "message": "Cheque verification successful",
    "data": {
      "chequeStatus": "ok to cash",
      "chequeNumber": 123456789,
      "paymentIssueDate": "2024-03-15T00:00:00.000Z",
      "appliedAmount": 125.5
    }
  }
  ```

  **Response Data Fields:**

  | Field              | Type              | Description                                |
  | ------------------ | ----------------- | ------------------------------------------ |
  | `chequeStatus`     | string            | Status of the cheque (e.g., "ok to cash"). |
  | `chequeNumber`     | number            | Validated cheque number.                   |
  | `paymentIssueDate` | string (ISO-8601) | Issue date in ISO format.                  |
  | `appliedAmount`    | number            | Validated amount.                          |

- `400 Bad Request`

  - Input validation failed:

    ```json
    {
      "success": false,
      "error": "Cheque amount must be a valid positive number"
    }
    ```

  - Cheque exists but data does not match:

    ```json
    {
      "success": false,
      "error": "Verification failed",
      "details": [
        "Cheque amount does not match",
        "Payment issue date does not match"
      ]
    }
    ```

- `404 Not Found`

  ```json
  {
    "success": false,
    "error": "Cheque not found"
  }
  ```

- `429 Too Many Requests`

  Triggered when the stricter API limiter is exceeded. Includes a `retryAfter` hint.

- `504 Gateway Timeout`

  Returned when the upstream cheque API times out (30-second cutoff).

- `5xx Internal Error`

  Indicates an unexpected downstream or service failure. Body:

  ```json
  {
    "success": false,
    "error": "Error communicating with API service"
  }
  ```

### `GET /health`

Simple liveness probe for deployment environments.

#### Response

```json
{
  "status": "OK",
  "timestamp": "2024-05-08T17:42:53.987Z"
}
```

## Rate Limiting

The backend applies three layers of rate limiting via `express-rate-limit`:

| Scope             | Window | Limit | Notes                                                                    |
| ----------------- | ------ | ----- | ------------------------------------------------------------------------ |
| Global middleware | 15 min | 100   | Applied to every request.                                                |
| `/api/cheque/*`   | 5 min  | 20    | Stricter cap for verification endpoint; returns `429` with `retryAfter`. |
| `/health`         | 1 min  | 60    | Prevents excessive probing while staying lenient.                        |

If horizontal scaling is introduced, replace the in-memory limiter with a distributed store (Redis, Memcached).

## Error Handling

- Axios errors from the upstream API are translated into corresponding HTTP statuses where possible.
- Unhandled errors return a `500` with a generic message to avoid leaking sensitive details.
- All logs intentionally omit raw cheque numbers or amounts; they record only metadata (e.g., field length, boolean flags).
