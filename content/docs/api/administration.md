---
title: Administration API
section: api
slug: administration
order: 6
label: Administration
source: packages/api-client/openapi.json
summary: API tokens for scripts and automation: list, create and revoke.
---
API tokens for scripts and automation: list, create and revoke them. This page lists 3 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/tokens`](#get-apiv1tokens) | API tokens, active and revoked (never the tokens themselves). |
| [`POST /api/v1/tokens`](#post-apiv1tokens) | Creates an API token, shown only in this response. |
| [`DELETE /api/v1/tokens/{id}`](#delete-apiv1tokensid) | Revokes an API token; it stops working at once. |

## Details

### `GET /api/v1/tokens`

API tokens, active and revoked (never the tokens themselves). Needs `manage-tokens`.

**Operation ID:** `tokens`

**Needs:** `manage-tokens`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("tokens", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "e048beeb-4ddb-4c7c-909b-2e5edf6a9139",
      "name": "docs-verifier",
      "role": "fabric-admin",
      "createdAt": "2026-10-28T21:24:00.046009Z",
      "expiresAt": "2026-10-29T21:24:00.01776Z",
      "revokedAt": null,
      "lastUsedAt": "2026-10-28T21:24:02.989842Z"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/tokens`

Creates an API token, shown only in this response. Needs `manage-tokens` and every permission the token's role carries (a token never does more than its creator). A `fabric-admin` token also needs another person's approval of `token.create_admin` on `token:fabric-admin`, sent as `Apelora-Approval`; an API token cannot present one, so it cannot create `fabric-admin` tokens.

**Operation ID:** `create_token`

**Needs:** `manage-tokens` and every permission the token's role carries (a token never does more than its creator).

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `Apelora-Approval` | header | string (uuid) | no | — | For a fabric-admin token: the approval another person granted for token.create_admin on token:fabric-admin |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `expiresInDays` | integer or null | no | 1–365 days; 90 when omitted. |
| `name` | string | yes | Who or what uses it, e.g. "ci" or a person's name. |
| `role` | one of `fabric-admin`, `operator`, `studio-designer`, `auditor` | yes | Who may do what. Every API route names the permission it needs; roles map to permissions here and nowhere else. |

```json
{
  "name": "monitoring",
  "role": "operator",
  "expiresInDays": 90
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"monitoring","role":"operator","expiresInDays":90}'
```

**With options** (`Apelora-Approval`):

```sh
# APPROVAL_ID: the id of the approval another person granted (POST /api/v1/approvals).
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Apelora-Approval: $APPROVAL_ID" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"backup-site-admin","role":"fabric-admin","expiresInDays":30}'
```

**TypeScript:**

```ts
const result = await client.request("create_token", { body: { name: "monitoring", role: "operator", expiresInDays: 90 } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "token": "<token, shown once>",
  "info": {
    "id": "38e3b2ef-bcc1-4e99-b03e-4146575b9c54",
    "name": "monitoring",
    "role": "operator",
    "createdAt": "2026-10-28T21:24:02.99415Z",
    "expiresAt": "2027-01-26T21:24:02.99453Z",
    "revokedAt": null,
    "lastUsedAt": null
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `approval_unavailable`, `token_exceeds_caller`, `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/tokens/{id}`

Revokes an API token; it stops working at once. Needs `manage-tokens`.

**Operation ID:** `revoke_token`

**Needs:** `manage-tokens`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Token id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/tokens/38e3b2ef-bcc1-4e99-b03e-4146575b9c54" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("revoke_token", { params: { id: "38e3b2ef-bcc1-4e99-b03e-4146575b9c54" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

