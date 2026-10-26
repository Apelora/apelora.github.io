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
      "id": 112,
      "at": "2026-10-26T01:11:12.855Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "alert.channel.delete",
      "target": "alert-channel:On-call webhook",
      "outcome": "success",
      "scope": null,
      "detail": {
        "enabled": true,
        "host": "hooks.example.invalid",
        "id": "15a6c2d8-09c8-446a-9a9a-14aea68b697d",
        "minSeverity": "critical",
        "name": "docs-verifier",
        "requestId": "fb74e3e0-889c-4b0b-b551-00dbb06ef811",
        "role": "fabric-admin",
        "secretRef": "APELORA_ALERT_SECRET_ONCALL"
      }
    },
    {
      "id": 111,
      "at": "2026-10-26T01:11:12.845853Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "alert.acknowledge",
      "target": "alert:2",
      "outcome": "success",
      "scope": null,
      "detail": {
        "name": "docs-verifier",
        "note": "Looking into the failed job",
        "requestId": "19322a4d-c602-4173-9e5e-9d717d486ad6",
        "role": "fabric-admin",
        "rule": "job-failures",
        "severity": "warning",
        "subject": "instance.restart"
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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit/export?format=csv&action=token.&from=2026-10-25T01%3A11%3A12Z" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: text/csv"
```

**TypeScript:**

```ts
const result = await client.request("audit_export", { query: { format: "csv" } });
```

**Response `200`** — The events: CSV with a header row, or one JSON object per line.

Content-Type: `text/csv`.

**Example response** from a test installation; your IDs, names and times differ. The first 4 of 114 lines.

```text
id,at,actor,actorName,actorType,action,target,outcome,requestId,scope,detail
113,2026-10-26T01:11:12.919731Z,token:docs-verifier,docs-verifier,token,audit.exported,audit,success,f68d7dae-cf25-48e1-95a8-421fec785861,,"{""filters"":{},""format"":""csv"",""name"":""docs-verifier"",""requestId"":""f68d7dae-cf25-48e1-95a8-421fec785861"",""role"":""fabric-admin""}"
112,2026-10-26T01:11:12.855Z,token:docs-verifier,docs-verifier,token,alert.channel.delete,alert-channel:On-call webhook,success,fb74e3e0-889c-4b0b-b551-00dbb06ef811,,"{""enabled"":true,""host"":""hooks.example.invalid"",""id"":""15a6c2d8-09c8-446a-9a9a-14aea68b697d"",""minSeverity"":""critical"",""name"":""docs-verifier"",""requestId"":""fb74e3e0-889c-4b0b-b551-00dbb06ef811"",""role"":""fabric-admin"",""secretRef"":""APELORA_ALERT_SECRET_ONCALL""}"
111,2026-10-26T01:11:12.845853Z,token:docs-verifier,docs-verifier,token,alert.acknowledge,alert:2,success,19322a4d-c602-4173-9e5e-9d717d486ad6,,"{""name"":""docs-verifier"",""note"":""Looking into the failed job"",""requestId"":""19322a4d-c602-4173-9e5e-9d717d486ad6"",""role"":""fabric-admin"",""rule"":""job-failures"",""severity"":""warning"",""subject"":""instance.restart""}"
```

Content-Type: `application/x-ndjson`.

**Example response** from a test installation; your IDs, names and times differ. The first 3 of 114 lines.

```text
{"id":114,"at":"2026-10-26T01:11:12.928759Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"jsonl","name":"docs-verifier","requestId":"8f94431c-562e-4383-ab22-0662c1997d56","role":"fabric-admin"}}
{"id":113,"at":"2026-10-26T01:11:12.919731Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"csv","name":"docs-verifier","requestId":"f68d7dae-cf25-48e1-95a8-421fec785861","role":"fabric-admin"}}
{"id":112,"at":"2026-10-26T01:11:12.855Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"alert.channel.delete","target":"alert-channel:On-call webhook","outcome":"success","scope":null,"detail":{"enabled":true,"host":"hooks.example.invalid","id":"15a6c2d8-09c8-446a-9a9a-14aea68b697d","minSeverity":"critical","name":"docs-verifier","requestId":"fb74e3e0-889c-4b0b-b551-00dbb06ef811","role":"fabric-admin","secretRef":"APELORA_ALERT_SECRET_ONCALL"}}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

