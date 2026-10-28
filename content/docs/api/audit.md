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
| [`GET /api/v1/audit`](#get-apiv1audit) | Audit events the caller may read, newest first, filtered by actor, target, action prefix, outcome and time, and paged with `after` and `next`. |
| [`GET /api/v1/audit/export`](#get-apiv1auditexport) | Exports the audit events the caller may read, with the same filters as the list (`limit` does not apply), newest first, as CSV or JSON lines. |

## Details

### `GET /api/v1/audit`

Audit events the caller may read, newest first, filtered by actor, target, action prefix, outcome and time, and paged with `after` and `next`. Needs `audit.read` (platform-wide, or limited to the events of the caller's organisations, projects and applications) and a database.

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
| `after` | query | string | no | — | Paging: the `next` of the previous page. |
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

**Next page:** repeat the request with `after` set to the response's `next`. The last page has no `next`.

**TypeScript:**

```ts
const result = await client.request("audit", { query: { action: "application.", outcome: "success", limit: 5 } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": 130,
      "at": "2026-10-28T22:51:26.983968Z",
      "actor": "user:d3dea878-2d2a-4710-af99-6bf13728a161",
      "actorType": "user",
      "actorName": "ada",
      "action": "session.request",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": {
        "application": "9c2b8220-029b-44ef-9ede-79269c0e316b",
        "organization": "8a36e3d8-344d-4c6d-85c8-2d0a5e13bff6",
        "project": "0e64d3ef-1020-41d9-a96e-821b3b45cf04"
      },
      "detail": {
        "approval": "81678c81-dfdb-4e1e-be3c-955a4f04384d",
        "kind": "terminal",
        "name": "ada",
        "requestId": "3299c5c9-ad02-4252-89b8-94bdee62b338",
        "session": "9db6075c-470f-4d3a-873e-0f203d4c86e9"
      }
    },
    {
      "id": 129,
      "at": "2026-10-28T22:51:26.9424Z",
      "actor": "user:0b9f0e2b-cc6b-4ea3-9540-0d2e5e75d368",
      "actorType": "user",
      "actorName": "grace",
      "action": "approval.grant",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": null,
      "detail": {
        "action": "instance.console",
        "emergencyAccess": true,
        "id": "81678c81-dfdb-4e1e-be3c-955a4f04384d",
        "name": "grace",
        "requestId": "1c852951-c130-4ba4-935a-8f1c9a5c1dd2",
        "requester": "user:d3dea878-2d2a-4710-af99-6bf13728a161"
      }
    }
  ],
  "next": "31"
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
| `after` | query | string | no | — | Paging: the `next` of the previous page. |
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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit/export?format=csv&action=token.&from=2026-10-27T22%3A51%3A27Z" \
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
131,2026-10-28T22:51:27.054326Z,token:docs-verifier,docs-verifier,token,audit.exported,audit,success,5adb3251-1d7d-4985-bef3-f90399ee0ae8,,"{""filters"":{},""format"":""csv"",""name"":""docs-verifier"",""requestId"":""5adb3251-1d7d-4985-bef3-f90399ee0ae8"",""role"":""fabric-admin""}"
130,2026-10-28T22:51:26.983968Z,user:d3dea878-2d2a-4710-af99-6bf13728a161,ada,user,session.request,instance:shop/shop-db-01,success,3299c5c9-ad02-4252-89b8-94bdee62b338,"{""application"":""9c2b8220-029b-44ef-9ede-79269c0e316b"",""organization"":""8a36e3d8-344d-4c6d-85c8-2d0a5e13bff6"",""project"":""0e64d3ef-1020-41d9-a96e-821b3b45cf04""}","{""approval"":""81678c81-dfdb-4e1e-be3c-955a4f04384d"",""kind"":""terminal"",""name"":""ada"",""requestId"":""3299c5c9-ad02-4252-89b8-94bdee62b338"",""session"":""9db6075c-470f-4d3a-873e-0f203d4c86e9""}"
129,2026-10-28T22:51:26.9424Z,user:0b9f0e2b-cc6b-4ea3-9540-0d2e5e75d368,grace,user,approval.grant,instance:shop/shop-db-01,success,1c852951-c130-4ba4-935a-8f1c9a5c1dd2,,"{""action"":""instance.console"",""emergencyAccess"":true,""id"":""81678c81-dfdb-4e1e-be3c-955a4f04384d"",""name"":""grace"",""requestId"":""1c852951-c130-4ba4-935a-8f1c9a5c1dd2"",""requester"":""user:d3dea878-2d2a-4710-af99-6bf13728a161""}"
```

Content-Type: `application/x-ndjson`.

**Example response** from a test installation; your IDs, names and times differ. The first 3 of 132 lines.

```text
{"id":132,"at":"2026-10-28T22:51:27.067501Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"jsonl","name":"docs-verifier","requestId":"5a7b1396-ea0e-47b7-a6a3-a1c7af79cee2","role":"fabric-admin"}}
{"id":131,"at":"2026-10-28T22:51:27.054326Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"csv","name":"docs-verifier","requestId":"5adb3251-1d7d-4985-bef3-f90399ee0ae8","role":"fabric-admin"}}
{"id":130,"at":"2026-10-28T22:51:26.983968Z","actor":"user:d3dea878-2d2a-4710-af99-6bf13728a161","actorType":"user","actorName":"ada","action":"session.request","target":"instance:shop/shop-db-01","outcome":"success","scope":{"application":"9c2b8220-029b-44ef-9ede-79269c0e316b","organization":"8a36e3d8-344d-4c6d-85c8-2d0a5e13bff6","project":"0e64d3ef-1020-41d9-a96e-821b3b45cf04"},"detail":{"approval":"81678c81-dfdb-4e1e-be3c-955a4f04384d","kind":"terminal","name":"ada","requestId":"3299c5c9-ad02-4252-89b8-94bdee62b338","session":"9db6075c-470f-4d3a-873e-0f203d4c86e9"}}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

