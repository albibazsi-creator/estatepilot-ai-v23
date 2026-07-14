# Error Taxonomy

V13 introduces a centralized error taxonomy so support, API clients and developers can talk about failures consistently.

Each error includes:

- `code`
- `category`
- `severity`
- `httpStatus`
- `publicMessage`
- `remediation`
- `ownerArea`
- `isRetryable`

Initial categories:

- auth
- security
- input
- privacy
- ai
- storage
- billing
- ai_safety
- abuse
- ops

The dashboard is available at `/dashboard/error-taxonomy`.
