---
title: Administration API
section: api
slug: administration
order: 6
label: Administration
source: packages/api-client/openapi.json
summary: Tokens and Apelora's own database.
---
API tokens and Apelora's own database backups. This page documents all 3 operations, each with a request you can copy. Set `APELORA_URL` and `APELORA_TOKEN` as described in [the API overview](/docs/api/overview/).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/tokens`](#get-apiv1tokens) | API tokens, active and revoked (never the tokens themselves). |
| [`POST /api/v1/tokens`](#post-apiv1tokens) | Creates an API token, shown only in this response. |
| [`DELETE /api/v1/tokens/{id}`](#delete-apiv1tokensid) | Revokes an API token; it stops working at once. |

## Details

### `GET /api/v1/tokens`

API tokens, active and revoked (never the tokens themselves).

**Needs:** `manage-tokens`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "example",
      "role": "fabric-admin",
      "expiresAt": "2026-01-01T09:00:00Z",
      "lastUsedAt": "2026-01-01T09:00:00Z",
      "revokedAt": "2026-01-01T09:00:00Z"
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/tokens`

Creates an API token, shown only in this response. A `fabric-admin` token also needs another person's approval of `token.create_admin` on `token:fabric-admin`, sent as `Apelora-Approval`; an API token cannot present one, so it cannot create `fabric-admin` tokens.

**Needs:** `manage-tokens` and every permission the token's role carries (a token never does more than its creator).

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `Apelora-Approval` | header | string | no | For a fabric-admin token: the approval another person granted for token.create_admin on token:fabric-admin |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `expiresInDays` | integer | no | 1–365 days; 90 when omitted. |
| `name` | string | yes | Who or what uses it, e.g. "ci" or a person's name. |
| `role` | `fabric-admin`, `operator`, `studio-designer`, `auditor` | yes | Who may do what. Every API route names the permission it needs; roles map to permissions here and nowhere else. |

```json
{
  "name": "example",
  "role": "fabric-admin"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","role":"fabric-admin"}'
```

**Response `201`**:

```json
{
  "info": {
    "createdAt": "2026-01-01T09:00:00Z",
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "example",
    "role": "fabric-admin",
    "expiresAt": "2026-01-01T09:00:00Z",
    "lastUsedAt": "2026-01-01T09:00:00Z",
    "revokedAt": "2026-01-01T09:00:00Z"
  },
  "token": "<redacted>"
}
```

**Errors:** `400`, `401`, `403`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/tokens/{id}`

Revokes an API token; it stops working at once.

**Needs:** `manage-tokens`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Token id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/tokens/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

