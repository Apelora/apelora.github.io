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

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": 7,
      "at": "2026-10-25T15:45:26.245229Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "application.update",
      "target": "shop",
      "outcome": "success",
      "scope": {
        "application": "2b123d49-d55a-40f8-b166-11cdf5682888",
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "descriptionChanged": true,
        "icon": null,
        "name": "docs-verifier",
        "requestId": "43851f2a-79c5-4d4f-83b3-5135a8eec01f",
        "role": "fabric-admin"
      }
    },
    {
      "id": 6,
      "at": "2026-10-25T15:45:26.208646Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "application.create",
      "target": "shop",
      "outcome": "success",
      "scope": {
        "application": "2b123d49-d55a-40f8-b166-11cdf5682888",
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "environment": "development",
        "icon": "box",
        "name": "docs-verifier",
        "requestId": "7cb9b6bf-01ad-4cc7-81bf-8ddd65b03a44",
        "role": "fabric-admin"
      }
    },
    {
      "id": 5,
      "at": "2026-10-25T15:45:26.189916Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "environment.incus_project.prepare",
      "target": "docs-org-docs-project-development",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "detail": "Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions",
        "environment": "dabff187-1aab-4289-8c16-d72e656f93b4",
        "incusProject": "docs-org-docs-project-development",
        "name": "docs-verifier",
        "requestId": "f158561e-ff0e-48f2-b85c-d132ba167da5",
        "role": "fabric-admin",
        "state": "created"
      }
    },
    {
      "id": 4,
      "at": "2026-10-25T15:45:26.178648Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "environment.create",
      "target": "development",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "chosenByPlatformAdmin": false,
        "id": "dabff187-1aab-4289-8c16-d72e656f93b4",
        "incusProject": "docs-org-docs-project-development",
        "kind": "development",
        "name": "docs-verifier",
        "requestId": "f158561e-ff0e-48f2-b85c-d132ba167da5",
        "role": "fabric-admin"
      }
    },
    {
      "id": 3,
      "at": "2026-10-25T15:45:26.165897Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "project.create",
      "target": "docs-project",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "id": "69c3851c-6d02-4784-9bdc-17f7c449d59d",
        "name": "docs-verifier",
        "requestId": "b11c8b7d-570a-421c-8ffd-f4af9085e4cd",
        "role": "fabric-admin"
      }
    },
    {
      "id": 2,
      "at": "2026-10-25T15:45:26.158353Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "organization.create",
      "target": "docs-org",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": null
      },
      "detail": {
        "id": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "name": "docs-verifier",
        "requestId": "385c9d8c-f6e8-4108-b830-b79c2ad0c9cb",
        "role": "fabric-admin"
      }
    },
    {
      "id": 1,
      "at": "2026-10-25T15:45:26.003476Z",
      "actor": "cli",
      "actorType": "cli",
      "actorName": null,
      "action": "token.create",
      "target": "docs-verifier",
      "outcome": "success",
      "scope": null,
      "detail": {
        "expiresInDays": 1,
        "id": "726a0075-6258-4585-8ce7-60c829d0b7fc",
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

**Example response** from a test installation; your IDs, names and times differ.

```text
id,at,actor,actorName,actorType,action,target,outcome,requestId,scope,detail
8,2026-10-25T15:45:26.301188Z,token:docs-verifier,docs-verifier,token,audit.exported,audit,success,f40becf0-a989-46f6-9f13-205b79aadee9,,"{""filters"":{},""format"":""csv"",""name"":""docs-verifier"",""requestId"":""f40becf0-a989-46f6-9f13-205b79aadee9"",""role"":""fabric-admin""}"
7,2026-10-25T15:45:26.245229Z,token:docs-verifier,docs-verifier,token,application.update,shop,success,43851f2a-79c5-4d4f-83b3-5135a8eec01f,"{""application"":""2b123d49-d55a-40f8-b166-11cdf5682888"",""organization"":""9542a736-cc45-4015-98a8-f3206b0451b9"",""project"":""69c3851c-6d02-4784-9bdc-17f7c449d59d""}","{""descriptionChanged"":true,""icon"":null,""name"":""docs-verifier"",""requestId"":""43851f2a-79c5-4d4f-83b3-5135a8eec01f"",""role"":""fabric-admin""}"
6,2026-10-25T15:45:26.208646Z,token:docs-verifier,docs-verifier,token,application.create,shop,success,7cb9b6bf-01ad-4cc7-81bf-8ddd65b03a44,"{""application"":""2b123d49-d55a-40f8-b166-11cdf5682888"",""organization"":""9542a736-cc45-4015-98a8-f3206b0451b9"",""project"":""69c3851c-6d02-4784-9bdc-17f7c449d59d""}","{""environment"":""development"",""icon"":""box"",""name"":""docs-verifier"",""requestId"":""7cb9b6bf-01ad-4cc7-81bf-8ddd65b03a44"",""role"":""fabric-admin""}"
5,2026-10-25T15:45:26.189916Z,token:docs-verifier,docs-verifier,token,environment.incus_project.prepare,docs-org-docs-project-development,success,f158561e-ff0e-48f2-b85c-d132ba167da5,"{""application"":null,""organization"":""9542a736-cc45-4015-98a8-f3206b0451b9"",""project"":""69c3851c-6d02-4784-9bdc-17f7c449d59d""}","{""detail"":""Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions"",""environment"":""dabff187-1aab-4289-8c16-d72e656f93b4"",""incusProject"":""docs-org-docs-project-development"",""name"":""docs-verifier"",""requestId"":""f158561e-ff0e-48f2-b85c-d132ba167da5"",""role"":""fabric-admin"",""state"":""created""}"
4,2026-10-25T15:45:26.178648Z,token:docs-verifier,docs-verifier,token,environment.create,development,success,f158561e-ff0e-48f2-b85c-d132ba167da5,"{""application"":null,""organization"":""9542a736-cc45-4015-98a8-f3206b0451b9"",""project"":""69c3851c-6d02-4784-9bdc-17f7c449d59d""}","{""chosenByPlatformAdmin"":false,""id"":""dabff187-1aab-4289-8c16-d72e656f93b4"",""incusProject"":""docs-org-docs-project-development"",""kind"":""development"",""name"":""docs-verifier"",""requestId"":""f158561e-ff0e-48f2-b85c-d132ba167da5"",""role"":""fabric-admin""}"
3,2026-10-25T15:45:26.165897Z,token:docs-verifier,docs-verifier,token,project.create,docs-project,success,b11c8b7d-570a-421c-8ffd-f4af9085e4cd,"{""application"":null,""organization"":""9542a736-cc45-4015-98a8-f3206b0451b9"",""project"":""69c3851c-6d02-4784-9bdc-17f7c449d59d""}","{""id"":""69c3851c-6d02-4784-9bdc-17f7c449d59d"",""name"":""docs-verifier"",""requestId"":""b11c8b7d-570a-421c-8ffd-f4af9085e4cd"",""role"":""fabric-admin""}"
2,2026-10-25T15:45:26.158353Z,token:docs-verifier,docs-verifier,token,organization.create,docs-org,success,385c9d8c-f6e8-4108-b830-b79c2ad0c9cb,"{""application"":null,""organization"":""9542a736-cc45-4015-98a8-f3206b0451b9"",""project"":null}","{""id"":""9542a736-cc45-4015-98a8-f3206b0451b9"",""name"":""docs-verifier"",""requestId"":""385c9d8c-f6e8-4108-b830-b79c2ad0c9cb"",""role"":""fabric-admin""}"
1,2026-10-25T15:45:26.003476Z,cli,,cli,token.create,docs-verifier,success,,,"{""expiresInDays"":1,""id"":""726a0075-6258-4585-8ce7-60c829d0b7fc"",""role"":""fabric-admin""}"

```

Content-Type: `application/x-ndjson`.

**Example response** from a test installation; your IDs, names and times differ.

```text
{"id":9,"at":"2026-10-25T15:45:26.305016Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"jsonl","name":"docs-verifier","requestId":"c6731271-c099-4c26-a9c7-2cadbf4397e4","role":"fabric-admin"}}
{"id":8,"at":"2026-10-25T15:45:26.301188Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"audit.exported","target":"audit","outcome":"success","scope":null,"detail":{"filters":{},"format":"csv","name":"docs-verifier","requestId":"f40becf0-a989-46f6-9f13-205b79aadee9","role":"fabric-admin"}}
{"id":7,"at":"2026-10-25T15:45:26.245229Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"application.update","target":"shop","outcome":"success","scope":{"application":"2b123d49-d55a-40f8-b166-11cdf5682888","organization":"9542a736-cc45-4015-98a8-f3206b0451b9","project":"69c3851c-6d02-4784-9bdc-17f7c449d59d"},"detail":{"descriptionChanged":true,"icon":null,"name":"docs-verifier","requestId":"43851f2a-79c5-4d4f-83b3-5135a8eec01f","role":"fabric-admin"}}
{"id":6,"at":"2026-10-25T15:45:26.208646Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"application.create","target":"shop","outcome":"success","scope":{"application":"2b123d49-d55a-40f8-b166-11cdf5682888","organization":"9542a736-cc45-4015-98a8-f3206b0451b9","project":"69c3851c-6d02-4784-9bdc-17f7c449d59d"},"detail":{"environment":"development","icon":"box","name":"docs-verifier","requestId":"7cb9b6bf-01ad-4cc7-81bf-8ddd65b03a44","role":"fabric-admin"}}
{"id":5,"at":"2026-10-25T15:45:26.189916Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"environment.incus_project.prepare","target":"docs-org-docs-project-development","outcome":"success","scope":{"application":null,"organization":"9542a736-cc45-4015-98a8-f3206b0451b9","project":"69c3851c-6d02-4784-9bdc-17f7c449d59d"},"detail":{"detail":"Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions","environment":"dabff187-1aab-4289-8c16-d72e656f93b4","incusProject":"docs-org-docs-project-development","name":"docs-verifier","requestId":"f158561e-ff0e-48f2-b85c-d132ba167da5","role":"fabric-admin","state":"created"}}
{"id":4,"at":"2026-10-25T15:45:26.178648Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"environment.create","target":"development","outcome":"success","scope":{"application":null,"organization":"9542a736-cc45-4015-98a8-f3206b0451b9","project":"69c3851c-6d02-4784-9bdc-17f7c449d59d"},"detail":{"chosenByPlatformAdmin":false,"id":"dabff187-1aab-4289-8c16-d72e656f93b4","incusProject":"docs-org-docs-project-development","kind":"development","name":"docs-verifier","requestId":"f158561e-ff0e-48f2-b85c-d132ba167da5","role":"fabric-admin"}}
{"id":3,"at":"2026-10-25T15:45:26.165897Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"project.create","target":"docs-project","outcome":"success","scope":{"application":null,"organization":"9542a736-cc45-4015-98a8-f3206b0451b9","project":"69c3851c-6d02-4784-9bdc-17f7c449d59d"},"detail":{"id":"69c3851c-6d02-4784-9bdc-17f7c449d59d","name":"docs-verifier","requestId":"b11c8b7d-570a-421c-8ffd-f4af9085e4cd","role":"fabric-admin"}}
{"id":2,"at":"2026-10-25T15:45:26.158353Z","actor":"token:docs-verifier","actorType":"token","actorName":"docs-verifier","action":"organization.create","target":"docs-org","outcome":"success","scope":{"application":null,"organization":"9542a736-cc45-4015-98a8-f3206b0451b9","project":null},"detail":{"id":"9542a736-cc45-4015-98a8-f3206b0451b9","name":"docs-verifier","requestId":"385c9d8c-f6e8-4108-b830-b79c2ad0c9cb","role":"fabric-admin"}}
{"id":1,"at":"2026-10-25T15:45:26.003476Z","actor":"cli","actorType":"cli","actorName":null,"action":"token.create","target":"docs-verifier","outcome":"success","scope":null,"detail":{"expiresInDays":1,"id":"726a0075-6258-4585-8ce7-60c829d0b7fc","role":"fabric-admin"}}

```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

