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

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [],
  "observed": true,
  "provider": "mock",
  "idleSecs": 900,
  "maxSecs": 3600
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `404` | `not_found` |

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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/instances/shop-web-01/sessions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"kind":"terminal","cols":120,"rows":32}'
```

**TypeScript:**

```ts
const result = await client.request("open_session", { params: { name: "shop", instance: "shop-web-01" }, body: { kind: "terminal", cols: 120, rows: 32 } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "connectPath": "example",
  "expiresAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "idleSecs": 0,
  "instance": "example",
  "kind": "terminal",
  "maxSecs": 0,
  "protocol": "example",
  "provider": "mock",
  "ticket": "example"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `instance_state_unknown`, `session_unavailable` |
| `429` | `too_many_sessions`, `rate_limited` |

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

**Response `200`** — Success.

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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/sessions/aafbdccd-b3ae-4141-90cd-18a8a9c0aa97" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("terminate_session", { params: { id: "aafbdccd-b3ae-4141-90cd-18a8a9c0aa97" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `404` | `not_found` |

