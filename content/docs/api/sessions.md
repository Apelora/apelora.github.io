---
title: Sessions API
section: api
slug: sessions
order: 9
label: Sessions
source: packages/api-client/openapi.json
summary: Terminal sessions into modules.
---
Terminal sessions into running modules. This page lists 4 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/applications/{name}/access`](#get-apiv1applicationsnameaccess) | What the caller may open on each instance of the application now, with the reason when not. |
| [`POST /api/v1/applications/{name}/instances/{instance}/sessions`](#post-apiv1applicationsnameinstancesinstancesessions) | Opens a session: checks the caller, the instance and the approval rule, and answers with a single-use ticket for the websocket. |
| [`GET /api/v1/sessions`](#get-apiv1sessions) | Open sessions the caller started, and those on applications they may operate. |
| [`DELETE /api/v1/sessions/{id}`](#delete-apiv1sessionsid) | Ends a session now. |

## Details

### `GET /api/v1/applications/{name}/access`

What the caller may open on each instance of the application now, with the reason when not. This is the source for the interface's menu entries. Needs `application.view`.

**Operation ID:** `application_access`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/access" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_access", { params: { name: "shop" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "instance": "shop-db-01",
      "module": "db-01",
      "guestOs": "linux",
      "status": "Running",
      "kinds": [
        {
          "kind": "terminal",
          "allowed": false,
          "reason": "interactive sessions are for signed-in people",
          "approvalRequired": false
        }
      ]
    },
    {
      "instance": "shop-web-01",
      "module": "web-01",
      "guestOs": "linux",
      "status": "Running",
      "kinds": [
        {
          "kind": "terminal",
          "allowed": false,
          "reason": "interactive sessions are for signed-in people",
          "approvalRequired": false
        }
      ]
    }
  ],
  "observed": true,
  "provider": "mock",
  "idleSecs": 900,
  "maxSecs": 3600
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/applications/{name}/instances/{instance}/sessions`

Opens a session: checks the caller, the instance and the approval rule, and answers with a single-use ticket for the websocket. Needs `instance.console` (terminal, PowerShell) or `instance.desktop` (RDP) on the application; in production also an approval (`Apelora-Approval: <id>`) of `instance.console` on `instance:<application>/<instance>`.

**Operation ID:** `open_session`

**Needs:** `instance.console` (terminal, PowerShell) or `instance.desktop` (RDP) on the application; in production also an approval (`Apelora-Approval: <id>`) of `instance.console` on `instance:<application>/<instance>`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `instance` | path | string | yes | — | Instance name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `cols` | integer | no | — |
| `kind` | one of `terminal`, `powershell`, `rdp` | yes | What a person can open on a module. |
| `rows` | integer | no | — |

```json
{
  "kind": "terminal",
  "cols": 120,
  "rows": 32
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/instances/shop-db-01/sessions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"kind":"terminal","cols":120,"rows":32}'
```

**TypeScript:**

```ts
const result = await client.request("open_session", { params: { name: "shop", instance: "shop-db-01" }, body: { kind: "terminal", cols: 120, rows: 32 } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "17ab06f7-bcf7-41b6-ad02-d64aba42145c",
  "ticket": "<one-time session ticket>",
  "expiresAt": "2026-10-28T21:25:19.356822Z",
  "connectPath": "/api/v1/sessions/connect",
  "protocol": "apelora.session.v1",
  "kind": "terminal",
  "instance": "shop-db-01",
  "idleSecs": 900,
  "maxSecs": 3600,
  "provider": "mock"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `instance_state_unknown`, `session_unavailable` |
| `429` | `too_many_sessions`, `rate_limited` |
| `503` | `console_disabled`, `no_randomness`, `database_not_configured` |

### `GET /api/v1/sessions`

Open sessions the caller started, and those on applications they may operate.

**Operation ID:** `sessions`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/sessions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("sessions", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |

### `DELETE /api/v1/sessions/{id}`

Ends a session now. Allowed for the person who has it and for whoever may operate its application. Anything else answers 404.

**Operation ID:** `terminate_session`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Session id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/sessions/17ab06f7-bcf7-41b6-ad02-d64aba42145c" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("terminate_session", { params: { id: "17ab06f7-bcf7-41b6-ad02-d64aba42145c" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

