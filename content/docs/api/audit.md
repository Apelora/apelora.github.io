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
      "at": "2026-10-26T18:15:16.361293Z",
      "actor": "user:afb7ba87-5522-4d55-833a-138d795b7037",
      "actorType": "user",
      "actorName": "ada",
      "action": "session.request",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": {
        "application": "ff56d12a-2194-4f20-94e5-c224200179a8",
        "organization": "e0a97f4d-0a7d-40f3-b19f-de3548b8eba8",
        "project": "ae6cbd38-e2e7-4ff3-8ab6-e1e77216a063"
      },
      "detail": {
        "approval": "cf2c7e7f-e1bb-49dd-a92c-9479eeaf5125",
        "kind": "terminal",
        "name": "ada",
        "requestId": "8c4a35f4-3cdc-4baa-958d-90f271faef0c",
        "session": "8732e470-6d14-4fe1-80e9-8a99502e0a18"
      }
    },
    {
      "id": 129,
      "at": "2026-10-26T18:15:16.345876Z",
      "actor": "user:e2617b76-d2e8-481e-8a91-b87eed87403a",
      "actorType": "user",
      "actorName": "grace",
      "action": "approval.grant",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": null,
      "detail": {
        "action": "instance.console",
        "emergencyAccess": true,
        "id": "cf2c7e7f-e1bb-49dd-a92c-9479eeaf5125",
        "name": "grace",
        "requestId": "46cc0647-bb6b-4e1a-939c-9e8449b0d755",
        "requester": "user:afb7ba87-5522-4d55-833a-138d795b7037"
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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit/export?format=csv&action=token.&from=2026-10-25T18%3A15%3A16Z" \
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
131,2026-10-26T18:15:16.405626Z,token:docs-verifier,docs-verifier,token,audit.exported,audit,success,74898f10-bbd7-44fb-af53-17a8ce27b151,,"{""filters"":{},""format"":""csv"",""name"":""docs-verifier"",""requestId"":""74898f10-bbd7-44fb-af53-17a8ce27b151"",""role"":""fabric-admin""}"
130,2026-10-26T18:15:16.361293Z,user:afb7ba87-5522-4d55-833a-138d795b7037,ada,user,session.request,instance:shop/shop-db-01,success,8c4a35f4-3cdc-4baa-958d-90f271faef0c,"{""application"":""ff56d12a-2194-4f20-94e5-c224200179a8"",""organization"":""e0a97f4d-0a7d-40f3-b19f-de3548b8eba8"",""project"":""ae6cbd38-e2e7-4ff3-8ab6-e1e77216a063""}","{""approval"":""cf2c7e7f-e1bb-49dd-a92c-9479eeaf5125"",""kind"":""terminal"",""name"":""ada"",""requestId"":""8c4a35f4-3cdc-4baa-958d-90f271faef0c"",""session"":""8732e470-6d14-4fe1-80e9-8a99502e0a18""}"
129,2026-10-26T18:15:16.345876Z,user:e2617b76-d2e8-481e-8a91-b87eed87403a,grace,user,approval.grant,instance:shop/shop-db-01,success,46cc0647-bb6b-4e1a-939c-9e8449b0d755,,"{""action"":""instance.console"",""emergencyAccess"":true,""id"":""cf2c7e7f-e1bb-49dd-a92c-9479eeaf5125"",""name"":""grace"",""requestId"":""46cc0647-bb6b-4e1a-939c-9e8449b0d755"",""requester"":""user:afb7ba87-5522-4d55-833a-138d795b7037""}"
```

Content-Type: `application/x-ndjson`.

**Example response** from a test installation; your IDs, names and times differ. The first 3 of 132 lines.

```text
{"id":132,"at":"2026-10-26T18:15:16.41456Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"jsonl","name":"docs-verifier","requestId":"9cb4795b-616f-4853-99de-a8a87a8bc767","role":"fabric-admin"}}
{"id":131,"at":"2026-10-26T18:15:16.405626Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"csv","name":"docs-verifier","requestId":"74898f10-bbd7-44fb-af53-17a8ce27b151","role":"fabric-admin"}}
{"id":130,"at":"2026-10-26T18:15:16.361293Z","actor":"user:afb7ba87-5522-4d55-833a-138d795b7037","actorType":"user","actorName":"ada","action":"session.request","target":"instance:shop/shop-db-01","outcome":"success","scope":{"application":"ff56d12a-2194-4f20-94e5-c224200179a8","organization":"e0a97f4d-0a7d-40f3-b19f-de3548b8eba8","project":"ae6cbd38-e2e7-4ff3-8ab6-e1e77216a063"},"detail":{"approval":"cf2c7e7f-e1bb-49dd-a92c-9479eeaf5125","kind":"terminal","name":"ada","requestId":"8c4a35f4-3cdc-4baa-958d-90f271faef0c","session":"8732e470-6d14-4fe1-80e9-8a99502e0a18"}}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

