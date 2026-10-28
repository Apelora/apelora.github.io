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
      "at": "2026-10-28T23:27:10.140545Z",
      "actor": "user:c9bef258-1dba-45cb-9d15-1a1231ded712",
      "actorType": "user",
      "actorName": "ada",
      "action": "session.request",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": {
        "application": "ba2bc39d-a895-44cf-88df-95f994325364",
        "organization": "14c169c3-7c7f-4898-9428-a78d1da537fe",
        "project": "deff5baa-28d1-4534-b980-108a88f9fa09"
      },
      "detail": {
        "approval": "34b33dd8-634d-4088-a3b0-0e503d6466c6",
        "kind": "terminal",
        "name": "ada",
        "requestId": "63493e0f-89a3-47b2-be74-1a0d960bdfcb",
        "session": "2521f680-76da-4290-bbce-c6b8739ba349"
      }
    },
    {
      "id": 129,
      "at": "2026-10-28T23:27:10.022023Z",
      "actor": "user:e99e9737-dc0f-47bf-ae49-3c27edc0b26a",
      "actorType": "user",
      "actorName": "grace",
      "action": "approval.grant",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": null,
      "detail": {
        "action": "instance.console",
        "emergencyAccess": true,
        "id": "34b33dd8-634d-4088-a3b0-0e503d6466c6",
        "name": "grace",
        "requestId": "4eb0dcb5-fe33-4ac1-9613-ae45ba8d18e2",
        "requester": "user:c9bef258-1dba-45cb-9d15-1a1231ded712"
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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit/export?format=csv&action=token.&from=2026-10-27T23%3A27%3A10Z" \
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
131,2026-10-28T23:27:10.307382Z,token:docs-verifier,docs-verifier,token,audit.exported,audit,success,91d2e502-167a-4ed0-8037-0b3754fe6271,,"{""filters"":{},""format"":""csv"",""name"":""docs-verifier"",""requestId"":""91d2e502-167a-4ed0-8037-0b3754fe6271"",""role"":""fabric-admin""}"
130,2026-10-28T23:27:10.140545Z,user:c9bef258-1dba-45cb-9d15-1a1231ded712,ada,user,session.request,instance:shop/shop-db-01,success,63493e0f-89a3-47b2-be74-1a0d960bdfcb,"{""application"":""ba2bc39d-a895-44cf-88df-95f994325364"",""organization"":""14c169c3-7c7f-4898-9428-a78d1da537fe"",""project"":""deff5baa-28d1-4534-b980-108a88f9fa09""}","{""approval"":""34b33dd8-634d-4088-a3b0-0e503d6466c6"",""kind"":""terminal"",""name"":""ada"",""requestId"":""63493e0f-89a3-47b2-be74-1a0d960bdfcb"",""session"":""2521f680-76da-4290-bbce-c6b8739ba349""}"
129,2026-10-28T23:27:10.022023Z,user:e99e9737-dc0f-47bf-ae49-3c27edc0b26a,grace,user,approval.grant,instance:shop/shop-db-01,success,4eb0dcb5-fe33-4ac1-9613-ae45ba8d18e2,,"{""action"":""instance.console"",""emergencyAccess"":true,""id"":""34b33dd8-634d-4088-a3b0-0e503d6466c6"",""name"":""grace"",""requestId"":""4eb0dcb5-fe33-4ac1-9613-ae45ba8d18e2"",""requester"":""user:c9bef258-1dba-45cb-9d15-1a1231ded712""}"
```

Content-Type: `application/x-ndjson`.

**Example response** from a test installation; your IDs, names and times differ. The first 3 of 132 lines.

```text
{"id":132,"at":"2026-10-28T23:27:10.341772Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"jsonl","name":"docs-verifier","requestId":"211306f9-2e7d-4f74-8335-9b09d2d841a1","role":"fabric-admin"}}
{"id":131,"at":"2026-10-28T23:27:10.307382Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"csv","name":"docs-verifier","requestId":"91d2e502-167a-4ed0-8037-0b3754fe6271","role":"fabric-admin"}}
{"id":130,"at":"2026-10-28T23:27:10.140545Z","actor":"user:c9bef258-1dba-45cb-9d15-1a1231ded712","actorType":"user","actorName":"ada","action":"session.request","target":"instance:shop/shop-db-01","outcome":"success","scope":{"application":"ba2bc39d-a895-44cf-88df-95f994325364","organization":"14c169c3-7c7f-4898-9428-a78d1da537fe","project":"deff5baa-28d1-4534-b980-108a88f9fa09"},"detail":{"approval":"34b33dd8-634d-4088-a3b0-0e503d6466c6","kind":"terminal","name":"ada","requestId":"63493e0f-89a3-47b2-be74-1a0d960bdfcb","session":"2521f680-76da-4290-bbce-c6b8739ba349"}}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

