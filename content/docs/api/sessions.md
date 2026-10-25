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

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/access" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "idleSecs": 0,
  "items": [
    {
      "guestOs": "linux",
      "instance": "example",
      "kinds": [
        {
          "allowed": false,
          "approvalRequired": false,
          "kind": "terminal",
          "reason": "example"
        }
      ],
      "module": "example",
      "status": "example"
    }
  ],
  "maxSecs": 0,
  "observed": false,
  "provider": "mock"
}
```

**Errors:** `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/instances/{instance}/sessions`

Opens a session: checks the caller, the instance and the approval rule, and answers with a single-use ticket for the websocket. Needs `instance.console` (terminal, PowerShell) or `instance.desktop` (RDP) on the application; in production also an approval (`Apelora-Approval: <id>`) of `instance.console` on `instance:<application>/<instance>`.

**Operation ID:** `open_session`

**Needs:** `instance.console` (terminal, PowerShell) or `instance.desktop` (RDP) on the application; in production also an approval (`Apelora-Approval: <id>`) of `instance.console` on `instance:<application>/<instance>`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `instance` | path | string | yes | Instance name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `cols` | integer | no | — |
| `kind` | `terminal`, `powershell`, `rdp` | yes | What a person can open on a module. |
| `rows` | integer | no | — |

```json
{
  "kind": "terminal"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/instances/web-01/sessions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"kind":"terminal"}'
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

**Errors:** `400`, `403`, `404`, `409`, `429`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors:** `401`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/sessions/{id}`

Ends a session now. Allowed for the person who has it and for whoever may operate its application. Anything else answers 404.

**Operation ID:** `terminate_session`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Session id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/sessions/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `404`. The body is `{ "error": { "code": …, "message": … } }`.

