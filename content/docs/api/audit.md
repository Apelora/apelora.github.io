---
title: Audit API
section: api
slug: audit
order: 7
label: Audit
source: packages/api-client/openapi.json
summary: The audit log and its export.
---
The append-only audit log: search and export. This page lists 2 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/audit`](#get-apiv1audit) | Audit events the caller may read, newest first, filtered by actor, target, action prefix, outcome and time, and paged with `before`. |
| [`GET /api/v1/audit/export`](#get-apiv1auditexport) | Exports the audit events the caller may read, with the same filters as the list (`limit` does not apply), newest first, as CSV or JSON lines. |

## Details

### `GET /api/v1/audit`

Audit events the caller may read, newest first, filtered by actor, target, action prefix, outcome and time, and paged with `before`. Needs `audit.read` (platform-wide, or limited to the events of the caller's organisations, projects and applications) and a database.

**Operation ID:** `audit`

**Needs:** `audit.read` (platform-wide, or limited to the events of the caller's organisations, projects and applications) and a database.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `actor` | query | string | no | — | Who acted: their stable id (`user:<uuid>`, `service:<uuid>`, `token:<name>`) or, ignoring case, the name they had when they acted. |
| `target` | query | string | no | — | What was acted on, exactly as recorded (e.g. `local-account:ada` or a group's name). |
| `action` | query | string | no | — | Only actions starting with this, e.g. `role.` or `emergency_access.`. |
| `outcome` | query | string | no | — | `success`, `denied` or `failed`. |
| `from` | query | string | no | — | RFC 3339: events at or after this time. |
| `to` | query | string | no | — | RFC 3339: events before this time. |
| `before` | query | integer | no | — | Only events older than this id (paging: the id of the last event of the previous page). |
| `limit` | query | integer | no | `100` | Events per page, 1 to 500 (default 100). Not used by the export. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`action`, `outcome`, `limit`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit?action=application.&outcome=success&limit=5" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Next page:** repeat the request with `before` set to the `id` of the last item. A page shorter than `limit` is the last one.

**TypeScript:**

```ts
const result = await client.request("audit", { query: { action: "application.", outcome: "success", limit: 5 } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": 130,
      "at": "2026-10-28T20:01:35.24932Z",
      "actor": "user:68325b5f-5650-4daa-91e9-87673d9847dd",
      "actorType": "user",
      "actorName": "ada",
      "action": "session.request",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": {
        "application": "1fd1a7b8-9ab1-4301-a5d1-e5296d082924",
        "organization": "a7b3710b-14ea-4c7a-b05c-48950892c576",
        "project": "d0b31e5b-5666-4c6b-bf96-cc43501df6ce"
      },
      "detail": {
        "approval": "25f5e232-f814-4421-ab21-0ce8d36a410f",
        "kind": "terminal",
        "name": "ada",
        "requestId": "f11014f9-f9eb-4de8-b295-6bed9307adce",
        "session": "30efcc0f-7355-4a30-aec9-3b83b1e62c75"
      }
    },
    {
      "id": 129,
      "at": "2026-10-28T20:01:35.231241Z",
      "actor": "user:4b5de292-7305-4724-b550-188aaba3fa71",
      "actorType": "user",
      "actorName": "grace",
      "action": "approval.grant",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": null,
      "detail": {
        "action": "instance.console",
        "emergencyAccess": true,
        "id": "25f5e232-f814-4421-ab21-0ce8d36a410f",
        "name": "grace",
        "requestId": "02e4604f-c421-4f49-9e90-2821f354ec47",
        "requester": "user:68325b5f-5650-4daa-91e9-87673d9847dd"
      }
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/audit/export`

Exports the audit events the caller may read, with the same filters as the list (`limit` does not apply), newest first, as CSV or JSON lines. Streamed one database page at a time. Needs `audit.read`; the export itself is audited as `audit.exported` with its filters.

**Operation ID:** `audit_export`

**Needs:** `audit.read`; the export itself is audited as `audit.exported` with its filters.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `actor` | query | string | no | — | Who acted: their stable id (`user:<uuid>`, `service:<uuid>`, `token:<name>`) or, ignoring case, the name they had when they acted. |
| `target` | query | string | no | — | What was acted on, exactly as recorded (e.g. `local-account:ada` or a group's name). |
| `action` | query | string | no | — | Only actions starting with this, e.g. `role.` or `emergency_access.`. |
| `outcome` | query | string | no | — | `success`, `denied` or `failed`. |
| `from` | query | string | no | — | RFC 3339: events at or after this time. |
| `to` | query | string | no | — | RFC 3339: events before this time. |
| `before` | query | integer | no | — | Only events older than this id (paging: the id of the last event of the previous page). |
| `limit` | query | integer | no | `100` | Events per page, 1 to 500 (default 100). Not used by the export. |
| `format` | query | string | no | `jsonl` | `csv` or `jsonl` (one JSON object per line, as the list returns them). Default `jsonl`. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

For `text/csv`:

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit/export?format=csv" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: text/csv"
```

For `application/x-ndjson`:

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit/export?format=jsonl" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/x-ndjson"
```

**With options** (`action`, `from`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit/export?format=csv&action=token.&from=2026-10-27T20%3A01%3A35Z" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: text/csv"
```

**TypeScript:**

```ts
const result = await client.request("audit_export", { query: { format: "csv" } });
```

**Response `200`** — The events: CSV with a header row, or one JSON object per line.

Content-Type: `text/csv`.

**Example response** from a test installation; your IDs, names and times differ. The first 4 of 132 lines.

```text
id,at,actor,actorName,actorType,action,target,outcome,requestId,scope,detail
131,2026-10-28T20:01:35.288568Z,token:docs-verifier,docs-verifier,token,audit.exported,audit,success,13c25bdd-2010-4c26-8f13-d46d7a39d784,,"{""filters"":{},""format"":""csv"",""name"":""docs-verifier"",""requestId"":""13c25bdd-2010-4c26-8f13-d46d7a39d784"",""role"":""fabric-admin""}"
130,2026-10-28T20:01:35.24932Z,user:68325b5f-5650-4daa-91e9-87673d9847dd,ada,user,session.request,instance:shop/shop-db-01,success,f11014f9-f9eb-4de8-b295-6bed9307adce,"{""application"":""1fd1a7b8-9ab1-4301-a5d1-e5296d082924"",""organization"":""a7b3710b-14ea-4c7a-b05c-48950892c576"",""project"":""d0b31e5b-5666-4c6b-bf96-cc43501df6ce""}","{""approval"":""25f5e232-f814-4421-ab21-0ce8d36a410f"",""kind"":""terminal"",""name"":""ada"",""requestId"":""f11014f9-f9eb-4de8-b295-6bed9307adce"",""session"":""30efcc0f-7355-4a30-aec9-3b83b1e62c75""}"
129,2026-10-28T20:01:35.231241Z,user:4b5de292-7305-4724-b550-188aaba3fa71,grace,user,approval.grant,instance:shop/shop-db-01,success,02e4604f-c421-4f49-9e90-2821f354ec47,,"{""action"":""instance.console"",""emergencyAccess"":true,""id"":""25f5e232-f814-4421-ab21-0ce8d36a410f"",""name"":""grace"",""requestId"":""02e4604f-c421-4f49-9e90-2821f354ec47"",""requester"":""user:68325b5f-5650-4daa-91e9-87673d9847dd""}"
```

Content-Type: `application/x-ndjson`.

**Example response** from a test installation; your IDs, names and times differ. The first 3 of 132 lines.

```text
{"id":132,"at":"2026-10-28T20:01:35.297312Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"jsonl","name":"docs-verifier","requestId":"2a54ebb3-2c92-4f3d-95c9-c8ca2b7c72c7","role":"fabric-admin"}}
{"id":131,"at":"2026-10-28T20:01:35.288568Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"csv","name":"docs-verifier","requestId":"13c25bdd-2010-4c26-8f13-d46d7a39d784","role":"fabric-admin"}}
{"id":130,"at":"2026-10-28T20:01:35.24932Z","actor":"user:68325b5f-5650-4daa-91e9-87673d9847dd","actorType":"user","actorName":"ada","action":"session.request","target":"instance:shop/shop-db-01","outcome":"success","scope":{"application":"1fd1a7b8-9ab1-4301-a5d1-e5296d082924","organization":"a7b3710b-14ea-4c7a-b05c-48950892c576","project":"d0b31e5b-5666-4c6b-bf96-cc43501df6ce"},"detail":{"approval":"25f5e232-f814-4421-ab21-0ce8d36a410f","kind":"terminal","name":"ada","requestId":"f11014f9-f9eb-4de8-b295-6bed9307adce","session":"30efcc0f-7355-4a30-aec9-3b83b1e62c75"}}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

