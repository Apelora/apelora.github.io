---
title: Audit API
section: api
slug: audit
order: 7
label: Audit
source: packages/api-client/openapi.json
summary: The audit log and its export.
---
The append-only audit log: search and export. This page documents all 2 operations, each with a request you can copy. Set `APELORA_URL` and `APELORA_TOKEN` as described in [the API overview](/docs/api/overview/).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/audit`](#get-apiv1audit) | Audit events the caller may read, newest first, filtered by actor, target, action prefix, outcome and time, and paged with `before`. |
| [`GET /api/v1/audit/export`](#get-apiv1auditexport) | Exports the audit events the caller may read, with the same filters as the list (`limit` does not apply), newest first, as CSV or JSON lines. |

## Details

### `GET /api/v1/audit`

Audit events the caller may read, newest first, filtered by actor, target, action prefix, outcome and time, and paged with `before`.

**Needs:** `audit.read` (platform-wide, or limited to the events of the caller's organisations, projects and applications) and a database.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `actor` | query | string | no | Who acted: their stable id (`user:<uuid>`, `service:<uuid>`, `token:<name>`) or, ignoring case, the name they had when they acted. |
| `target` | query | string | no | What was acted on, exactly as recorded (e.g. `local-account:ada` or a group's name). |
| `action` | query | string | no | Only actions starting with this, e.g. `role.` or `emergency_access.`. |
| `outcome` | query | string | no | `success`, `denied` or `failed`. |
| `from` | query | string | no | RFC 3339: events at or after this time. |
| `to` | query | string | no | RFC 3339: events before this time. |
| `before` | query | integer | no | Only events older than this id (paging: the id of the last event of the previous page). |
| `limit` | query | integer | no | Events per page, 1 to 500 (default 100). Not used by the export. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/audit" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "action": "example",
      "actor": "example",
      "actorType": "example",
      "at": "2026-01-01T09:00:00Z",
      "detail": {},
      "id": 1,
      "outcome": "example",
      "target": "example",
      "actorName": "example",
      "scope": {}
    }
  ]
}
```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/audit/export`

Exports the audit events the caller may read, with the same filters as the list (`limit` does not apply), newest first, as CSV or JSON lines. Streamed one database page at a time.

**Needs:** `audit.read`; the export itself is audited as `audit.exported` with its filters.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `actor` | query | string | no | Who acted: their stable id (`user:<uuid>`, `service:<uuid>`, `token:<name>`) or, ignoring case, the name they had when they acted. |
| `target` | query | string | no | What was acted on, exactly as recorded (e.g. `local-account:ada` or a group's name). |
| `action` | query | string | no | Only actions starting with this, e.g. `role.` or `emergency_access.`. |
| `outcome` | query | string | no | `success`, `denied` or `failed`. |
| `from` | query | string | no | RFC 3339: events at or after this time. |
| `to` | query | string | no | RFC 3339: events before this time. |
| `before` | query | integer | no | Only events older than this id (paging: the id of the last event of the previous page). |
| `limit` | query | integer | no | Events per page, 1 to 500 (default 100). Not used by the export. |
| `format` | query | string | no | `csv` or `jsonl` (one JSON object per line, as the list returns them). Default `jsonl`. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/audit/export" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**, with no body.

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

