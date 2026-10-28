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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": 130,
      "at": "2026-10-28T21:24:19.354692Z",
      "actor": "user:6c57707e-01af-4d92-842e-6712151e369a",
      "actorType": "user",
      "actorName": "ada",
      "action": "session.request",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": {
        "application": "5a291a1e-9ece-4dc7-91af-ef01835cb68b",
        "organization": "d57c15f8-d7d9-4ecd-b436-5b4ebad12de5",
        "project": "4c7dfe7c-30df-4b68-a7cc-bd8aa3f2331a"
      },
      "detail": {
        "approval": "a39d69cc-13fe-4c4f-9552-5f8fed1729ed",
        "kind": "terminal",
        "name": "ada",
        "requestId": "b2aa90d5-c354-472c-80ff-8f01b0a9efb5",
        "session": "17ab06f7-bcf7-41b6-ad02-d64aba42145c"
      }
    },
    {
      "id": 129,
      "at": "2026-10-28T21:24:19.318959Z",
      "actor": "user:c3f5597b-dd8e-401b-9ca9-4e1dc6b730cd",
      "actorType": "user",
      "actorName": "grace",
      "action": "approval.grant",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": null,
      "detail": {
        "action": "instance.console",
        "emergencyAccess": true,
        "id": "a39d69cc-13fe-4c4f-9552-5f8fed1729ed",
        "name": "grace",
        "requestId": "76c471c8-e8c8-4f98-b31d-a4bc3f69dac3",
        "requester": "user:6c57707e-01af-4d92-842e-6712151e369a"
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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit/export?format=csv&action=token.&from=2026-10-27T21%3A24%3A19Z" \
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
131,2026-10-28T21:24:19.431124Z,token:docs-verifier,docs-verifier,token,audit.exported,audit,success,0b2086c2-417e-44ad-9e0f-3b543806d067,,"{""filters"":{},""format"":""csv"",""name"":""docs-verifier"",""requestId"":""0b2086c2-417e-44ad-9e0f-3b543806d067"",""role"":""fabric-admin""}"
130,2026-10-28T21:24:19.354692Z,user:6c57707e-01af-4d92-842e-6712151e369a,ada,user,session.request,instance:shop/shop-db-01,success,b2aa90d5-c354-472c-80ff-8f01b0a9efb5,"{""application"":""5a291a1e-9ece-4dc7-91af-ef01835cb68b"",""organization"":""d57c15f8-d7d9-4ecd-b436-5b4ebad12de5"",""project"":""4c7dfe7c-30df-4b68-a7cc-bd8aa3f2331a""}","{""approval"":""a39d69cc-13fe-4c4f-9552-5f8fed1729ed"",""kind"":""terminal"",""name"":""ada"",""requestId"":""b2aa90d5-c354-472c-80ff-8f01b0a9efb5"",""session"":""17ab06f7-bcf7-41b6-ad02-d64aba42145c""}"
129,2026-10-28T21:24:19.318959Z,user:c3f5597b-dd8e-401b-9ca9-4e1dc6b730cd,grace,user,approval.grant,instance:shop/shop-db-01,success,76c471c8-e8c8-4f98-b31d-a4bc3f69dac3,,"{""action"":""instance.console"",""emergencyAccess"":true,""id"":""a39d69cc-13fe-4c4f-9552-5f8fed1729ed"",""name"":""grace"",""requestId"":""76c471c8-e8c8-4f98-b31d-a4bc3f69dac3"",""requester"":""user:6c57707e-01af-4d92-842e-6712151e369a""}"
```

Content-Type: `application/x-ndjson`.

**Example response** from a test installation; your IDs, names and times differ. The first 3 of 132 lines.

```text
{"id":132,"at":"2026-10-28T21:24:19.445652Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"jsonl","name":"docs-verifier","requestId":"b64128fb-f6fa-4710-acce-6d1a6b3c1d69","role":"fabric-admin"}}
{"id":131,"at":"2026-10-28T21:24:19.431124Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"csv","name":"docs-verifier","requestId":"0b2086c2-417e-44ad-9e0f-3b543806d067","role":"fabric-admin"}}
{"id":130,"at":"2026-10-28T21:24:19.354692Z","actor":"user:6c57707e-01af-4d92-842e-6712151e369a","actorType":"user","actorName":"ada","action":"session.request","target":"instance:shop/shop-db-01","outcome":"success","scope":{"application":"5a291a1e-9ece-4dc7-91af-ef01835cb68b","organization":"d57c15f8-d7d9-4ecd-b436-5b4ebad12de5","project":"4c7dfe7c-30df-4b68-a7cc-bd8aa3f2331a"},"detail":{"approval":"a39d69cc-13fe-4c4f-9552-5f8fed1729ed","kind":"terminal","name":"ada","requestId":"b2aa90d5-c354-472c-80ff-8f01b0a9efb5","session":"17ab06f7-bcf7-41b6-ad02-d64aba42145c"}}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

