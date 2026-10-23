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

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json). Examples: **MOCK VERIFIED** (tested with simulated inventory); **Illustrative** (schema values).

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/audit" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "items": [
    {
      "id": 7,
      "at": "2026-10-23T22:12:58.096314Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "application.update",
      "target": "shop",
      "outcome": "success",
      "scope": {
        "application": "12c29329-0276-49bb-82ef-30d9b762e934",
        "organization": "a80a1413-41a1-498f-868b-c384cf72acc5",
        "project": "97016fb6-2ad8-4399-a986-73ddc9c88a1b"
      },
      "detail": {
        "descriptionChanged": true,
        "icon": null,
        "name": "docs-verifier",
        "requestId": "b506adbf-1f44-44f1-9fdd-f4a237fbc9fb",
        "role": "fabric-admin"
      }
    },
    {
      "id": 6,
      "at": "2026-10-23T22:12:58.07016Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "application.create",
      "target": "shop",
      "outcome": "success",
      "scope": {
        "application": "12c29329-0276-49bb-82ef-30d9b762e934",
        "organization": "a80a1413-41a1-498f-868b-c384cf72acc5",
        "project": "97016fb6-2ad8-4399-a986-73ddc9c88a1b"
      },
      "detail": {
        "environment": "development",
        "icon": "box",
        "name": "docs-verifier",
        "requestId": "ce7d29a7-7af8-4f3c-82d4-753d0f1e3b44",
        "role": "fabric-admin"
      }
    },
    {
      "id": 5,
      "at": "2026-10-23T22:12:58.053402Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "environment.incus_project.prepare",
      "target": "docs-org-docs-project-development",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "a80a1413-41a1-498f-868b-c384cf72acc5",
        "project": "97016fb6-2ad8-4399-a986-73ddc9c88a1b"
      },
      "detail": {
        "detail": "Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions",
        "environment": "900a36cf-8241-4afe-8ad4-6a84215a0ca0",
        "incusProject": "docs-org-docs-project-development",
        "name": "docs-verifier",
        "requestId": "63b88940-26ab-4746-9d93-6d16daa4185f",
        "role": "fabric-admin",
        "state": "created"
      }
    },
    {
      "id": 4,
      "at": "2026-10-23T22:12:58.044297Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "environment.create",
      "target": "development",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "a80a1413-41a1-498f-868b-c384cf72acc5",
        "project": "97016fb6-2ad8-4399-a986-73ddc9c88a1b"
      },
      "detail": {
        "chosenByPlatformAdmin": false,
        "id": "900a36cf-8241-4afe-8ad4-6a84215a0ca0",
        "incusProject": "docs-org-docs-project-development",
        "kind": "development",
        "name": "docs-verifier",
        "requestId": "63b88940-26ab-4746-9d93-6d16daa4185f",
        "role": "fabric-admin"
      }
    },
    {
      "id": 3,
      "at": "2026-10-23T22:12:58.035041Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "project.create",
      "target": "docs-project",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "a80a1413-41a1-498f-868b-c384cf72acc5",
        "project": "97016fb6-2ad8-4399-a986-73ddc9c88a1b"
      },
      "detail": {
        "id": "97016fb6-2ad8-4399-a986-73ddc9c88a1b",
        "name": "docs-verifier",
        "requestId": "dd830a57-2b2f-4cab-83d3-b0b388be41f7",
        "role": "fabric-admin"
      }
    },
    {
      "id": 2,
      "at": "2026-10-23T22:12:58.027752Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "organization.create",
      "target": "docs-org",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "a80a1413-41a1-498f-868b-c384cf72acc5",
        "project": null
      },
      "detail": {
        "id": "a80a1413-41a1-498f-868b-c384cf72acc5",
        "name": "docs-verifier",
        "requestId": "fc76307c-6b33-4283-9577-d955bde88747",
        "role": "fabric-admin"
      }
    },
    {
      "id": 1,
      "at": "2026-10-23T22:12:57.869616Z",
      "actor": "cli",
      "actorType": "cli",
      "actorName": null,
      "action": "token.create",
      "target": "docs-verifier",
      "outcome": "success",
      "scope": null,
      "detail": {
        "expiresInDays": 1,
        "id": "6b690d3b-520d-475c-8bcb-d864a40731f5",
        "role": "fabric-admin"
      }
    }
  ]
}
```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/audit/export`

Exports the audit events the caller may read, with the same filters as the list (`limit` does not apply), newest first, as CSV or JSON lines. Streamed one database page at a time. Needs `audit.read`; the export itself is audited as `audit.exported` with its filters.

**Operation ID:** `audit_export`

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

**Response `200`** — The events: CSV with a header row, or one JSON object per line.

Content-Type: `text/csv`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```text
id,at,actor,actorName,actorType,action,target,outcome,requestId,scope,detail
8,2026-10-23T22:12:58.144004Z,token:docs-verifier,docs-verifier,token,audit.exported,audit,success,b8575702-952d-49a4-8a03-b1e1cbde287f,,"{""filters"":{},""format"":""csv"",""name"":""docs-verifier"",""requestId"":""b8575702-952d-49a4-8a03-b1e1cbde287f"",""role"":""fabric-admin""}"
7,2026-10-23T22:12:58.096314Z,token:docs-verifier,docs-verifier,token,application.update,shop,success,b506adbf-1f44-44f1-9fdd-f4a237fbc9fb,"{""application"":""12c29329-0276-49bb-82ef-30d9b762e934"",""organization"":""a80a1413-41a1-498f-868b-c384cf72acc5"",""project"":""97016fb6-2ad8-4399-a986-73ddc9c88a1b""}","{""descriptionChanged"":true,""icon"":null,""name"":""docs-verifier"",""requestId"":""b506adbf-1f44-44f1-9fdd-f4a237fbc9fb"",""role"":""fabric-admin""}"
6,2026-10-23T22:12:58.07016Z,token:docs-verifier,docs-verifier,token,application.create,shop,success,ce7d29a7-7af8-4f3c-82d4-753d0f1e3b44,"{""application"":""12c29329-0276-49bb-82ef-30d9b762e934"",""organization"":""a80a1413-41a1-498f-868b-c384cf72acc5"",""project"":""97016fb6-2ad8-4399-a986-73ddc9c88a1b""}","{""environment"":""development"",""icon"":""box"",""name"":""docs-verifier"",""requestId"":""ce7d29a7-7af8-4f3c-82d4-753d0f1e3b44"",""role"":""fabric-admin""}"
5,2026-10-23T22:12:58.053402Z,token:docs-verifier,docs-verifier,token,environment.incus_project.prepare,docs-org-docs-project-development,success,63b88940-26ab-4746-9d93-6d16daa4185f,"{""application"":null,""organization"":""a80a1413-41a1-498f-868b-c384cf72acc5"",""project"":""97016fb6-2ad8-4399-a986-73ddc9c88a1b""}","{""detail"":""Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions"",""environment"":""900a36cf-8241-4afe-8ad4-6a84215a0ca0"",""incusProject"":""docs-org-docs-project-development"",""name"":""docs-verifier"",""requestId"":""63b88940-26ab-4746-9d93-6d16daa4185f"",""role"":""fabric-admin"",""state"":""created""}"
4,2026-10-23T22:12:58.044297Z,token:docs-verifier,docs-verifier,token,environment.create,development,success,63b88940-26ab-4746-9d93-6d16daa4185f,"{""application"":null,""organization"":""a80a1413-41a1-498f-868b-c384cf72acc5"",""project"":""97016fb6-2ad8-4399-a986-73ddc9c88a1b""}","{""chosenByPlatformAdmin"":false,""id"":""900a36cf-8241-4afe-8ad4-6a84215a0ca0"",""incusProject"":""docs-org-docs-project-development"",""kind"":""development"",""name"":""docs-verifier"",""requestId"":""63b88940-26ab-4746-9d93-6d16daa4185f"",""role"":""fabric-admin""}"
3,2026-10-23T22:12:58.035041Z,token:docs-verifier,docs-verifier,token,project.create,docs-project,success,dd830a57-2b2f-4cab-83d3-b0b388be41f7,"{""application"":null,""organization"":""a80a1413-41a1-498f-868b-c384cf72acc5"",""project"":""97016fb6-2ad8-4399-a986-73ddc9c88a1b""}","{""id"":""97016fb6-2ad8-4399-a986-73ddc9c88a1b"",""name"":""docs-verifier"",""requestId"":""dd830a57-2b2f-4cab-83d3-b0b388be41f7"",""role"":""fabric-admin""}"
2,2026-10-23T22:12:58.027752Z,token:docs-verifier,docs-verifier,token,organization.create,docs-org,success,fc76307c-6b33-4283-9577-d955bde88747,"{""application"":null,""organization"":""a80a1413-41a1-498f-868b-c384cf72acc5"",""project"":null}","{""id"":""a80a1413-41a1-498f-868b-c384cf72acc5"",""name"":""docs-verifier"",""requestId"":""fc76307c-6b33-4283-9577-d955bde88747"",""role"":""fabric-admin""}"
1,2026-10-23T22:12:57.869616Z,cli,,cli,token.create,docs-verifier,success,,,"{""expiresInDays"":1,""id"":""6b690d3b-520d-475c-8bcb-d864a40731f5"",""role"":""fabric-admin""}"

```

Content-Type: `application/x-ndjson`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```text
{"id":9,"at":"2026-10-23T22:12:58.15154Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"jsonl","name":"docs-verifier","requestId":"a3c46067-556b-431b-9e61-7b6f06c107ec","role":"fabric-admin"}}
{"id":8,"at":"2026-10-23T22:12:58.144004Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"csv","name":"docs-verifier","requestId":"b8575702-952d-49a4-8a03-b1e1cbde287f","role":"fabric-admin"}}
{"id":7,"at":"2026-10-23T22:12:58.096314Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"application.update","target":"shop","outcome":"success","scope":{"application":"12c29329-0276-49bb-82ef-30d9b762e934","organization":"a80a1413-41a1-498f-868b-c384cf72acc5","project":"97016fb6-2ad8-4399-a986-73ddc9c88a1b"},"detail":{"descriptionChanged":true,"icon":null,"name":"docs-verifier","requestId":"b506adbf-1f44-44f1-9fdd-f4a237fbc9fb","role":"fabric-admin"}}
{"id":6,"at":"2026-10-23T22:12:58.07016Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"application.create","target":"shop","outcome":"success","scope":{"application":"12c29329-0276-49bb-82ef-30d9b762e934","organization":"a80a1413-41a1-498f-868b-c384cf72acc5","project":"97016fb6-2ad8-4399-a986-73ddc9c88a1b"},"detail":{"environment":"development","icon":"box","name":"docs-verifier","requestId":"ce7d29a7-7af8-4f3c-82d4-753d0f1e3b44","role":"fabric-admin"}}
{"id":5,"at":"2026-10-23T22:12:58.053402Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"environment.incus_project.prepare","target":"docs-org-docs-project-development","outcome":"success","scope":{"application":null,"organization":"a80a1413-41a1-498f-868b-c384cf72acc5","project":"97016fb6-2ad8-4399-a986-73ddc9c88a1b"},"detail":{"detail":"Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions","environment":"900a36cf-8241-4afe-8ad4-6a84215a0ca0","incusProject":"docs-org-docs-project-development","name":"docs-verifier","requestId":"63b88940-26ab-4746-9d93-6d16daa4185f","role":"fabric-admin","state":"created"}}
{"id":4,"at":"2026-10-23T22:12:58.044297Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"environment.create","target":"development","outcome":"success","scope":{"application":null,"organization":"a80a1413-41a1-498f-868b-c384cf72acc5","project":"97016fb6-2ad8-4399-a986-73ddc9c88a1b"},"detail":{"chosenByPlatformAdmin":false,"id":"900a36cf-8241-4afe-8ad4-6a84215a0ca0","incusProject":"docs-org-docs-project-development","kind":"development","name":"docs-verifier","requestId":"63b88940-26ab-4746-9d93-6d16daa4185f","role":"fabric-admin"}}
{"id":3,"at":"2026-10-23T22:12:58.035041Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"project.create","target":"docs-project","outcome":"success","scope":{"application":null,"organization":"a80a1413-41a1-498f-868b-c384cf72acc5","project":"97016fb6-2ad8-4399-a986-73ddc9c88a1b"},"detail":{"id":"97016fb6-2ad8-4399-a986-73ddc9c88a1b","name":"docs-verifier","requestId":"dd830a57-2b2f-4cab-83d3-b0b388be41f7","role":"fabric-admin"}}
{"id":2,"at":"2026-10-23T22:12:58.027752Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"organization.create","target":"docs-org","outcome":"success","scope":{"application":null,"organization":"a80a1413-41a1-498f-868b-c384cf72acc5","project":null},"detail":{"id":"a80a1413-41a1-498f-868b-c384cf72acc5","name":"docs-verifier","requestId":"fc76307c-6b33-4283-9577-d955bde88747","role":"fabric-admin"}}
{"id":1,"at":"2026-10-23T22:12:57.869616Z","actor":"cli","actorType":"cli","actorName":null,"action":"token.create","target":"docs-verifier","outcome":"success","scope":null,"detail":{"expiresInDays":1,"id":"6b690d3b-520d-475c-8bcb-d864a40731f5","role":"fabric-admin"}}

```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

